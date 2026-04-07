const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getQuizByCourse, 
  submitQuiz, 
  assignQuiz, 
  getAssignedQuizzes, 
  getAssignedQuizDetails,
  getGlobalQuizzes,
  getQuizById,
  getInstructorQuizzes
} = require('../controllers/quizController');
const { auth, authorize } = require('../middleware/auth');

router.get('/assigned', auth, getAssignedQuizzes);
router.get('/global', getGlobalQuizzes);
router.get('/assignment/:assignmentId', auth, getAssignedQuizDetails);
router.get('/instructor/me', auth, authorize('instructor', 'admin'), getInstructorQuizzes);
router.get('/:courseId', auth, getQuizByCourse);
router.get('/id/:id', auth, getQuizById);
router.post('/create', auth, authorize('instructor', 'admin'), createQuiz);
router.post('/submit/:quizId', auth, submitQuiz);
router.post('/assign', auth, authorize('instructor', 'admin'), assignQuiz);

module.exports = router;
