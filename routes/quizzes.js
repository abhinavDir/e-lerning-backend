const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const { createQuiz } = require('../utils/adaptive');

// Get Quiz by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
        // Fallback or session-based quiz check?
        // For now just 404
        return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error('Quiz fetch error:', err);
    res.status(500).json({ error: 'Could not fetch quiz. Progress tracking might be disabled.' });
  }
});

// Create Quiz for Topic
router.post('/generate', auth, async (req, res) => {
  try {
    const { topicId, difficulty = 'Medium' } = req.body;
    const userId = req.user;
    if (!topicId || !userId) return res.status(400).json({ error: 'Topic ID and User ID required' });

    const quiz = await createQuiz(topicId, difficulty, userId);
    if (!quiz) return res.status(500).json({ error: 'Failed to generate quiz' });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Quiz Result
router.post('/submit', auth, async (req, res) => {
  try {
    const { quizId, answers, timeSpent, confidenceLevel } = req.body;
    const userId = req.user;
    if (!quizId || !userId || !answers) return res.status(400).json({ error: 'All fields required' });

    const quiz = await Quiz.findById(quizId).populate('topicId');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Calculate score
    let score = 0;
    const totalQuestions = quiz.questions.length;
    answers.forEach((ans, idx) => {
      if (ans === quiz.questions[idx].correctAnswer) score++;
    });

    const accuracy = score / totalQuestions;
    
    // Update Progress
    let progress = await Progress.findOne({ userId, topicId: quiz.topicId._id });
    if (!progress) {
      progress = new Progress({ userId, topicId: quiz.topicId._id });
    }

    // Add attempt
    progress.attempts.push({
      quizId,
      score,
      totalQuestions,
      accuracy,
      timeSpent,
      difficulty: quiz.difficulty,
      confidenceLevel,
      date: new Date()
    });

    // Update Mastery Score (Topic-Based)
    // Simple logic: Mastery = (Average Accuracy of last 3 attempts) * 100
    const lastAttempts = progress.attempts.slice(-3);
    const avgAccuracy = lastAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / lastAttempts.length;
    progress.masteryScore = Math.round(avgAccuracy * 100);
    progress.lastAttemptAt = new Date();

    await progress.save();

    const feedback = accuracy >= 0.8 ? 
      "Excellent mastery! You show deep understanding of the core concepts. Focus on hard-level challenges to push further." : 
      accuracy >= 0.5 ? 
      "Good effort! You've grasped basic principles but need more practice on specific variations. Review the detailed explanation." : 
      "Keep practicing! Every expert was once a beginner. Re-read the key points and try an easier quiz level next.";

    res.json({
      score,
      totalQuestions,
      accuracy,
      masteryScore: progress.masteryScore,
      feedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
