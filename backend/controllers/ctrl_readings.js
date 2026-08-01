// backend/controllers/ctrl_readings.js
// ============================================
// READINGS CONTROLLER - For sensor data
// ============================================

const Readings = require("../models/reading.js");
const Settings = require("../models/Settings.js");

// ============================================
// Shared status calculator
// FIX: Now also considers ORP — low ORP means insufficient disinfection.
// ============================================
function calculateStatus(ph, turbidity, orp) {
    const phBad      = ph < 7.2 || ph > 7.8;
    const turbBad    = turbidity !== "Clear";
    // ORP below 400 mV = insufficient chlorine (WHO/CDC guideline)
    const orpBad     = (orp !== null && orp !== undefined) && orp < 400;
    return (phBad || turbBad || orpBad) ? "Need Cleaning" : "Normal";
}

// ============================================
// Add new reading from ESP32 (authenticated)
// ============================================
const addReading = async (req, res) => {
    try {
        const { oasis, ph, turbidity, temperature, orp } = req.body;

        if (!oasis) return res.status(400).json({ error: "oasis field is required (oasis1 or oasis2)" });
        if (ph === undefined || ph === null) return res.status(400).json({ error: "ph is required" });
        if (temperature === undefined || temperature === null) return res.status(400).json({ error: "temperature is required" });
        if (!turbidity) return res.status(400).json({ error: "turbidity is required" });

        const status = calculateStatus(ph, turbidity, orp);

        const newReading = new Readings({ oasis, ph, turbidity, temperature, orp: orp ?? null, status });
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
        const { oasis, ph, turbidity, temperature, orp } = req.body;

        console.log("📥 Public reading received:", { oasis, ph, turbidity, temperature, orp });

        if (!oasis) return res.status(400).json({ error: "oasis field is required (oasis1 or oasis2)" });
        if (ph === undefined || ph === null) return res.status(400).json({ error: "ph is required" });
        if (temperature === undefined || temperature === null) return res.status(400).json({ error: "temperature is required" });
        if (!turbidity) return res.status(400).json({ error: "turbidity is required" });

        const status = calculateStatus(ph, turbidity, orp);

        const newReading = new Readings({ oasis, ph, turbidity, temperature, orp: orp ?? null, status });
        await newReading.save();

        console.log(`✅ Public reading saved for ${oasis} — pH:${ph} ORP:${orp ?? "N/A"} status:${status}`);
        res.status(200).json({ message: "Reading saved successfully", oasis, status });
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
        if (oasis) filter.oasis = oasis;

        const latest = await Readings.findOne(filter).sort({ timestamp: -1 });

        if (!latest) {
            return res.status(200).json({
                message: "No readings yet",
                oasis: oasis || "unknown",
                ph: null,
                temperature: null,
                turbidity: "No Data",
                orp: null,
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
        if (oasis) filter.oasis = oasis;

        const limit = Math.min(parseInt(req.query.limit) || 100, 500);

        const history = await Readings.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json(history || []);
    } catch (error) {
        console.error("Error in getHistory:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Set which oasis the ESP32 should monitor
// ============================================
const setCurrentOasis = async (req, res) => {
    try {
        const { oasis } = req.body;

        if (oasis !== 'oasis1' && oasis !== 'oasis2' && oasis !== 'none') {
            return res.status(400).json({ error: "Invalid oasis. Must be 'oasis1', 'oasis2', or 'none'" });
        }

        await Settings.findOneAndUpdate(
            { key: 'currentOasis' },
            { value: oasis },
            { upsert: true, new: true }
        );

        const label = oasis === 'oasis1' ? 'Oasis 1' : oasis === 'oasis2' ? 'Oasis 2' : 'IDLE (none)';
        console.log(`📡 ESP32 should now monitor: ${label}`);

        res.json({
            success: true,
            oasis,
            message: oasis === 'none'
                ? "ESP32 monitoring stopped — waiting for admin selection"
                : `ESP32 will now monitor ${label}`
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
        await Settings.findOneAndUpdate(
            { key: 'currentOasis' },
            { value: 'none' },
            { upsert: true, new: true }
        );

        console.log("🛑 ESP32 monitoring stopped - going idle");
        res.json({ success: true, oasis: 'none', message: "ESP32 monitoring stopped" });
    } catch (error) {
        console.error("Error stopping monitoring:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// Get current oasis the ESP32 should monitor
// ============================================
const getCurrentOasis = async (req, res) => {
    try {
        let setting = await Settings.findOne({ key: 'currentOasis' });

        if (!setting) {
            setting = await Settings.create({ key: 'currentOasis', value: 'none' });
            console.log("📋 Initialized currentOasis setting to 'none'");
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