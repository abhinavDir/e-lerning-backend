exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;
    
    // Mocking AI response for now. 
    // In production, integrate with OpenAI or Gemini API.
    const responses = [
      "That's a great question! In React, hooks let you use state and other features without writing a class.",
      "The MERN stack is a popular JavaScript stack used for building modern web applications.",
      "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.",
      "Express is a minimal and flexible Node.js web application framework.",
      "You're doing great! Keep practicing and you'll master this in no time."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    res.json({
      answer: `[AI Tutor]: ${randomResponse}`,
      confidence: 0.95
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
