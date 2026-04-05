const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

exports.getRecommendations = async (userId) => {
  try {
    // 1. Fetch user progress to identify weaknesses
    const progressDocs = await Progress.find({ userId });
    
    if (!progressDocs.length) {
      // Fallback: If no progress found, suggest popular courses
      return await Course.find({}).limit(4).lean();
    }

    // 2. Identify weak topics (accuracy < 60%) or explicitly tagged weaknessAreas
    const weakTopics = [];
    progressDocs.forEach(doc => {
      doc.attempts.forEach(attempt => {
        if (attempt.accuracy < 0.6) { // Weak topic: accuracy below threshold
          // In your system topicIds correlate with specific learning subjects
          weakTopics.push(doc.topicId); 
        }
      });
      // Plus explicitly tagged areas
      if (doc.weaknessAreas && doc.weaknessAreas.length > 0) {
        weakTopics.push(...doc.weaknessAreas);
      }
    });

    // 3. Match weak areas with course categories or tags
    // Suggesting based on category/title similarity
    // We fetch courses that might help with identification
    const recommendations = await Course.find({
      $or: [
        { category: { $in: weakTopics } }, 
        { title: { $regex: weakTopics.join('|'), $options: 'i' } }
      ]
    }).limit(4).lean();

    return recommendations.length ? recommendations : await Course.find({}).limit(2).lean();
  } catch (error) {
    throw new Error('Recommendations failed: ' + error.message);
  }
};
