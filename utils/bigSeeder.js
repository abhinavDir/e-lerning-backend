const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const seed50Courses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edStackPlatform');
    console.log('✅ Connected to MongoDB for Seeding');

    // Find an instructor to assign courses to
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = new User({
        name: 'Master Instructor',
        email: 'instructor@test.com',
        password: 'password123',
        role: 'instructor'
      });
      await instructor.save();
    }

    const categories = ['Development', 'Business', 'Design', 'Marketing', 'IT & Software'];
    const titles = [
      'Advanced React Patterns', 'Complete Node.js Guide', 'UX/UI Masterclass', 
      'Python for Data Science', 'Digital Marketing 101', 'Cloud Computing with AWS', 
      'Docker & Kubernetes', 'Unity Game Development', 'Financial Analysis',
      'Graphic Design Fundamentals', 'Full Stack MERN platform', 'Typescript Deep Dive',
      'Next.js 14 Performance', 'Tailwind CSS Mastery', 'MongoDB for Beginners',
      'Cybersecurity Essentials', 'AI & Machine Learning', 'Java Spring Boot',
      'Vue.js 3 Composition API', 'Responsive Design Principles'
    ];

    const courses = [];
    for (let i = 1; i <= 50; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      
      courses.push({
        title: `${randomTitle} (Vol. ${i})`,
        description: `This is a comprehensive course volume ${i} covering all aspects of ${randomTitle}. Learn from industry experts and master your skills.`,
        price: Math.floor(Math.random() * 90) + 10,
        thumbnail: `https://picsum.photos/seed/${i + 100}/800/450`,
        category: randomCat,
        instructor: instructor._id,
        sections: [
          {
            title: 'Introduction',
            lectures: [
              { title: 'Welcome to the course', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634825920/sample_video_rtq7vj.mp4', duration: 300 },
              { title: 'Setting up environment', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634825920/sample_video_rtq7vj.mp4', duration: 600 }
            ]
          },
          {
            title: 'Advanced Core Concepts',
            lectures: [
              { title: 'Mastering the basics', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634825920/sample_video_rtq7vj.mp4', duration: 1200 },
              { title: 'Building the skeleton', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634825920/sample_video_rtq7vj.mp4', duration: 900 }
            ]
          }
        ],
        rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        enrolledStudentsCount: Math.floor(Math.random() * 5000)
      });
    }

    await Course.insertMany(courses);
    console.log(`🚀 Successfully seeded 50 courses for instructor: ${instructor.email}`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed50Courses();
