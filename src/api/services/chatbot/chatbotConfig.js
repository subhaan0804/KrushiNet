// Load environment variables
// const env = require('../../../config/env');

// Chatbot configuration
module.exports = {
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyB-0NHT6O_HV-eOpaRkSu0R2DR-WIwEERs",
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 400, // Response Tokens (words)

};