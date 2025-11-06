const authService = require('../services/authService');
const oauthService = require('../services/oauthService');
const { generatePKCE, generateState, buildAuthorizationURL, validateState } = require('../config/oauth');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Store for PKCE and state (in production, use Redis)
const pkceStore = new Map();
const stateStore = new Map();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now > value.expiresAt) {
      pkceStore.delete(key);
    }
  }
  for (const [key, value] of stateStore.entries()) {
    if (now > value.expiresAt) {
      stateStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

class AuthController {
  // Register
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const user = await authService.register(
        { email, password, firstName, lastName },
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Set cookies
      this.setAuthCookies(res, result.tokens);

      res.json({
        success: true,
        message: 'Login successful',
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (req.user) {
        await authService.logout(req.user._id, refreshToken);
      }

      this.clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found',
        });
      }

      const tokens = await authService.refreshToken(refreshToken);
      
      this.setAuthCookies(res, tokens);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      this.clearAuthCookies(res);
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      res.json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Initiate OAuth flow
  async initiateOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const { redirectPath = '/' } = req.query;

      if (!oauthService.isValidProvider(provider)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OAuth provider',
        });
      }

      // Generate PKCE
      const pkce = generatePKCE();
      const state = generateState();
      const correlationId = uuidv4();

      // Store PKCE and state (expires in 10 minutes)
      const expiresAt = Date.now() + 10 * 60 * 1000;
      pkceStore.set(state, {
        codeVerifier: pkce.codeVerifier,
        provider,
        expiresAt,
        correlationId,
      });
      
      stateStore.set(state, {
        redirectPath,
        expiresAt,
        correlationId,
      });

      // Build authorization URL
      const authUrl = buildAuthorizationURL(provider, state, pkce.codeChallenge, redirectPath);

      logger.info(`OAuth flow initiated for ${provider}`, { correlationId });

      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  // OAuth callback
  async oauthCallback(req, res, next) {
    const { provider } = req.params;
    
    try {
      const { code, state: stateParam, error, error_description } = req.query;

      // Handle OAuth errors
      if (error) {
        logger.warn(`OAuth error for ${provider}:`, error);
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/error?error=${encodeURIComponent(error_description || error)}`
        );
      }

      if (!code || !stateParam) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/error?error=Missing authorization code or state`
        );
      }

      // Parse state
      let parsedState;
      try {
        parsedState = JSON.parse(stateParam);
      } catch {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/error?error=Invalid state parameter`
        );
      }

      const { state, redirectPath } = parsedState;

      // Retrieve and validate PKCE
      const pkceData = pkceStore.get(state);
      const stateData = stateStore.get(state);

      if (!pkceData || !stateData) {
        logger.warn('Invalid or expired OAuth state');
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/error?error=Invalid or expired session`
        );
      }

      // Clean up used state
      pkceStore.delete(state);
      stateStore.delete(state);

      // Validate provider matches
      if (pkceData.provider !== provider) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/error?error=Provider mismatch`
        );
      }

      // Exchange code for token
      const tokens = await oauthService.exchangeCodeForToken(
        provider,
        code,
        pkceData.codeVerifier
      );

      // Get user profile
      const profile = await oauthService.getUserProfile(provider, tokens.accessToken);

      // Login or register user
      const result = await authService.oauthLogin(provider, profile, tokens, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        correlationId: pkceData.correlationId,
      });

      // Set cookies
      this.setAuthCookies(res, result.tokens);

      // Redirect to client
      const redirectUrl = `${process.env.CLIENT_URL}${redirectPath || '/dashboard'}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error(`OAuth callback error for ${provider}:`, error);
      res.redirect(
        `${process.env.CLIENT_URL}/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // Link provider to account
  async linkProvider(req, res, next) {
    try {
      const { provider } = req.params;

      if (!oauthService.isValidProvider(provider)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OAuth provider',
        });
      }

      // Check if already linked
      if (req.user.hasProvider(provider)) {
        return res.status(400).json({
          success: false,
          message: `${provider} account already linked`,
        });
      }

      // Generate PKCE and state
      const pkce = generatePKCE();
      const state = generateState();
      const correlationId = uuidv4();

      // Store with user ID for linking
      const expiresAt = Date.now() + 10 * 60 * 1000;
      pkceStore.set(state, {
        codeVerifier: pkce.codeVerifier,
        provider,
        userId: req.user._id.toString(),
        action: 'link',
        expiresAt,
        correlationId,
      });

      // Build authorization URL
      const authUrl = buildAuthorizationURL(provider, state, pkce.codeChallenge);

      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  // Unlink provider from account
  async unlinkProvider(req, res, next) {
    try {
      const { provider } = req.params;

      const user = await authService.unlinkProvider(req.user._id, provider);

      res.json({
        success: true,
        message: `${provider} account unlinked successfully`,
        data: { user: user.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  }

  // Set auth cookies
  setAuthCookies(res, tokens) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // Clear auth cookies
  clearAuthCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }
}

module.exports = new AuthController();
