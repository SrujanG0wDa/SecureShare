const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  shortCode: {
    type: String,
    unique: true,
    sparse: true
  },
  authorizedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  authorizedEmails: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  passwordProtected: {
    type: Boolean,
    default: false
  },
  downloadLimit: {
    type: Number,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  notifyOnDownload: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'limit_reached'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
shareSchema.index({ ownerId: 1, status: 1 });
shareSchema.index({ fileId: 1, status: 1 });
shareSchema.index({ expiresAt: 1, status: 1 });

// Method to check if share is accessible
shareSchema.methods.isAccessible = function() {
  if (this.status === 'revoked') return { accessible: false, reason: 'revoked' };
  if (this.status === 'limit_reached') return { accessible: false, reason: 'limit_reached' };
  if (new Date() > this.expiresAt) {
    this.status = 'expired';
    return { accessible: false, reason: 'expired' };
  }
  if (this.downloadLimit && this.downloadCount >= this.downloadLimit) {
    this.status = 'limit_reached';
    return { accessible: false, reason: 'limit_reached' };
  }
  return { accessible: true };
};

module.exports = mongoose.model('Share', shareSchema);
