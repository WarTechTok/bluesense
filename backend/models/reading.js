const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    ph: Number,
    turbidity: String,
    temperature: Number,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

const Readings = mongoose.model("Readings", readingSchema);
module.exports = Readings;