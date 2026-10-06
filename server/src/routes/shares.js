const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const Share = require('../models/Share');
const File = require('../models/File');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { generateShareToken, generateShortCode } = require('../utils/helpers');

const router = express.Router();

// POST /api/shares - Create a new share
router.post('/', auth, async (req, res) => {
  try {
    const {
      fileId,
      recipientEmails = [],
      expiresIn,
      expiresAt: customExpiry,
      password,
      downloadLimit,
      notifyOnDownload = false
    } = req.body;

    // Validate file
    const file = await File.findOne({ _id: fileId, ownerId: req.userId, isDeleted: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!recipientEmails || recipientEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one recipient is required' });
    }

    // Calculate expiry
    let expiresAtDate;
    if (customExpiry) {
      expiresAtDate = new Date(customExpiry);
    } else {
      const expiryMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      expiresAtDate = new Date(Date.now() + (expiryMs[expiresIn] || expiryMs['24h']));
    }

    if (expiresAtDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Expiry time must be in the future' });
    }

    // Find authorized users by email
    const normalizedEmails = recipientEmails.map(e => e.toLowerCase().trim());
    const authorizedUsers = await User.find({ email: { $in: normalizedEmails } });
    const authorizedUserIds = authorizedUsers.map(u => u._id);

    // Hash password if provided
    let passwordHash = null;
    let passwordProtected = false;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(password, salt);
      passwordProtected = true;
    }

    // Generate unique token and short code
    const token = generateShareToken();
    const shortCode = generateShortCode();

    // Create share
    const share = new Share({
      fileId: file._id,
      ownerId: req.userId,
      token,
      shortCode,
      authorizedUsers: authorizedUserIds,
      authorizedEmails: normalizedEmails,
      expiresAt: expiresAtDate,
      passwordHash,
      passwordProtected,
      downloadLimit: downloadLimit || null,
      notifyOnDownload,
      status: 'active'
    });

    await share.save();

    // Populate for response
    await share.populate('authorizedUsers', 'name email');
    await share.populate('fileId', 'fileName fileSize mimeType');

    // Log activity
    await Activity.create({
      userId: req.userId,
      fileId: file._id,
      shareId: share._id,
      action: 'share_created',
      metadata: {
        fileName: file.fileName,
        recipients: normalizedEmails,
        expiresAt: expiresAtDate,
        passwordProtected,
        downloadLimit: downloadLimit || null
      }
    });

    // Log activity for each recipient
    for (const recipientEmail of normalizedEmails) {
      const recipient = authorizedUsers.find(u => u.email === recipientEmail);
      if (recipient) {
        await Activity.create({
          userId: req.userId,
          fileId: file._id,
          shareId: share._id,
          action: 'file_shared',
          metadata: {
            fileName: file.fileName,
            recipientEmail,
            recipientName: recipient.name
          }
        });
      }
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    res.status(201).json({
      success: true,
      data: {
        share,
        shareLink: `${clientUrl}/share/${token}`,
        shortCode
      }
    });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ success: false, message: 'Error creating share' });
  }
});

// GET /api/shares - List user's shares
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = { ownerId: req.userId };
    
    if (status) {
      query.status = status;
    }

    // Update expired shares
    await Share.updateMany(
      { ownerId: req.userId, status: 'active', expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    );

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let shares = await Share.find(query)
      .populate('fileId', 'fileName fileSize mimeType originalName')
      .populate('authorizedUsers', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      shares = shares.filter(s => 
        s.fileId?.fileName?.toLowerCase().includes(searchLower) ||
        s.authorizedEmails?.some(e => e.includes(searchLower))
      );
    }

    const total = await Share.countDocuments(query);

    res.json({
      success: true,
      data: {
        shares,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ success: false, message: 'Error fetching shares' });
  }
});

// GET /api/shares/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, ownerId: req.userId })
      .populate('fileId', 'fileName fileSize mimeType originalName')
      .populate('authorizedUsers', 'name email');

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    // Check and update status
    if (share.status === 'active' && new Date() > share.expiresAt) {
      share.status = 'expired';
      await share.save();
    }

    res.json({ success: true, data: { share } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching share details' });
  }
});

// POST /api/shares/:id/revoke
router.post('/:id/revoke', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, ownerId: req.userId });
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    if (share.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Share is not active' });
    }

    share.status = 'revoked';
    await share.save();

    // Log activity
    const file = await File.findById(share.fileId);
    await Activity.create({
      userId: req.userId,
      fileId: share.fileId,
      shareId: share._id,
      action: 'share_revoked',
      metadata: { fileName: file?.fileName }
    });

    res.json({ success: true, message: 'Access revoked successfully', data: { share } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error revoking access' });
  }
});

// DELETE /api/shares/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const share = await Share.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }
    res.json({ success: true, message: 'Share deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting share' });
  }
});

module.exports = router;
