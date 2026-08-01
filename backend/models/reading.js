const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    oasis: {
        type: String,
        required: true,
        enum: ['oasis1', 'oasis2'],
        default: 'oasis1'
    },
    ph: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    turbidity: {
        type: String,
        required: true,
        enum: ['Clear', 'Cloudy', 'Dirty', 'Unknown']
    },
    temperature: {
        type: Number,
        required: true,
        min: -10,
        max: 50
    },
    // FIX: Added ORP field — ESP32 sends this but it was silently dropped
    // because the schema didn't include it. Range -500..1000 mV is
    // the realistic pool ORP range validated on the ESP32 side.
    orp: {
        type: Number,
        required: false,
        min: -500,
        max: 1000,
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['Normal', 'Need Cleaning']
    },
    timestamp: { type: Date, default: Date.now }
});

const Readings = mongoose.model("Readings", readingSchema);
module.exports = Readings;