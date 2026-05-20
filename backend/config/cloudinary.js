const cloudinary = require('cloudinary'); // Root object for Cloudinary v2
const CloudinaryStorage = require('multer-storage-cloudinary'); // DIRECT import for legacy v2.x.x constructor
const multer = require('multer');

// Configure your cloud credentials cleanly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Build the storage engine using the direct class constructor
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'gndec_circle_assets',
  allowedFormats: ['pdf'],
  // In older multer-storage-cloudinary versions, parameters are placed directly in the root option tree
  params: {
    resource_type: 'raw' // Informs Cloudinary to accept non-image binary raw documents like PDFs
  }
});

const uploadParser = multer({ storage: storage });

module.exports = {
  cloudinary,
  uploadParser
};