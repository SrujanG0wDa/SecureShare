const express = require('express');
const { auth } = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

// GET /api/activity
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 30, fileId } = req.query;
    
    const query = { userId: req.userId };
    if (fileId) {
      query.fileId = fileId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('fileId', 'fileName originalName')
        .populate('userId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Activity.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching activity' });
  }
});

module.exports = router;
