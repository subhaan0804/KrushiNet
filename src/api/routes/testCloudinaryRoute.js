const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('../../config/cloudinary');

// Test endpoint to upload a static image to Cloudinary
router.post('/test-upload', async (req, res) => {
  try {
    // Path to a static test image
    const imagePath = path.join(process.cwd(), 'public', 'images', 'test-image.jpg');
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test image not found. Please place a test-image.jpg file in your public/images directory.'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'farmer-platform/test',
      use_filename: true
    });

    res.json({
      success: true,
      message: 'Test image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      details: result
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