const express = require('express');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile, deleteFile } = require('../services/storage');
const File = require('../models/File');
const Share = require('../models/Share');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Download = require('../models/Download');

const router = express.Router();

// POST /api/files/upload
router.post('/upload', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadFile(req.file.buffer, {
      resource_type: 'raw',
      public_id: `secure-share/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    });

    // Save file metadata to MongoDB
    const file = new File({
      ownerId: req.userId,
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      storageUrl: result.url,
      publicId: result.publicId
    });

    await file.save();

    // Update user storage
    await User.findByIdAndUpdate(req.userId, {
      $inc: { storageUsed: req.file.size }
    });

    // Log activity
    await Activity.create({
      userId: req.userId,
      fileId: file._id,
      action: 'file_uploaded',
      metadata: { fileName: file.fileName, fileSize: file.fileSize }
    });

    res.status(201).json({
      success: true,
      data: { file }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// GET /api/files
router.get('/', auth, async (req, res) => {
  try {
    const { search, type, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    const query = { ownerId: req.userId, isDeleted: false };
    
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.mimeType = { $regex: type, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [files, total] = await Promise.all([
      File.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      File.countDocuments(query)
    ]);

    // Get share counts for each file
    const fileIds = files.map(f => f._id);
    const shareCounts = await Share.aggregate([
      { $match: { fileId: { $in: fileIds } } },
      { $group: { _id: '$fileId', count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } }
    ]);

    const shareCountMap = {};
    shareCounts.forEach(sc => {
      shareCountMap[sc._id.toString()] = { total: sc.count, active: sc.activeCount };
    });

    const filesWithShares = files.map(f => ({
      ...f.toObject(),
      shareCount: shareCountMap[f._id.toString()]?.total || 0,
      activeShareCount: shareCountMap[f._id.toString()]?.active || 0
    }));

    res.json({
      success: true,
      data: {
        files: filesWithShares,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, message: 'Error fetching files' });
  }
});

// GET /api/files/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.userId, isDeleted: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const shares = await Share.find({ fileId: file._id })
      .populate('authorizedUsers', 'name email')
      .sort('-createdAt');

    const downloads = await Download.find({ fileId: file._id })
      .populate('userId', 'name email')
      .sort('-downloadedAt')
      .limit(50);

    res.json({
      success: true,
      data: { file, shares, downloads }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching file details' });
  }
});

// DELETE /api/files/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.userId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Soft delete
    file.isDeleted = true;
    await file.save();

    // Revoke all active shares
    await Share.updateMany(
      { fileId: file._id, status: 'active' },
      { status: 'revoked' }
    );

    // Update user storage
    await User.findByIdAndUpdate(req.userId, {
      $inc: { storageUsed: -file.fileSize }
    });

    // Try to delete from Cloudinary
    try {
      await deleteFile(file.publicId);
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }

    // Log activity
    await Activity.create({
      userId: req.userId,
      fileId: file._id,
      action: 'file_deleted',
      metadata: { fileName: file.fileName }
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

// GET /api/files/:id/download - Owner download
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.userId, isDeleted: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({
      success: true,
      data: {
        downloadUrl: file.storageUrl,
        fileName: file.originalName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting download URL' });
  }
});

// GET /api/files/:id/activity
router.get('/:id/activity', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.userId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const activities = await Activity.find({ fileId: file._id })
      .populate('userId', 'name email')
      .sort('-createdAt')
      .limit(100);

    res.json({ success: true, data: { activities } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching activity' });
  }
});

module.exports = router;
