const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  storageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
fileSchema.index({ ownerId: 1, createdAt: -1 });
fileSchema.index({ fileName: 'text', originalName: 'text' });

module.exports = mongoose.model('File', fileSchema);
