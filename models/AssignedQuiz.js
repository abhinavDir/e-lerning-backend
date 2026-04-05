const mongoose = require('mongoose');

const assignedQuizSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['assigned', 'completed'], default: 'assigned' },
  result: {
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    completedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssignedQuiz', assignedQuizSchema);
