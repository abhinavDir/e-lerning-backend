const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.generateLearningPath = async (goal) => {
  try {
    const prompt = `Act as an elite educational architect. Generate a high-fidelity 4-week learning roadmap for a student achieving this mission: "${goal}".
    
    CRITICAL: Respond ONLY as a raw JSON array. No conversational text.
    Structure:
    [{
      "week": 1,
      "focus": "...",
      "topics": ["...", "..."],
      "tasks": [{"title": "...", "difficulty": "Beginner/Intermediate/Advanced"}]
    }]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']') + 1;
    const jsonStr = text.substring(startIdx, endIdx);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("NEURAL ENGINE ERROR:", error.message);
    // Deterministic fallback
    return [
      { week: 1, focus: `Foundations of ${goal}`, topics: ["Core Principles", "Standard Practices"], tasks: [{ title: "Analyze current state", difficulty: "Beginner" }] },
      { week: 2, focus: "Application & Execution", topics: ["Intermediate Logic", "Optimization"], tasks: [{ title: "Develop prototype", difficulty: "Intermediate" }] }
    ];
  }
};

exports.chatResponse = async (message, history = []) => {
  try {
    const chat = model.startChat({
      history: history.slice(-6).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Intelligence Engine Offline.";
  }
};
