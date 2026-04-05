const Course = require('../models/Course');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, category, price, sections, outcomes, level, totalDuration, quizUrl } = req.body;

    const course = new Course({
      title,
      description,
      thumbnail,
      category,
      price,
      sections,
      outcomes,
      level,
      totalDuration,
      quizUrl,
      instructor: req.user.id
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized and invalid action' });
    }

    const { title, description, thumbnail, category, price, sections, outcomes, level, totalDuration, quizUrl } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.thumbnail = thumbnail || course.thumbnail;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;
    course.sections = sections || course.sections;
    course.outcomes = outcomes || course.outcomes;
    course.level = level || course.level;
    course.totalDuration = totalDuration || course.totalDuration;
    course.quizUrl = quizUrl || course.quizUrl;
    
    course.markModified('sections');
    await course.save();

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized and invalid action' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
