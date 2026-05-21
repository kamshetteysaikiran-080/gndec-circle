const router = require('express').Router();
const cloudinaryConfig = require('../config/cloudinary'); 
const uploadParser = cloudinaryConfig.uploadParser;       
const Circular = require('../models/Circular'); 
const Note = require('../models/Note');         

// ==========================================
// SECURITY GATEKEEPER (MIDDLEWARE)
// ==========================================
const checkFacultyAuth = (req, res, next) => {
  // Cross-platform header reading for case-insensitive deployment environments
  const incomingKey = req.headers['x-auth-key'] || req.headers['X-Auth-Key'];
  const expectedKey = process.env.FACULTY_SECRET_KEY;

  if (!incomingKey || incomingKey !== expectedKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'CRITICAL SECURITY BLOCK: You are unauthorized to modify GNDEC digital assets.' 
    });
  }
  next(); 
};

// ==========================================
// 1. ENDPOINT: UPLOAD A NEW COLLEGE CIRCULAR (PROTECTED)
// ==========================================
router.post('/circular', checkFacultyAuth, uploadParser.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File upload failed. No metadata captured.' });
    }

    const cloudUrl = req.file.secure_url || req.file.url || req.file.path;
    if (!cloudUrl) {
      return res.status(400).json({ success: false, error: 'Cloudinary transmission parsing failure.' });
    }

    const { title, category, targetSemesters } = req.body;
    let semestersArray = ['All'];
    if (targetSemesters) {
      semestersArray = typeof targetSemesters === 'string' ? targetSemesters.split(',') : targetSemesters;
    }

    const newCircular = new Circular({
      title,
      category,
      targetSemesters: semestersArray,
      pdfUrl: cloudUrl
    });

    await newCircular.save();
    res.status(201).json({ success: true, data: newCircular });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. ENDPOINT: UPLOAD STUDY NOTES (PROTECTED)
// ==========================================
router.post('/note', checkFacultyAuth, uploadParser.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File upload failed. No metadata captured.' });
    }
    
    const cloudUrl = req.file.secure_url || req.file.url || req.file.path;
    if (!cloudUrl) {
      return res.status(400).json({ success: false, error: 'Cloudinary transmission parsing failure.' });
    }

    const { subjectName, subjectCode, department, semester, unitNumber } = req.body;
    
    const newNote = new Note({
      subjectName,
      subjectCode,
      department,
      semester,
      unitNumber: parseInt(unitNumber, 10) || 1, // Fallback layout to safely catch NaN states
      pdfUrl: cloudUrl
    });

    await newNote.save();
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ENDPOINT: FETCH ALL CIRCULARS FOR STUDENTS (PUBLIC)
// ==========================================
router.get('/circulars', async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ publishedDate: -1 });
    res.status(200).json({ success: true, data: circulars });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. ENDPOINT: FETCH NOTES WITH FILTERS (PUBLIC)
// ==========================================
router.get('/notes', async (req, res) => {
  try {
    const { dept, sem } = req.query;
    let filterQuery = {};
    if (dept) filterQuery.department = dept.toUpperCase();
    if (sem) filterQuery.semester = String(sem).trim();

    const notes = await Note.find(filterQuery).sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. ENDPOINT: DELETE STUDY NOTE (PROTECTED)
// ==========================================
const deleteNoteHandler = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note target not found inside database.' });

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Wiped cleanly!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
router.delete('/note/:id', checkFacultyAuth, deleteNoteHandler);
router.delete('/notes/:id', checkFacultyAuth, deleteNoteHandler);

// ==========================================
// 6. ENDPOINT: DELETE CIRCULAR (PROTECTED)
// ==========================================
const deleteCircularHandler = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ success: false, error: 'Circular target not found inside database.' });

    await Circular.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Wiped cleanly!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
router.delete('/circular/:id', checkFacultyAuth, deleteCircularHandler);
router.delete('/circulars/:id', checkFacultyAuth, deleteCircularHandler);

module.exports = router;