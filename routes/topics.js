const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Helper to Load Topics
const loadTopics = () => {
    const data = fs.readFileSync(path.join(__dirname, '../data/topics.json'), 'utf-8');
    return JSON.parse(data);
};

// Get all topics
router.get('/', auth, (req, res) => {
  try {
    const topics = loadTopics();
    const formatted = topics.map((t, i) => ({
        _id: t.id || i.toString(),
        title: t.title,
        description: t.summary,
        category: t.category || "Engineering",
        level: t.level
    }));
    res.json(formatted);
  } catch (err) {
    console.error('GET /api/topics error:', err);
    res.status(500).json({ error: 'Internal Server Error fetching curriculum' });
  }
});

// Search Topic
router.get('/search', auth, (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();
    const topics = loadTopics();
    const topic = topics.find(t => t.title.toLowerCase() === query || t.title.toLowerCase().includes(query));
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not available. Please try another topic.' });
    }

    res.json({
        _id: topic.id || topic.title,
        title: topic.title,
        description: topic.summary,
        level: topic.level,
        content: {
            overview: topic.summary,
            keyPoints: topic.keyPoints,
            detailedExplanation: topic.explanation,
            realWorldExamples: Array.isArray(topic.example) ? topic.example : [topic.example]
        }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single topic by ID
router.get('/:id', auth, (req, res) => {
  try {
    const id = req.params.id;
    const topics = loadTopics();
    const topic = topics.find(t => t.title === id || t.title.toLowerCase() === id.toLowerCase());

    if (!topic) {
      return res.status(404).json({ error: 'Topic not available' });
    }

    res.json({
        _id: topic.title,
        title: topic.title,
        description: topic.summary,
        level: topic.level,
        content: {
            overview: topic.summary,
            keyPoints: topic.keyPoints,
            detailedExplanation: topic.explanation,
            realWorldExamples: Array.isArray(topic.example) ? topic.example : [topic.example]
        }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
