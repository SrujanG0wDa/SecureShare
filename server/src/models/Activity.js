const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Share',
    default: null
  },
  action: {
    type: String,
    enum: ['file_uploaded', 'file_deleted', 'file_shared', 'file_downloaded', 'share_revoked', 'share_expired', 'share_created', 'access_denied'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ fileId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
