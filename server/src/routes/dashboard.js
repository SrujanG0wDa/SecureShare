const express = require('express');
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const Share = require('../models/Share');
const Download = require('../models/Download');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Update expired shares first
    await Share.updateMany(
      { ownerId: req.userId, status: 'active', expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    );

    const [
      totalFiles,
      totalShares,
      activeShares,
      totalDownloads,
      user,
      recentActivity,
      recentFiles,
      recentShares,
      sharesByStatus
    ] = await Promise.all([
      File.countDocuments({ ownerId: req.userId, isDeleted: false }),
      Share.countDocuments({ ownerId: req.userId }),
      Share.countDocuments({ ownerId: req.userId, status: 'active' }),
      Download.countDocuments({ fileId: { $in: await File.find({ ownerId: req.userId }).distinct('_id') } }),
      User.findById(req.userId),
      Activity.find({ userId: req.userId })
        .populate('fileId', 'fileName originalName')
        .sort('-createdAt')
        .limit(10),
      File.find({ ownerId: req.userId, isDeleted: false })
        .sort('-createdAt')
        .limit(5),
      Share.find({ ownerId: req.userId })
        .populate('fileId', 'fileName fileSize mimeType')
        .populate('authorizedUsers', 'name email')
        .sort('-createdAt')
        .limit(5),
      Share.aggregate([
        { $match: { ownerId: req.userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Format shares by status
    const statusCounts = { active: 0, expired: 0, revoked: 0, limit_reached: 0 };
    sharesByStatus.forEach(s => {
      statusCounts[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalFiles,
          totalShares,
          activeShares,
          totalDownloads,
          storageUsed: user?.storageUsed || 0,
          statusCounts
        },
        recentActivity,
        recentFiles,
        recentShares
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
