// backend/controllers/ctrl_readings.js

const Readings = require("../models/reading.js");

const addReading = async (req, res) => {
    try{
        const newReading = new Readings(req.body);
        await newReading.save();
        res.status(200).send("Reading saved...");
    } catch (err) {
        res.status(400).send(err.message);
    }
};

const getLatest = async (req, res) => {
  const latest = await Readings.findOne().sort({ timestamp: -1 });
  res.json({
    ...latest._doc,
    formattedTime: latest.timestamp.toLocaleString("en-PH", { timeZone: "Asia/Manila" })
  });
};

// ✅ FIXED: REMOVE .limit(20)
const getHistory = async(req, res) => {
    const history = await Readings.find().sort({ timestamp: -1 }); // ← NO LIMIT
    res.json(history);
};

module.exports = { addReading, getLatest, getHistory };