const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { profileImageUpload } = require('../middleware/uploadMiddleware');
const authController = require('../controllers/authController');

// router.get('/profileData', (req, res) => {
//     res.json(userProfile);
// });

router.get('/myprofile', (req, res) => {
    res.render('profile');
});

// Add new route for profile image upload (optional upload)
router.post('/update-profile-image', auth, profileImageUpload, authController.updateProfileImage);

module.exports = router;