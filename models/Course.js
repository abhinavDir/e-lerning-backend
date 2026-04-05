const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  pdfUrl: { type: String },
  duration: { type: String },
  order: { type: Number, default: 0 }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lectures: [lectureSchema],
  order: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: 'https://via.placeholder.com/300x200?text=Course+Thumbnail' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  outcomes: [String],
  sections: [sectionSchema],
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'Beginner' },
  totalDuration: { type: String, default: '10+ Hours' },
  enrolledStudentsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  quizUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
