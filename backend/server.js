const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();

// ==========================================
// EXPRESS 5 COMPATIBLE CORS HOOK ENGINE
// ==========================================
// Passing preflightContinue: false allows the cors package to natively 
// intercept and answer OPTIONS requests without crashing path-to-regexp.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-key', 'X-Auth-Key', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Standard internal incoming JSON content payload parser
app.use(express.json());

// ==========================================
// ROUTE MOUNTING
// ==========================================
// Base server health check gateway endpoint
app.get('/', (req, res) => {
  res.send('GNDEC Circle Backend Engine is Running Live!');
});

// Primary academic assets API router endpoint attachment
app.use('/api', uploadRoutes);

// ==========================================
// DATABASE & SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
const fallbackMongoUri = "mongodb://localhost:27017/gndec_circle";
const mongoConnectionUri = process.env.MONGO_URI || fallbackMongoUri;

mongoose.connect(mongoConnectionUri)
  .then(() => {
    console.log('Connected to GNDEC Circle Database successfully!');
    app.listen(PORT, "0.0.0.0", () => console.log(`Backend server running smoothly on port ${PORT}`));
  })
  .catch((err) => {
    console.error('CRITICAL ERROR: Database connection failed.', err);
  });