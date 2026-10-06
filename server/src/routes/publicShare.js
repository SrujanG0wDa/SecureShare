const express = require('express');
const bcrypt = require('bcryptjs');
const { optionalAuth } = require('../middleware/auth');
const Share = require('../models/Share');
const File = require('../models/File');
const Download = require('../models/Download');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router();

// Helper to extract clean 64-char hex token
const extractCleanToken = (req) => {
  const raw = (req.params.token || '') + (req.params[0] || '');
  return raw.replace(/[^a-f0-9]/gi, '');
};

// 1. GET /api/share/:token/download - Download shared file (Must come BEFORE GET /:token)
router.get('/:token/download', optionalAuth, async (req, res) => {
  try {
    const cleanToken = extractCleanToken(req);
    const share = await Share.findOne({ token: cleanToken }).populate('fileId');

    if (!share || !share.fileId) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }

    // Verify all access conditions
    const accessibility = share.isAccessible();
    if (!accessibility.accessible) {
      const messages = {
        revoked: 'The owner has revoked access to this file.',
        expired: 'This share link has expired.',
        limit_reached: 'The maximum number of downloads has been reached.'
      };
      if (share.isModified('status')) await share.save();
      return res.status(403).json({
        success: false,
        message: messages[accessibility.reason] || 'Access denied',
        status: accessibility.reason
      });
    }

    // Check user authorization
    if (req.user) {
      const isAuthorized = share.authorizedEmails.includes(req.user.email) ||
        share.authorizedUsers.some(u => u.toString() === req.userId.toString()) ||
        share.ownerId.toString() === req.userId.toString();

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to download this file.',
          status: 'unauthorized'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to download files.'
      });
    }

    // Verify password if needed (check header)
    if (share.passwordProtected) {
      const sharePassword = req.headers['x-share-password'];
      if (!sharePassword) {
        return res.status(401).json({
          success: false,
          message: 'Password required',
          passwordRequired: true
        });
      }
      const isMatch = await bcrypt.compare(sharePassword, share.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Increment download count
    share.downloadCount += 1;
    if (share.downloadLimit && share.downloadCount >= share.downloadLimit) {
      share.status = 'limit_reached';
    }
    await share.save();

    // Record download
    await Download.create({
      fileId: share.fileId._id,
      shareId: share._id,
      userId: req.userId,
      userEmail: req.user?.email,
      downloadedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Log activity for the file owner
    await Activity.create({
      userId: share.ownerId,
      fileId: share.fileId._id,
      shareId: share._id,
      action: 'file_downloaded',
      metadata: {
        fileName: share.fileId.fileName,
        downloadedBy: req.user?.email || 'Unknown',
        downloadCount: share.downloadCount,
        downloadLimit: share.downloadLimit
      }
    });

    // Return download URL
    res.json({
      success: true,
      data: {
        downloadUrl: share.fileId.storageUrl,
        fileName: share.fileId.originalName
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Error processing download' });
  }
});

// 2. POST /api/share/:token/verify - Verify password (Must come BEFORE GET /:token)
router.post('/:token/verify', optionalAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const cleanToken = extractCleanToken(req);
    const share = await Share.findOne({ token: cleanToken });

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    if (!share.passwordProtected) {
      return res.json({ success: true, data: { verified: true } });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const isMatch = await bcrypt.compare(password, share.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, data: { verified: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying password' });
  }
});

// 3. GET /api/share/:token - Get share info (public)
router.get('/:token', optionalAuth, async (req, res) => {
  try {
    const cleanToken = extractCleanToken(req);
    const share = await Share.findOne({ token: cleanToken })
      .populate('fileId', 'fileName fileSize mimeType')
      .populate('ownerId', 'name');

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }

    // Check status
    if (share.status === 'revoked') {
      return res.status(403).json({
        success: false,
        message: 'Access Revoked',
        detail: 'The owner has revoked access to this file.',
        status: 'revoked'
      });
    }

    if (share.status === 'limit_reached') {
      return res.status(403).json({
        success: false,
        message: 'Download Limit Reached',
        detail: 'The maximum number of downloads has been reached.',
        status: 'limit_reached'
      });
    }

    // Check expiry
    if (new Date() > share.expiresAt) {
      if (share.status === 'active') {
        share.status = 'expired';
        await share.save();
      }
      return res.status(403).json({
        success: false,
        message: 'Link Expired',
        detail: 'This share link has expired.',
        status: 'expired'
      });
    }

    // Check download limit
    if (share.downloadLimit && share.downloadCount >= share.downloadLimit) {
      share.status = 'limit_reached';
      await share.save();
      return res.status(403).json({
        success: false,
        message: 'Download Limit Reached',
        detail: 'The maximum number of downloads has been reached.',
        status: 'limit_reached'
      });
    }

    // Check authorization
    if (req.user) {
      const isAuthorized = share.authorizedEmails.includes(req.user.email) ||
        share.authorizedUsers.some(u => u.toString() === req.userId.toString()) ||
        share.ownerId._id.toString() === req.userId.toString();

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied',
          detail: 'You are not authorized to access this file.',
          status: 'unauthorized'
        });
      }
    }

    // Return share info
    res.json({
      success: true,
      data: {
        share: {
          _id: share._id,
          fileName: share.fileId?.fileName,
          fileSize: share.fileId?.fileSize,
          mimeType: share.fileId?.mimeType,
          sharedBy: share.ownerId?.name,
          passwordProtected: share.passwordProtected,
          expiresAt: share.expiresAt,
          downloadLimit: share.downloadLimit,
          downloadCount: share.downloadCount,
          status: share.status,
          requiresAuth: !req.user || (!share.authorizedEmails.includes(req.user?.email) &&
            !share.authorizedUsers.some(u => u.toString() === req.userId?.toString()) &&
            share.ownerId._id.toString() !== req.userId?.toString())
        }
      }
    });
  } catch (error) {
    console.error('Get share error:', error);
    res.status(500).json({ success: false, message: 'Error accessing share' });
  }
});

module.exports = router;
