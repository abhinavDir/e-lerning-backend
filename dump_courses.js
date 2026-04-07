const mongoose = require('mongoose');
const Course = require('./models/Course');
const fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/edStackPlatform')
  .then(async () => {
    const courses = await Course.find();
    fs.writeFileSync('courses_dump.json', JSON.stringify(courses, null, 2));
    console.log('Dumped to courses_dump.json');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
