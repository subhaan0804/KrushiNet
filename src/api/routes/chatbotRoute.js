const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { auth } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.get('/chatapp', (req, res) => {
    res.render('chatbot');
});


// send a query to the chatbot
router.post('/message', chatbotController.sendMessage);

// deleting a chat session of the user
router.delete('/history/:userId', chatbotController.clearHistory);



module.exports = router;