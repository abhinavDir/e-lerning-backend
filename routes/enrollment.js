const express = require('express');
const router = express.Router();
const { 
  enrollInCourse, 
  getEnrolledCourses, 
  updateCourseProgress, 
  getInstructorsStudents, 
  getStudentsByCourse 
} = require('../controllers/enrollmentController');
const { auth, authorize } = require('../middleware/auth');

router.post('/enroll', auth, enrollInCourse);
router.get('/my-courses', auth, getEnrolledCourses);
router.post('/update-progress', auth, updateCourseProgress);

// Instructor routes
router.get('/students', auth, authorize('instructor', 'admin'), getInstructorsStudents);
router.get('/course/:courseId/students', auth, authorize('instructor', 'admin'), getStudentsByCourse);

module.exports = router;
