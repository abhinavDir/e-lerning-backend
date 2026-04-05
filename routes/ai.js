const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { askAI } = require('../controllers/aiController');

// Helper for local file DB
const roadmapsFilePath = path.join(__dirname, '../data/roadmaps.json');

const getRoadmaps = () => {
  if (!fs.existsSync(roadmapsFilePath)) return [];
  try {
    const data = fs.readFileSync(roadmapsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveRoadmaps = (roadmaps) => {
  fs.writeFileSync(roadmapsFilePath, JSON.stringify(roadmaps, null, 2));
};

// Legacy AI route
router.post('/ask', auth, askAI);

// POST /api/ai/path - Generate learning path
router.post('/path', auth, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Please provide a learning goal' });

    console.log(`\n🤖 SYSTEM: Received request to generate path for: ${goal}`);

    // Generate Path via Neural Engine
    const curriculum = await aiService.generateLearningPath(goal);
    
    // Store locally to prevent 500 DB errors
    const roadmaps = getRoadmaps();
    
    // Remote stale data for this user to avoid duplicates
    const filteredRoadmaps = roadmaps.filter(r => r.userId !== req.user.id || r.goal !== goal);

    const roadmap = {
      id: Date.now().toString(),
      userId: req.user.id,
      goal,
      curriculum,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    filteredRoadmaps.push(roadmap);
    saveRoadmaps(filteredRoadmaps);

    console.log(`✅ MISSION DATA PERSISTED LOCALLY [LOCAL NEURAL DB]`);
    res.status(201).json(roadmap);
  } catch (error) {
    console.error(`AI Path Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/path/me - View current roadmap
router.get('/path/me', auth, (req, res) => {
  try {
    const roadmaps = getRoadmaps();
    // Get the most recent active roadmap for this user
    const userRoadmaps = roadmaps
      .filter(r => r.userId === req.user.id && r.status === 'Active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (userRoadmaps.length === 0) return res.status(404).json({ error: 'No active roadmap found' });
    
    res.json(userRoadmaps[0]);
  } catch (error) {
    console.error(`AI Fetch Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/code/review - AI Code Review
router.post('/code/review', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const review = await aiService.reviewCode(code);
    res.json({ review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
