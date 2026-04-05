const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  masteryScore: { type: Number, default: 0 },
  attempts: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // in seconds
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    confidenceLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    date: { type: Date, default: Date.now }
  }],
  weaknessAreas: [String],
  repeatedMistakes: [String],
  lastAttemptAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
