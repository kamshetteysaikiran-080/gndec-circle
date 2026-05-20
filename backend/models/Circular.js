const mongoose = require('mongoose');

const CircularSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Circular title is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    enum: ['Exam', 'Academic', 'Fee', 'General'], 
    required: [true, 'Category is required'] 
  },
  targetSemesters: [{ 
    type: String, 
    default: ['All'] 
  }], 
  pdfUrl: { 
    type: String, 
    required: [true, 'PDF file URL is missing'] 
  },
  publishedDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Circular', CircularSchema);