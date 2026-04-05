const fs = require('fs');
const path = require('path');

const domains = [
  'Software Engineering', 'Hardware Design', 'Nuclear Physics', 'Aerospace Engineering', 
  'Biotechnology', 'Civil Engineering', 'Chemical Engineering', 'Electric Vehicles',
  'Robotics', 'Nanotechnology', 'Cybersecurity', 'Cloud Computing', 'Data Science', 'Blockchain'
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const generateTopics = () => {
    const topics = [];
    for (let i = 1; i <= 100; i++) {
        const domain = domains[i % domains.length];
        const level = levels[i % levels.length];
        const title = `${domain} ${Math.ceil(i / domains.length)} - Module ${i}`;

        topics.push({
            title,
            level,
            summary: `${title} is a critical domain in modern technology.`,
            category: domain,
            keyPoints: [
                `Foundations of ${domain}`,
                `Modern applications of ${title}`,
                `Challenges in ${domain}`,
                `Mastery track for ${level}`
            ],
            explanation: `Detailed study of ${title} at the ${level} level involves both theoretical research and practical implementation. This module explores the architecture, design patterns, and operational standards used in industry-scale ${domain} systems.`,
            example: `${title} is widely used in cutting-edge research and industrial production globally.`
        });
    }
    return topics;
};

const generateQuizzes = (topics) => {
    const quizzes = [];
    topics.forEach(t => {
        const difficulty = t.level === 'Beginner' ? 'Easy' : t.level === 'Advanced' ? 'Hard' : 'Medium';
        const questions = [];
        for(let i=1; i<=10; i++) {
            questions.push({
                question: `Core principle #${i} of ${t.title}?`,
                options: [`Standard Option A`, `Correct Answer B`, `Alternative C`, `Theoretical D`],
                correctAnswer: `Correct Answer B`,
                explanation: `This answer is derived from the standard documentation of ${t.title}.`,
                difficulty: difficulty
            });
        }
        quizzes.push({
            topic: t.title,
            questions: questions
        });
    });
    return quizzes;
};

const topics = generateTopics();
const quizzes = generateQuizzes(topics);

fs.writeFileSync(path.join(__dirname, '../data/topics.json'), JSON.stringify(topics, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/quiz.json'), JSON.stringify(quizzes, null, 2));

console.log('✅ Generated 100 Topics and Quizzes in JSON files.');
