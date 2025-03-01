const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('./chatbotConfig');

class ChatbotService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.modelName });
    this.chatSessions = new Map(); // Store chat sessions by userId
  }

  getChatSession(userId) {
    if (!this.chatSessions.has(userId)) {
      // Create a new chat session for this user
      const chatSession = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: config.maxOutputTokens,
        },
      });
      this.chatSessions.set(userId, chatSession);
    }
    return this.chatSessions.get(userId);
  }

  async sendMessage(userId, message) {
    try {
      const chatSession = this.getChatSession(userId);
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error(`Chatbot error for user ${userId}:`, error);
      throw new Error('Failed to get response from chatbot service');
    }
  }

  clearChatHistory(userId) {
    this.chatSessions.delete(userId);
  }
}

// Export as singleton
const chatbotService = new ChatbotService();
module.exports = chatbotService;