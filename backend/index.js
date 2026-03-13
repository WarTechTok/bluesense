// backend/index.js
// ============================================
// MAIN SERVER - FIXED: Added dotenv back
// ============================================

// 🔴 FIX: Add this line back to load your .env file
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const readingRoutes = require("./routes/readings.js");
const authRoutes = require("./routes/auth.js");
const bookingRoutes = require("./routes/bookings.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public folder (for logo, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api", readingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://poolUser:poolUser123@poolcluster.brghuqk.mongodb.net/poolmonitor?appName=PoolCluster")
  .then(() => console.log("✅ Atlas Database Connected Successfully..."))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Dashboard API running at http://localhost:${port}`));