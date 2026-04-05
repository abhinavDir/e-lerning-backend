const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Role safety: Instructors should not enroll as students
    if (req.user.role === 'instructor') {
      return res.status(403).json({ error: 'Instructors cannot enroll in courses' });
    }

    let enrollment = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (enrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    enrollment = new Enrollment({
      student: req.user.id,
      course: courseId
    });

    await enrollment.save();

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudentsCount: 1 } });

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title thumbnail category price');

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;

    const enrollment = await Enrollment.findOne({ student: req.user.id, course: courseId });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (!enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
    }

    const course = await Course.findById(courseId);
    const totalLecturesCount = course.sections.reduce((acc, section) => acc + section.lectures.length, 0);

    const progressValue = (enrollment.completedLectures.length / totalLecturesCount) * 100;

    enrollment.progress = Math.min(progressValue, 100);

    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      progress: enrollment.progress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsByCourse = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar');
    res.json(enrollments.map(e => e.student));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInstructorsStudents = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map(c => c._id);
    
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar')
      .populate('course', 'title');
    
    // Group by student to avoid duplicates or just return list
    const studentsMap = {};
    enrollments.forEach(e => {
        if (!studentsMap[e.student._id]) {
            studentsMap[e.student._id] = {
                ...e.student._doc,
                courses: []
            };
        }
        studentsMap[e.student._id].courses.push(e.course.title);
    });

    res.json(Object.values(studentsMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
