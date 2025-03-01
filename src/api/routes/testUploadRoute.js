const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { productImageUpload } = require('../middleware/uploadMiddleware');
const { getImageUrl } = require('../../utils/imageHelper');

// Route to render the test upload page
router.get('/test-upload', (req, res) => {
    res.render('test-upload');
});

// Test route for product image upload
router.post('/upload-product',  productImageUpload, async (req, res) => {
    try {
        // If we got here, the image was uploaded successfully
        const uploadedImage = req.file.path;
        const optimizedImageUrl = getImageUrl(uploadedImage, 'product');
        
        // Return the image information and form data
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: uploadedImage,
            optimizedImageUrl: optimizedImageUrl,
            formData: {
                name: req.body.name,
                price: req.body.price,
                quantity: req.body.quantity,
                category: req.body.category,
                location: req.body.location,
                description: req.body.description
            }
        });
    } catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

module.exports = router;