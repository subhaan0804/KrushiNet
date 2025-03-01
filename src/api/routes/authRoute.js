const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

// DONT ADD AUTH FOR REGISTER OR LOGIN ROUTES
router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    res.render('login');
}); 

router.post('/register', authController.register);
router.post('/login', authController.login);

// Update the /me route to explicitly require auth
router.get('/me',auth, authController.getProfile);

router.get('/checkActiveUser', auth, authController.checkActiveUser);
router.post('/logout', auth, authController.logout);

router.get('/geocode', async (req, res) => {
    const { city, state } = req.query;
    try {
        const response = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},IN&limit=1&appid=${process.env.WEATHER_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;