const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    oasis: {
        type: String,
        required: true,
        enum: ['oasis1', 'oasis2'],  // Which pool this reading is from
        default: 'oasis1'
    },
    ph: Number,
    turbidity: String,
    temperature: Number,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

const Readings = mongoose.model("Readings", readingSchema);
module.exports = Readings;