const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/1154/1154447.png' },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    default: 'student' 
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  activities: [{
    type: { type: String }, // 'quiz', 'course_complete', etc.
    title: { type: String },
    metadata: { type: Object },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
