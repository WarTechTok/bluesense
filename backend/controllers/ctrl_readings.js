// backend/controllers/ctrl_readings.js
// ============================================
// READINGS CONTROLLER - For sensor data
// ============================================

const Readings = require("../models/reading.js");

// ============================================
// Add new reading from ESP32
// ============================================
const addReading = async (req, res) => {
    try {
        const newReading = new Readings(req.body);
        await newReading.save();
        res.status(200).json({ message: "Reading saved successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ============================================
// Get latest reading - FIXED: handle empty collection
// ============================================
const getLatest = async (req, res) => {
    try {
        const latest = await Readings.findOne().sort({ timestamp: -1 });
        
        // Kung walang data, mag-send ng default response
        if (!latest) {
            return res.status(200).json({
                message: "No readings yet",
                ph: 0,
                temperature: 0,
                turbidity: "No Data",
                timestamp: new Date(),
                formattedTime: new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })
            });
        }

        res.json({
            ...latest._doc,
            formattedTime: latest.timestamp.toLocaleString("en-PH", { timeZone: "Asia/Manila" })
        });
    } catch (error) {
        console.error("Error in getLatest:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Get all readings history - NO LIMIT
// ============================================
const getHistory = async (req, res) => {
    try {
        const history = await Readings.find().sort({ timestamp: -1 });
        res.json(history || []);
    } catch (error) {
        console.error("Error in getHistory:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addReading, getLatest, getHistory };