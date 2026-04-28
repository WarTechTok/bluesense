// backend/controllers/ctrl_readings.js
// ============================================
// READINGS CONTROLLER - For sensor data
// ============================================

const Readings = require("../models/reading.js");
const Settings = require("../models/Settings.js");

// ============================================
// Add new reading from ESP32 (authenticated)
// ============================================
const addReading = async (req, res) => {
    try {
        const { oasis, ph, turbidity, temperature, status } = req.body;
        
        if (!oasis) {
            return res.status(400).json({ error: "oasis field is required (oasis1 or oasis2)" });
        }
        
        const newReading = new Readings({
            oasis,
            ph,
            turbidity,
            temperature,
            status
        });
        
        await newReading.save();
        res.status(200).json({ message: "Reading saved successfully", oasis });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ============================================
// PUBLIC: Add new reading from ESP32 (no auth)
// ============================================
const addReadingPublic = async (req, res) => {
    try {
        const { oasis, ph, turbidity, temperature, status } = req.body;
        
        console.log("📥 Public reading received:", { oasis, ph, turbidity, temperature });
        
        if (!oasis) {
            return res.status(400).json({ error: "oasis field is required (oasis1 or oasis2)" });
        }
        
        const newReading = new Readings({
            oasis,
            ph: ph || 0,
            turbidity: turbidity || "Unknown",
            temperature: temperature || 0,
            status: status || "Normal"
        });
        
        await newReading.save();
        console.log(`✅ Public reading saved for ${oasis}`);
        res.status(200).json({ message: "Reading saved successfully", oasis });
    } catch (err) {
        console.error("Error saving public reading:", err);
        res.status(400).json({ error: err.message });
    }
};

// ============================================
// Get latest reading for specific oasis
// ============================================
const getLatest = async (req, res) => {
    try {
        const { oasis } = req.query;
        
        const filter = {};
        if (oasis) {
            filter.oasis = oasis;
        }
        
        const latest = await Readings.findOne(filter).sort({ timestamp: -1 });
        
        if (!latest) {
            return res.status(200).json({
                message: "No readings yet",
                oasis: oasis || "unknown",
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
// Get history for specific oasis
// ============================================
const getHistory = async (req, res) => {
    try {
        const { oasis } = req.query;
        
        const filter = {};
        if (oasis) {
            filter.oasis = oasis;
        }
        
        const history = await Readings.find(filter).sort({ timestamp: -1 });
        res.json(history || []);
    } catch (error) {
        console.error("Error in getHistory:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Set which oasis the ESP32 should monitor (saved to database)
// ============================================
const setCurrentOasis = async (req, res) => {
    try {
        const { oasis } = req.body;
        
        if (oasis !== 'oasis1' && oasis !== 'oasis2') {
            return res.status(400).json({ error: "Invalid oasis. Must be 'oasis1' or 'oasis2'" });
        }
        
        // Save to database (persists across server restarts)
        await Settings.findOneAndUpdate(
            { key: 'currentOasis' },
            { value: oasis },
            { upsert: true, new: true }
        );
        
        console.log(`📡 ESP32 should now monitor: ${oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}`);
        
        res.json({ 
            success: true, 
            oasis: oasis,
            message: `ESP32 will now monitor ${oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}`
        });
    } catch (error) {
        console.error("Error setting current oasis:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// STOP monitoring (ESP32 goes idle)
// ============================================
const stopMonitoring = async (req, res) => {
    try {
        // Set current oasis to 'none' to stop ESP32 from sending data
        await Settings.findOneAndUpdate(
            { key: 'currentOasis' },
            { value: 'none' },
            { upsert: true, new: true }
        );
        
        console.log("🛑 ESP32 monitoring stopped - going idle");
        
        res.json({ 
            success: true, 
            oasis: 'none',
            message: "ESP32 monitoring stopped"
        });
    } catch (error) {
        console.error("Error stopping monitoring:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Get current oasis the ESP32 should monitor (from database)
// ============================================
const getCurrentOasis = async (req, res) => {
    try {
        let setting = await Settings.findOne({ key: 'currentOasis' });
        
        if (!setting) {
            // Create default setting if not exists
            setting = await Settings.create({ key: 'currentOasis', value: 'oasis1' });
        }
        
        res.json({ oasis: setting.value });
    } catch (error) {
        console.error("Error getting current oasis:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    addReading,
    addReadingPublic,
    getLatest, 
    getHistory,
    setCurrentOasis,
    getCurrentOasis,
    stopMonitoring
};