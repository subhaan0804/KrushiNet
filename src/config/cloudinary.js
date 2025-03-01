const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const {generateProfileImageName, generateProductImageName} = require("../utils/imageHelper")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'farmer-platform/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 600, crop: 'fill' }], // Resizes to fill 600x600
    filename: (req, file) => {
      const userId = req.user ? req.user.id : 'unregistered';
      return generateProfileImageName(file, userId);
    }
  }
});

// Create storage engine for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'farmer-platform/products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 600, crop: 'pad', background: 'auto' }],
    filename: (req, file) => {
      const userId = req.user ? req.user.id : 'unregistered';
      const listingId = req.params.id || null;
      return generateProductImageName(file, listingId, userId);
    } // Maintains aspect ratio, pads if needed
  }
});

// Create multer instances
const uploadProfileImage = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = {
  uploadProfileImage,
  uploadProductImage,
  cloudinary,
  DEFAULT_PROFILE_IMAGE: 'https://res.cloudinary.com/dxp3qyizu/image/upload/v1/farmer-platform/defaults/default-profile.png'
};

