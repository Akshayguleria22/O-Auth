const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  email: {
    type: String,
    index: true,
  },
  action: {
    type: String,
    enum: [
      'login',
      'logout',
      'register',
      'oauth_login',
      'oauth_register',
      'link_provider',
      'unlink_provider',
      'failed_login',
      'token_refresh',
      'token_revoke',
    ],
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
  },
  success: {
    type: Boolean,
    default: true,
    index: true,
  },
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
  correlationId: {
    type: String,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false,
});

// TTL index - automatically delete logs older than 90 days
authLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Static method to log auth events
authLogSchema.statics.logEvent = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

const AuthLog = mongoose.model('AuthLog', authLogSchema);

module.exports = AuthLog;
