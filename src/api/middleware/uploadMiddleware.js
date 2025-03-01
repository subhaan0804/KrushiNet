const { uploadProfileImage, uploadProductImage } = require('../../config/cloudinary');
const { validateImage } = require('../../utils/imageHelper');

// Profile image upload middleware that handles missing files (optional uploads)
exports.profileImageUpload = (req, res, next) => {
    // Validate before upload if file exists
    if (req.file) {
      const validation = validateImage(req.file);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }
    }

  const upload = uploadProfileImage.single('profileImage');
  
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        message: 'Image upload failed', 
        error: err.message 
      });
    }
    // Continue even if no file was uploaded
    next();
  });
};

// Product image upload middleware (required)
exports.productImageUpload = (req, res, next) => {
  const upload = uploadProductImage.single('productImage');
  
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        message: 'Image upload failed', 
        error: err.message 
      });
    }
    
    // Check if file exists (since product images are required)
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Product image is required'
      });
    }
    
    next();
  });
};