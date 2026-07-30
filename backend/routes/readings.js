// backend/routes/readings.js
// ============================================
// READINGS ROUTES - For sensor data
// ============================================

const express = require("express");
// FIX: Removed unused Readings import — it was imported here but never used.
// All database operations go through the controller, not the routes file.
const {
    addReading,
    addReadingPublic,
    getLatest,
    getHistory,
    setCurrentOasis,
    getCurrentOasis,
    stopMonitoring
} = require("../controllers/ctrl_readings.js");
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No authentication required (for ESP32)
// ============================================

// POST - ESP32 sends readings (public, no auth needed)
router.post("/readings/public", addReadingPublic);

// GET - ESP32 checks which oasis to monitor (public, no auth needed)
router.get("/readings/current-oasis", getCurrentOasis);

// ============================================
// AUTHENTICATED ROUTES - For admin dashboard
// ============================================

router.post("/readings", verifyToken, addReading);
router.get("/readings/latest", verifyToken, getLatest);
// FIX: Added verifyToken — getHistory was listed as authenticated in the
// comment but had no middleware actually protecting it. Anyone could call
// /api/readings/history and get all sensor data without logging in.
router.get("/readings/history", verifyToken, getHistory);
router.post("/readings/set-oasis", verifyToken, setCurrentOasis);
router.post("/readings/stop", verifyToken, stopMonitoring);

module.exports = router;