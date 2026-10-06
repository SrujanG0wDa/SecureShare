const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true
  },
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Share',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: {
    type: String,
    default: null
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
});

downloadSchema.index({ fileId: 1, downloadedAt: -1 });
downloadSchema.index({ shareId: 1, downloadedAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
