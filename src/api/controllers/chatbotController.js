const chatbotService = require('../services/chatbot/chatbotService');

class ChatbotController {
  async sendMessage(req, res) {
    try {

      console.log('Chatbot controller called.')
      const { userId, message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Message is required'
        });
      }

      // Use default user ID if not provided
      const userIdentifier = userId || req.user?.id || 'anonymous-user';
      
      // Get response from chatbot service
      const response = await chatbotService.sendMessage(userIdentifier, message);
      
      return res.status(200).json({
        success: true,
        data: { response }
      });
    } catch (error) {
      console.error('Chatbot controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process chatbot request'
      });
    }
  }

  // Deleting the history of the chat (session)
  async clearHistory(req, res) {
    try {
    
      const userId = req.params.userId || req.user?.id || 'anonymous-user';
      console.log(userId)
      chatbotService.clearChatHistory(userId);
      
        console.log("Chat history cleared successfully")
      return res.status(200).json({
        success: true,
        message: 'Chat history cleared successfully'
      });
    } catch (error) {
      console.error('Clear history error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear chat history'
      });
    }
  }
}

module.exports = new ChatbotController();