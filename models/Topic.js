const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: {
    overview: String,
    detailedExplanation: String,
    realWorldExamples: [String],
    keyPoints: [String],
    commonMistakes: [String]
  },
  category: { type: String, default: 'Engineering' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', topicSchema);
