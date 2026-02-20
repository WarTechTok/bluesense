const express = require("express");
const { addReading, getLatest, getHistory } = require("../controllers/ctrl_readings.js");

const router = express.Router();

router.post("/readings", addReading);
router.get("/readings/latest", getLatest);
router.get("/readings/history", getHistory);

module.exports = router;