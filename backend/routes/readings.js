const express = require("express");
const { 
    addReading, 
    getLatest, 
    getHistory,
    setCurrentOasis,
    getCurrentOasis
} = require("../controllers/ctrl_readings.js");

const router = express.Router();

router.post("/readings", addReading);
router.get("/readings/latest", getLatest);
router.get("/readings/history", getHistory);

// NEW: Oasis switching endpoints
router.post("/readings/set-oasis", setCurrentOasis);
router.get("/readings/current-oasis", getCurrentOasis);

module.exports = router;