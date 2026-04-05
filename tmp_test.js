const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBbamh1bMiQiv-3a8qVIRs7l4wOvfbP0wM");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hi");
    console.log("SUCCESS: " + result.response.text());
  } catch (err) {
    console.error("DIAGNOSTIC ERROR: " + err.message);
    if (err.stack) console.error(err.stack);
  }
}

run();
