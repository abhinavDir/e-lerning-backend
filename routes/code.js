const express = require('express');
const router = express.Router();
const codeService = require('../services/codeService');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

// POST /api/code/run - Execute user code
router.post('/run', auth, async (req, res) => {
  try {
    const { language, version, code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const result = await codeService.executeCode(language, version, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/code/review - AI Review for Playground
router.post('/review', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const review = await aiService.reviewCode(code);
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
