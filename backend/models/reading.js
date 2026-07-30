const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    oasis: {
        type: String,
        required: true,
        enum: ['oasis1', 'oasis2'],
        default: 'oasis1'
    },
    // FIX: Added min/max validation so Mongoose rejects out-of-range values
    // instead of saving garbage numbers from a malfunctioning sensor.
    ph: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    // FIX: Restricted to known valid values only — anything else gets rejected.
    turbidity: {
        type: String,
        required: true,
        enum: ['Clear', 'Cloudy', 'Dirty', 'Unknown']
    },
    // FIX: Pool temperature realistic range. DS18B20 error codes (-127, 85)
    // are outside this range so they get rejected automatically.
    temperature: {
        type: Number,
        required: true,
        min: -10,
        max: 50
    },
    // FIX: Restricted to known valid status values only.
    status: {
        type: String,
        required: true,
        enum: ['Normal', 'Need Cleaning']
    },
    timestamp: { type: Date, default: Date.now }
});

const Readings = mongoose.model("Readings", readingSchema);
module.exports = Readings;