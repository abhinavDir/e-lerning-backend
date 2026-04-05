const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  durationInWeeks: { type: Number, default: 4 },
  curriculum: [{
    week: Number,
    focus: String,
    modules: [{
      title: String,
      subtopics: [String]
    }],
    weeklyProject: String,
    learningOutcome: String,
    tasks: [{
      title: String,
      difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] }
    }]
  }],
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
