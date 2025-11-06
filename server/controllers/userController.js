const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const { logger } = require('../utils/logger');

class UserController {
  // Get user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, displayName } = req.body;

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (displayName !== undefined) user.displayName = displayName;

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get linked providers
  async getLinkedProviders(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      const providers = user.providers.map(p => ({
        providerType: p.providerType,
        email: p.email,
        displayName: p.displayName,
        linkedAt: p.linkedAt,
      }));

      res.json({
        success: true,
        data: { providers },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get auth logs
  async getAuthLogs(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;

      const logs = await AuthLog.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('-userId -__v');

      const total = await AuthLog.countDocuments({ userId: req.user._id });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role (admin only)
  async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'moderator'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role',
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.role = role;
      await user.save();

      logger.info(`Role updated for user ${user.email} to ${role} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const { limit = 50, skip = 0, search = '', role } = req.query;

      const query = {};
      
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { displayName: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        query.role = role;
      }

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user account
  async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await user.deleteOne();

      logger.info(`Account deleted for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
