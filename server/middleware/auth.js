const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    req.user = user;
    req.tokenId = decoded.jti;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
    });
  }
};

// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded.type === 'access') {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.tokenId = decoded.jti;
        }
      }
    }
  } catch (error) {
    // Silent fail for optional auth
    logger.debug('Optional auth failed:', error.message);
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
