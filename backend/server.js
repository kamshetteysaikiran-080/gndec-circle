const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(express.json());

// Bulletproof CORS Configuration to prevent preflight options blocks in cloud deploys
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-key', 'X-Auth-Key']
}));

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

// Temporary backup URI to prevent crashes before setting up Atlas database
const fallbackMongoUri = "mongodb://localhost:27017/gndec_circle";
const mongoConnectionUri = process.env.MONGO_URI || fallbackMongoUri;

mongoose.connect(mongoConnectionUri)
  .then(() => {
    console.log('Connected to GNDEC Circle Database successfully!');
    // Binding to "0.0.0.0" allows the container service to bind across cloud hosting environments
    app.listen(PORT, "0.0.0.0", () => console.log(`Backend server running smoothly on port ${PORT}`));
  })
  .catch((err) => {
    console.error('CRITICAL ERROR: Database connection failed.', err);
  });