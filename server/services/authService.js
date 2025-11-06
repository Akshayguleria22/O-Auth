const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const { generateTokenPair, verifyToken, getTokenExpiry, JWT_REFRESH_EXPIRE } = require('../utils/jwt');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  // Register new user
  async register(userData, metadata = {}) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const user = new User({
        ...userData,
        metadata: {
          ...metadata,
          signupSource: metadata.signupSource || 'local',
        },
      });

      await user.save();

      // Log registration
      await AuthLog.logEvent({
        userId: user._id,
        email: user.email,
        action: 'register',
        provider: 'local',
        success: true,
        correlationId: uuidv4(),
        ...metadata,
      });

      logger.info(`User registered: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password, metadata = {}) {
    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        await AuthLog.logEvent({
          email,
          action: 'failed_login',
          provider: 'local',
          success: false,
          errorMessage: 'Invalid credentials',
          correlationId: uuidv4(),
          ...metadata,
        });
        
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is inactive');
      }

      user.updateLastLogin();
      await user.save();

      const tokens = generateTokenPair(user);

      // Store refresh token
      const refreshExpiry = getTokenExpiry(JWT_REFRESH_EXPIRE);
      user.addRefreshToken(tokens.refreshToken, refreshExpiry);
      await user.save();

      // Log successful login
      await AuthLog.logEvent({
        userId: user._id,
        email: user.email,
        action: 'login',
        provider: 'local',
        success: true,
        correlationId: uuidv4(),
        ...metadata,
      });

      logger.info(`User logged in: ${user.email}`);
      
      return {
        user: user.toJSON(),
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // OAuth login or register
  async oauthLogin(provider, profile, tokens, metadata = {}) {
    try {
      const correlationId = uuidv4();
      
      // Try to find user by provider ID
      let user = await User.findOne({
        'providers.providerId': profile.providerId,
        'providers.providerType': provider,
      });

      // If not found, try to find by email
      if (!user && profile.email) {
        user = await User.findOne({ email: profile.email });
        
        if (user) {
          // Link provider to existing account
          user.addProvider({
            providerId: profile.providerId,
            providerType: provider,
            email: profile.email,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });

          await user.save();

          await AuthLog.logEvent({
            userId: user._id,
            email: user.email,
            action: 'link_provider',
            provider,
            success: true,
            correlationId,
            ...metadata,
          });

          logger.info(`Linked ${provider} to existing user: ${user.email}`);
        }
      }

      // Create new user if not found
      if (!user) {
        user = new User({
          email: profile.email || `${provider}_${profile.providerId}@oauth.local`,
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          profilePicture: profile.profilePicture,
          isEmailVerified: profile.emailVerified || false,
          providers: [{
            providerId: profile.providerId,
            providerType: provider,
            email: profile.email,
            displayName: profile.displayName,
            profilePicture: profile.profilePicture,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }],
          metadata: {
            signupSource: provider,
            ...metadata,
          },
        });

        await user.save();

        await AuthLog.logEvent({
          userId: user._id,
          email: user.email,
          action: 'oauth_register',
          provider,
          success: true,
          correlationId,
          ...metadata,
        });

        logger.info(`New user created via ${provider}: ${user.email}`);
      } else {
        // Update existing provider info
        const providerData = user.providers.find(p => p.providerType === provider);
        if (providerData) {
          providerData.accessToken = tokens.accessToken;
          providerData.refreshToken = tokens.refreshToken;
          providerData.displayName = profile.displayName;
          providerData.profilePicture = profile.profilePicture;
          providerData.linkedAt = new Date();
        }

        user.updateLastLogin();
        await user.save();

        await AuthLog.logEvent({
          userId: user._id,
          email: user.email,
          action: 'oauth_login',
          provider,
          success: true,
          correlationId,
          ...metadata,
        });

        logger.info(`User logged in via ${provider}: ${user.email}`);
      }

      // Generate JWT tokens
      const jwtTokens = generateTokenPair(user);

      // Store refresh token
      const refreshExpiry = getTokenExpiry(JWT_REFRESH_EXPIRE);
      user.addRefreshToken(jwtTokens.refreshToken, refreshExpiry);
      await user.save();

      return {
        user: user.toJSON(),
        tokens: jwtTokens,
      };
    } catch (error) {
      logger.error('OAuth login error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const decoded = verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
      
      if (!tokenExists) {
        throw new Error('Invalid refresh token');
      }

      // Generate new token pair
      const tokens = generateTokenPair(user);

      // Replace old refresh token with new one
      user.removeRefreshToken(refreshToken);
      const refreshExpiry = getTokenExpiry(JWT_REFRESH_EXPIRE);
      user.addRefreshToken(tokens.refreshToken, refreshExpiry);
      await user.save();

      await AuthLog.logEvent({
        userId: user._id,
        email: user.email,
        action: 'token_refresh',
        success: true,
        correlationId: uuidv4(),
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(userId, refreshToken) {
    try {
      const user = await User.findById(userId);

      if (user && refreshToken) {
        user.removeRefreshToken(refreshToken);
        await user.save();
      }

      await AuthLog.logEvent({
        userId,
        action: 'logout',
        success: true,
        correlationId: uuidv4(),
      });

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  // Link provider to existing account
  async linkProvider(userId, provider, profile, tokens) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check if provider already linked
      if (user.hasProvider(provider)) {
        throw new Error(`${provider} account already linked`);
      }

      // Check if this provider account is already linked to another user
      const existingLink = await User.findOne({
        'providers.providerId': profile.providerId,
        'providers.providerType': provider,
      });

      if (existingLink && existingLink._id.toString() !== userId) {
        throw new Error('This account is already linked to another user');
      }

      user.addProvider({
        providerId: profile.providerId,
        providerType: provider,
        email: profile.email,
        displayName: profile.displayName,
        profilePicture: profile.profilePicture,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      await user.save();

      await AuthLog.logEvent({
        userId: user._id,
        email: user.email,
        action: 'link_provider',
        provider,
        success: true,
        correlationId: uuidv4(),
      });

      logger.info(`Linked ${provider} to user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Link provider error:', error);
      throw error;
    }
  }

  // Unlink provider from account
  async unlinkProvider(userId, provider) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new Error('User not found');
      }

      // Check if provider is linked
      if (!user.hasProvider(provider)) {
        throw new Error(`${provider} account not linked`);
      }

      // Ensure user has password or at least one other provider
      if (!user.password && user.providers.length <= 1) {
        throw new Error('Cannot unlink last authentication method. Please set a password first.');
      }

      user.removeProvider(provider);
      await user.save();

      await AuthLog.logEvent({
        userId: user._id,
        email: user.email,
        action: 'unlink_provider',
        provider,
        success: true,
        correlationId: uuidv4(),
      });

      logger.info(`Unlinked ${provider} from user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Unlink provider error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
