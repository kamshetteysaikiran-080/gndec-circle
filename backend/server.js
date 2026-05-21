const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();

// ==========================================
// CRITICAL CORS PREFLIGHT HANDSHAKE ENGINE
// ==========================================
// 1. Force allow basic cross-origin requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-key', 'X-Auth-Key', 'Authorization'],
  credentials: true
}));

// 2. EXPLICITLY intercept OPTIONS traffic globally before ANY other middleware reads it
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-key, X-Auth-Key, Authorization');
  return res.sendStatus(200); // Send an instant, clean HTTP 200 OK back to the browser
});

// 3. standard internal content parser
app.use(express.json());

// ==========================================
// ROUTE MOUNTING
// ==========================================
// Server health check route
app.get('/', (req, res) => {
  res.send('GNDEC Circle Backend Engine is Running Live!');
});

// Mount our API paths
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