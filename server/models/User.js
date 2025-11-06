const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const providerSchema = new mongoose.Schema({
  providerId: {
    type: String,
    required: true,
  },
  providerType: {
    type: String,
    enum: ['google', 'github'],
    required: true,
  },
  email: String,
  displayName: String,
  profilePicture: String,
  accessToken: String,
  refreshToken: String,
  linkedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    select: false,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  displayName: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  providers: [providerSchema],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    signupSource: String,
    ipAddress: String,
    userAgent: String,
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ 'providers.providerId': 1, 'providers.providerType': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if provider is linked
userSchema.methods.hasProvider = function(providerType) {
  return this.providers.some(p => p.providerType === providerType);
};

// Add provider
userSchema.methods.addProvider = function(providerData) {
  const existingProvider = this.providers.find(
    p => p.providerId === providerData.providerId && p.providerType === providerData.providerType
  );
  
  if (!existingProvider) {
    this.providers.push(providerData);
  } else {
    // Update existing provider
    Object.assign(existingProvider, providerData);
  }
};

// Remove provider
userSchema.methods.removeProvider = function(providerType) {
  this.providers = this.providers.filter(p => p.providerType !== providerType);
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token, expiresIn) {
  const expiresAt = new Date(Date.now() + expiresIn);
  this.refreshTokens.push({ token, expiresAt });
  
  // Clean up expired tokens
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
