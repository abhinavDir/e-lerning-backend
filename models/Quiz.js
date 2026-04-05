const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
  topic: { type: String },
  isGlobal: { type: Boolean, default: false },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Intermediate', 'Advanced'], default: 'Medium' },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: String
  }],
  timeLimit: { type: Number, default: 10 }, // in minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
