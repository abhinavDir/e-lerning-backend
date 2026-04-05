const fs = require('fs');
const path = require('path');
const Quiz = require('../models/Quiz');

// Helper to Load Data
const loadJSON = (filename) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../data', filename), 'utf-8'));
};

const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

exports.createQuiz = async (topicId, requestedDifficulty, userId) => {
  try {
    const topics = loadJSON('topics.json');
    const quizData = loadJSON('quiz.json');

    // Find topic in JSON (if topicId is the title)
    let topic = topics.find(t => t.title === topicId || t.title.toLowerCase() === topicId.toLowerCase());
    
    if (!topic) {
        throw new Error('Topic not available. Please try another topic.');
    }

    const topicEntry = quizData.find(q => q.topic.toLowerCase() === topic.title.toLowerCase());
    
    if (!topicEntry || !topicEntry.questions) {
      throw new Error('No quiz found for this topic.');
    }

    let targetDifficulty = 'Medium';
    if (topic.level === 'Beginner') targetDifficulty = 'Easy';
    else if (topic.level === 'Advanced') targetDifficulty = 'Hard';

    let levelQuestions = topicEntry.questions.filter(q => q.difficulty === targetDifficulty);
    if (levelQuestions.length === 0) levelQuestions = topicEntry.questions;

    const selected = shuffle(levelQuestions).slice(0, 5);

    const finalizedQuestions = selected.map(q => ({
      question: q.question,
      options: shuffle(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));

    // We still try to save to DB for tracking, but we handle failure
    try {
        const quiz = new Quiz({
            topicId: topic.id || topic.title, // Use title as fallback ID
            difficulty: targetDifficulty,
            questions: finalizedQuestions
        });
        await quiz.save();
        return quiz;
    } catch (dbErr) {
        console.warn('⚠️ Could not save quiz to DB, returning session-only quiz:', dbErr.message);
        return {
            _id: Date.now().toString(),
            topicId: topic.title,
            difficulty: targetDifficulty,
            questions: finalizedQuestions
        };
    }
  } catch (err) {
    console.error('Quiz creation error:', err);
    return null;
  }
};
