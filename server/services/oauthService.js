const axios = require('axios');
const crypto = require('crypto');
const { oauthConfig } = require('../config/oauth');
const { logger } = require('../utils/logger');

class OAuthService {
  // Exchange authorization code for tokens
  async exchangeCodeForToken(provider, code, codeVerifier, redirectUri) {
    try {
      const config = oauthConfig[provider];
      
      const params = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri || config.callbackURL,
      };

      // Only add PKCE for providers that support it (Google)
      if (provider === 'google') {
        params.grant_type = config.grantType;
        params.code_verifier = codeVerifier;
      }

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // GitHub requires Accept header
      if (provider === 'github') {
        headers['Accept'] = 'application/json';
      }

      const response = await axios.post(config.tokenURL, 
        new URLSearchParams(params), 
        { headers }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };
    } catch (error) {
      logger.error(`${provider} token exchange error:`, error.response?.data || error.message);
      throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Get user profile from provider
  async getUserProfile(provider, accessToken) {
    try {
      const config = oauthConfig[provider];
      let userInfoURL = config.userInfoURL;
      
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // GitHub requires User-Agent header
      if (provider === 'github') {
        headers['User-Agent'] = 'OAuth2-App';
        headers['Accept'] = 'application/json';
      }

      const response = await axios.get(userInfoURL, { headers });

      // GitHub requires separate call to get email if not public
      if (provider === 'github' && !response.data.email) {
        const emailResponse = await axios.get(config.userEmailURL, { headers });
        const primaryEmail = emailResponse.data.find(email => email.primary && email.verified);
        response.data.email = primaryEmail ? primaryEmail.email : emailResponse.data[0]?.email;
      }

      return this.normalizeUserProfile(provider, response.data);
    } catch (error) {
      logger.error(`${provider} user profile error:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  // Normalize user profile across providers
  normalizeUserProfile(provider, rawProfile) {
    const normalized = {
      providerId: '',
      email: '',
      firstName: '',
      lastName: '',
      displayName: '',
      profilePicture: '',
      raw: rawProfile,
    };

    switch (provider) {
      case 'google':
        normalized.providerId = rawProfile.id;
        normalized.email = rawProfile.email;
        normalized.firstName = rawProfile.given_name || '';
        normalized.lastName = rawProfile.family_name || '';
        normalized.displayName = rawProfile.name || '';
        normalized.profilePicture = rawProfile.picture || '';
        normalized.emailVerified = rawProfile.verified_email || false;
        break;

      case 'github':
        normalized.providerId = rawProfile.id.toString();
        normalized.email = rawProfile.email || '';
        normalized.firstName = rawProfile.name?.split(' ')[0] || rawProfile.login;
        normalized.lastName = rawProfile.name?.split(' ').slice(1).join(' ') || '';
        normalized.displayName = rawProfile.name || rawProfile.login;
        normalized.profilePicture = rawProfile.avatar_url || '';
        normalized.emailVerified = true; // GitHub emails are verified
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return normalized;
  }

  // Refresh access token
  async refreshAccessToken(provider, refreshToken) {
    try {
      const config = oauthConfig[provider];
      
      const params = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };

      const response = await axios.post(config.tokenURL, 
        new URLSearchParams(params), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      logger.error(`${provider} token refresh error:`, error.response?.data || error.message);
      throw new Error('Failed to refresh token');
    }
  }

  // Revoke token
  async revokeToken(provider, token) {
    try {
      if (provider === 'google') {
        await axios.post(`https://oauth2.googleapis.com/revoke?token=${token}`);
      } else if (provider === 'facebook') {
        const config = oauthConfig[provider];
        await axios.delete(`https://graph.facebook.com/me/permissions`, {
          params: {
            access_token: token,
          },
        });
      }
      
      logger.info(`Successfully revoked ${provider} token`);
    } catch (error) {
      logger.error(`${provider} token revocation error:`, error.message);
      // Don't throw error - revocation is best effort
    }
  }

  // Validate provider
  isValidProvider(provider) {
    return ['google', 'github'].includes(provider);
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = new OAuthService();
