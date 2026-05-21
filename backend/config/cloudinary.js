const cloudinary = require('cloudinary').v2;
// 👇 CHANGE THIS LINE TO USE CURLY BRACES { CloudinaryStorage }
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage engine properties
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gndec_circle_assets',
    allowed_formats: ['pdf'],
    resource_type: 'raw' // Forces Cloudinary to accept documents cleanly
  }
});

const uploadParser = multer({ storage: storage });

module.exports = {
  cloudinary,
  uploadParser
};