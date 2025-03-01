const { cloudinary } = require('../config/cloudinary');

exports.validateImage = (file) => {
  if (!file) {
    return { isValid: true }; // No file to validate (for optional uploads)
  }
  
  // Valid mime types
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!validTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      message: 'Invalid file type. Only JPEG, JPG and PNG are allowed.'
    };
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return {
      isValid: false,
      message: 'File too large. Maximum size is 5MB.'
    };
  }
  
  return { isValid: true };
};

exports.deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0]; // Remove file extension
    
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

exports.getImageUrl = (originalUrl, type = 'original') => {
    // Return original URL if it's not from Cloudinary
    if (!originalUrl || !originalUrl.includes('cloudinary')) {
      return originalUrl;
    }
    
    // Split URL to insert transformations
    const urlParts = originalUrl.split('/upload/');
    if (urlParts.length !== 2) return originalUrl;
    
    // Choose transformation based on image type
    let transform = '';
    switch (type) {
      case 'profile':
        transform = 'c_fill,g_face,w_200,h_200,q_auto/';
        break;
      case 'product':
        transform = 'q_auto/';
        break;
      case 'thumbnail':
        transform = 'c_fill,w_300,h_300,q_auto/';
        break;
      default:
        transform = '';
    }
    
    // Build and return the transformed URL
    return `${urlParts[0]}/upload/${transform}${urlParts[1]}`;
  }


exports.getFallbackImage = async (type) => {
    switch (type) {
      case 'profile':
        return 'https://res.cloudinary.com/dxp3qyizu/image/upload/v1/farmer-platform/defaults/default-profile.png';
      case 'product':
        return 'https://res.cloudinary.com/dxp3qyizu/image/upload/v1/farmer-platform/defaults/default-product.png';
      default:
        return 'https://res.cloudinary.com/dxp3qyizu/image/upload/v1/farmer-platform/defaults/placeholder.png';
    }
  };

  exports.generateProfileImageName = (file, userId) => {
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop().toLowerCase();
    return `profile_${userId}_${timestamp}.${extension}`;
  };
  
  exports.generateProductImageName = (file, listingId, sellerId) => {
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop().toLowerCase();
    return `product_${sellerId}_${listingId || 'new'}_${timestamp}.${extension}`;
  };