const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');

// Get Dashboard Analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user;
    
    // Check if DB is connected
    const isConnected = require('mongoose').connection.readyState === 1;
    if (!isConnected) {
        return res.json({
            stats: { totalTopics: 0, totalAttempts: 0, avgAccuracy: 0, lastScore: 'N/A' },
            intelligence: { feedback: "Database connection failed. Live tracking is temporarily offline." },
            topicPerformance: [],
            history: []
        });
    }

    const progressList = await Progress.find({ userId }).populate('topicId');
    
    // Filter out entries where topicId was not found (maybe deleted or json mismatch)
    const validProgress = progressList.filter(p => p.topicId);

    const totalTopics = validProgress.length;
    let avgMastery = 0;
    let totalAttempts = 0;
    let totalScore = 0;
    let totalQuestions = 0;
    let weakTopics = [];
    let masteredTopics = [];

    validProgress.forEach(p => {
      avgMastery += p.masteryScore;
      totalAttempts += p.attempts.length;
      p.attempts.forEach(a => {
        totalScore += a.score;
        totalQuestions += a.totalQuestions;
      });

      if (p.masteryScore >= 80) masteredTopics.push(p.topicId.title);
      else if (p.masteryScore <= 40) weakTopics.push(p.topicId.title);
    });

    const averageMastery = totalTopics > 0 ? Math.round(avgMastery / totalTopics) : 0;
    const overallAccuracy = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    const history = [];
    validProgress.forEach(p => {
      p.attempts.forEach(a => {
        history.push({
          date: a.date.toISOString().split('T')[0],
          accuracy: a.accuracy * 100,
          topic: p.topicId.title
        });
      });
    });

    let feedback = "Great overall progress!";
    if (weakTopics.length > 0) {
      feedback = `You're doing great, but your cognitive performance in ${weakTopics[0]} is below the target threshold. Focus on recursion-based concepts and review the "Common Mistakes" section on that topic page.`;
    }

    const lastProgress = [...validProgress].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    const lastAttempt = lastProgress?.attempts?.slice(-1)[0];
    const lastScore = lastAttempt ? `${lastAttempt.score}/${lastAttempt.totalQuestions}` : '0/0';

    res.json({
      stats: {
        totalTopics,
        totalAttempts,
        avgAccuracy: Math.round(overallAccuracy),
        lastScore
      },
      intelligence: {
        weakTopics: weakTopics.slice(0, 3),
        masteredTopics: masteredTopics.slice(0, 3),
        feedback
      },
      topicPerformance: validProgress.map(p => ({
        id: p.topicId._id,
        title: p.topicId.title,
        mastery: p.masteryScore,
        lastAttempt: p.lastAttemptAt
      })),
      history: history.slice(-30).sort((a, b) => new Date(a.date) - new Date(b.date))
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.json({
        stats: { totalTopics: 0, totalAttempts: 0, avgAccuracy: 0, lastScore: 'N/A' },
        intelligence: { feedback: "Error calculating analytics. Please try again later." },
        topicPerformance: [],
        history: []
    });
  }
});

module.exports = router;
