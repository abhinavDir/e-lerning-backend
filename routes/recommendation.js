const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');
const { auth } = require('../middleware/auth');

// GET /api/recommendations/me - View current user's courses to improve
router.get('/me', auth, async (req, res) => {
  try {
    const recommendations = await recommendationService.getRecommendations(req.user.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recommendations/:userId - Fetch personalized course recommendations
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to view these recommendations' });

    const recommendations = await recommendationService.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
