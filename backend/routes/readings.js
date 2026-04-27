// backend/routes/readings.js
// ============================================
// READINGS ROUTES - For sensor data
// ============================================

const express = require("express");
const Readings = require("../models/reading.js");  // ← ADD THIS IMPORT
const { 
    addReading,
    addReadingPublic,
    getLatest, 
    getHistory,
    setCurrentOasis,
    getCurrentOasis
} = require("../controllers/ctrl_readings.js");

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No authentication required (for ESP32)
// ============================================

// POST - ESP32 sends readings (public)
router.post("/readings/public", addReadingPublic);

// GET - Public endpoint for ESP32 to check current oasis
router.get("/readings/current-oasis", getCurrentOasis);

// ============================================
// AUTHENTICATED ROUTES - For admin dashboard
// ============================================

router.post("/readings", addReading);
router.get("/readings/latest", getLatest);
router.get("/readings/history", getHistory);
router.post("/readings/set-oasis", setCurrentOasis);

module.exports = router;