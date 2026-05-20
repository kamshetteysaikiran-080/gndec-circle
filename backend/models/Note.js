
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  subjectName: { 
    type: String, 
    required: [true, 'Subject name is required'], 
    trim: true 
  },
  subjectCode: { 
    type: String, 
    required: [true, 'Subject code is required'], 
    trim: true,
    uppercase: true 
  }, 
  department: { 
    type: String, 
    enum: ['CSE', 'ECE', 'EEE', 'ME', 'CIVIL'], 
    required: [true, 'Department is required'] 
  },
  semester: { 
    type: String, 
    required: [true, 'Semester is required'] 
  }, 
  unitNumber: { 
    type: Number, 
    required: [true, 'Unit number (1-5) is required'], 
    min: 1, 
    max: 5 
  },
  pdfUrl: { 
    type: String, 
    required: [true, 'PDF file URL is missing'] 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Note', NoteSchema);