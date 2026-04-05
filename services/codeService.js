const axios = require('axios');

// Piston API: Open Source Code Execution (FREE)
const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

exports.executeCode = async (language, version, code) => {
  try {
    const payload = {
      language: language || 'javascript',
      version: version || '18.15.0',
      files: [{ content: code }]
    };

    const response = await axios.post(PISTON_URL, payload);

    return {
      output: response.data.run.output || "No output generated.",
      stdout: response.data.run.stdout,
      stderr: response.data.run.stderr,
      signal: response.data.run.signal
    };
  } catch (error) {
    throw new Error('Code execution failed: ' + error.message);
  }
};
