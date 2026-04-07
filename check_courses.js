const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect('mongodb://127.0.0.1:27017/edStackPlatform')
  .then(async () => {
    console.log('Connected to DB');
    const courses = await Course.find();
    console.log('--- DB COURSES ---');
    courses.forEach(c => {
      console.log(`ID: ${c._id} | Title: ${c.title} | Instructor: ${c.instructor}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
