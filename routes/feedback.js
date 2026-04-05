const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { auth } = require('../middleware/auth');

// Submit feedback (Student)
router.post('/submit', auth, async (req, res) => {
  try {
    const { courseId, instructorId, content, rating } = req.body;
    const feedback = new Feedback({
      courseId,
      userId: req.user._id,
      instructorId,
      content,
      rating
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback for instructor (Instructor)
router.get('/instructor/me', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ instructorId: req.user._id })
      .populate('userId', 'name avatar')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
