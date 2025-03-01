// Load environment variables
// const env = require('../../../config/env');

// Chatbot configuration
module.exports = {
  apiKey: process.env.GEMINI_API_KEY ,
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 400, // Response Tokens (words)

};
