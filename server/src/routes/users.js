const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/search - Search users by email for recipient selection
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { users: [] } });
    }

    const users = await User.find({
      email: { $regex: q, $options: 'i' },
      _id: { $ne: req.userId } // Exclude current user
    })
    .select('name email')
    .limit(10);

    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching users' });
  }
});

module.exports = router;
