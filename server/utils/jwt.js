const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Generate access token
const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    type: 'access',
    jti: uuidv4(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRE,
  });
};

// Generate refresh token
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    type: 'refresh',
    jti: uuidv4(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

// Generate both tokens
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Decode token without verification
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Get token expiry time in milliseconds
const getTokenExpiry = (expiresIn) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default 15 minutes

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken,
  getTokenExpiry,
  JWT_REFRESH_EXPIRE,
};
