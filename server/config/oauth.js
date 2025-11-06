const crypto = require('crypto');

const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    userInfoURL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: ['profile', 'email'],
    grantType: 'authorization_code',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URI,
    authorizationURL: 'https://github.com/login/oauth/authorize',
    tokenURL: 'https://github.com/login/oauth/access_token',
    userInfoURL: 'https://api.github.com/user',
    userEmailURL: 'https://api.github.com/user/emails',
    scope: ['user:email', 'read:user'],
    grantType: 'authorization_code',
  },
};

// Generate PKCE code verifier and challenge
const generatePKCE = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
};

// Generate random state
const generateState = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate random nonce
const generateNonce = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Build authorization URL
const buildAuthorizationURL = (provider, state, codeChallenge, redirectPath = '/') => {
  const config = oauthConfig[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackURL,
    response_type: 'code',
    scope: config.scope.join(' '),
    state: JSON.stringify({ state, redirectPath }),
  });

  // Only add PKCE for providers that support it (Google)
  if (provider === 'google') {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  return `${config.authorizationURL}?${params.toString()}`;
};

// Validate callback state
const validateState = (receivedState, storedState) => {
  return receivedState === storedState;
};

module.exports = {
  oauthConfig,
  generatePKCE,
  generateState,
  generateNonce,
  buildAuthorizationURL,
  validateState,
};
