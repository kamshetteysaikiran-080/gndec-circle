const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure the official Cloudinary SDK directly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure standard local disk storage inside Render's temporary directory
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create our standard multipart form parser
const uploadParser = multer({ storage: storage });

module.exports = {
  cloudinary,
  uploadParser
};