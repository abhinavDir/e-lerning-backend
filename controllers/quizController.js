const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Course = require('../models/Course');
const AssignedQuiz = require('../models/AssignedQuiz');
const fs = require('fs');
const path = require('path');

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, questions, difficulty, topic, isGlobal, timeLimit } = req.body;

    const quiz = new Quiz({
      courseId,
      questions,
      difficulty: difficulty || 'Medium',
      topic,
      isGlobal: isGlobal || false,
      timeLimit: timeLimit || 10,
      instructorId: req.user.id
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGlobalQuizzes = async (req, res) => {
  try {
    const quizPath = path.join(__dirname, '../data/quiz.json');
    if (!fs.existsSync(quizPath)) {
      return res.json([]);
    }
    const rawData = fs.readFileSync(quizPath);
    const quizzes = JSON.parse(rawData);
    res.json(quizzes);
  } catch (err) {
    console.error('Local Quiz Load Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if it's a locally generated quiz from JSON
    if (id.startsWith('q_gen_')) {
      const quizPath = path.join(__dirname, '../data/quiz.json');
      if (fs.existsSync(quizPath)) {
        const quizzes = JSON.parse(fs.readFileSync(quizPath));
        const found = quizzes.find(q => q._id === id);
        if (found) return res.json(found);
      }
    }

    // Fallback to DB
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found for this course' });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, assignmentId } = req.body; 
    const quizId = req.params.quizId;
    let quiz;

    // Check locally generated JSON first
    if (quizId.startsWith('q_gen_')) {
      const quizPath = path.join(__dirname, '../data/quiz.json');
      if (fs.existsSync(quizPath)) {
        const quizzes = JSON.parse(fs.readFileSync(quizPath));
        quiz = quizzes.find(q => q._id === quizId);
      }
    }

    // Fallback to database
    if (!quiz) {
      quiz = await Quiz.findById(quizId);
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        score++;
      }
    });

    const result = {
      score,
      totalQuestions: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100
    };

    // If it's an assigned quiz, update the assignment
    if (assignmentId) {
      await AssignedQuiz.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        result: {
          ...result,
          completedAt: new Date()
        }
      });
    }

    const course = quiz.courseId ? await Course.findById(quiz.courseId) : null;

    // Log Activity
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        activities: {
          type: 'quiz',
          title: quiz.topic ? `Assessment: ${quiz.topic}` : `${quiz.difficulty || 'Assessment'} Knowledge Check`,
          metadata: { 
            score, 
            total: quiz.questions.length, 
            percent: Math.round(result.percentage), 
            courseId: quiz.courseId,
            courseTitle: course?.title || (quiz.topic ? `Global: ${quiz.topic}` : 'Skill Evaluation'),
            assignmentId: assignmentId || null
          },
          timestamp: new Date()
        }
      }
    });

    res.json({
      message: 'Quiz submitted successfully',
      result
    });
  } catch (err) {
    console.error('Quiz Submission Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.assignQuiz = async (req, res) => {
  try {
    let { quizId, userId, dueDate } = req.body;
    const instructorId = req.user.id;

    // Check if quizId is actually a courseId or a valid Quiz ID
    let quiz = await Quiz.findById(quizId);
    if (!quiz) {
      // If not, maybe it's a courseId? Try to find by courseId
      quiz = await Quiz.findOne({ courseId: quizId });
    }

    if (!quiz) {
       return res.status(404).json({ error: 'No assessment detected for this course architecture yet.' });
    }

    const assignment = new AssignedQuiz({
      quizId: quiz._id, // Save the actual Quiz ID
      userId,
      instructorId,
      dueDate
    });

    await assignment.save();
    res.status(201).json({ message: 'Quiz assigned successfully', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssignedQuizzes = async (req, res) => {
  try {
    const assignments = await AssignedQuiz.find({ userId: req.user.id, status: 'assigned' })
      .populate('quizId')
      .populate('instructorId', 'name');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssignedQuizDetails = async (req, res) => {
  try {
    const assignment = await AssignedQuiz.findById(req.params.assignmentId)
      .populate('quizId')
      .populate('instructorId', 'name');
    
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInstructorQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ instructorId: req.user.id });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
