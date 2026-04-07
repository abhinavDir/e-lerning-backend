const mongoose = require('mongoose');
const Course = require('./models/Course');
const Quiz = require('./models/Quiz');

mongoose.connect('mongodb://127.0.0.1:27017/edStackPlatform')
  .then(async () => {
    console.log('Connected to DB. Purging seeded volumes...');
    
    // Delete all courses that contain "(Vol. " in their title
    const deletedCourses = await Course.deleteMany({ title: { $regex: /\(Vol\./ }});
    console.log(`Deleted ${deletedCourses.deletedCount} seeded courses.`);

    // Let's also check if there are other known seed strings
    const deletedCourses2 = await Course.deleteMany({ title: /Course \d+/i });
    console.log(`Deleted ${deletedCourses2.deletedCount} generic numbered courses.`);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
