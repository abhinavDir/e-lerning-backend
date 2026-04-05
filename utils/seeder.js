const Course = require('../models/Course');
const User = require('../models/User');

const seedData = async () => {
  try {
    // Current seeder is a placeholder. 
    // You can add logic here to seed initial courses if needed.
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log('ℹ️ Course collection is empty. Manual seeding required.');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
};

module.exports = seedData;
