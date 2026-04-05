const express = require('express');
const router = express.Router();
const { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse, 
  getInstructorCourses 
} = require('../controllers/courseController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/create', auth, authorize('instructor', 'admin'), createCourse);
router.get('/instructor/me', auth, authorize('instructor', 'admin'), getInstructorCourses);
router.put('/:id', auth, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;
