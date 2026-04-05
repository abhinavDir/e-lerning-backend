const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

// POST /api/chat - Generic AI Chat Interaction
router.post('/', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message content is required' });

    const reply = await aiService.chatResponse(message, history || []);
    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: 'Assistant is momentarily busy. Please try again.' });
  }
});

module.exports = router;
