const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 },
  completedLectures: [{ type: mongoose.Schema.Types.ObjectId }],
  enrolledAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
