// backend/models/User.js
// ============================================
// USER MODEL - with forgot password fields
// ============================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "staff", "customer"],
    default: "customer"
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lastFailedAttempt: {
    type: Date,
    default: null
  },
  // 🔴 NEW: For forgot password
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);