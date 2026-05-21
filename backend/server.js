const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware Configuration
app.use(express.json());

// ALLOW BOTH LOCAL DEVELOPMENT AND YOUR LIVE NETLIFY APP FRONTEND
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://celebrated-cactus-f30efe.netlify.app" // 👈 Added your production domain asset link!
  ],
  credentials: true
}));

// Server health check route
app.get('/', (req, res) => {
  res.send('GNDEC Circle Backend Engine is Running Live!');
});

// Mount our API paths
app.use('/api', uploadRoutes);

// Database Connection and Server Start
const PORT = process.env.PORT || 5000;

// Temporary backup URI to prevent crashes before setting up Atlas database
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