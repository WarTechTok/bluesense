// backend/models/User.js
// ============================================
// USER MODEL - with forgot password, Google OAuth, and avatar fields
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
  // For forgot password
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // ============================================
  // 🔴 NEW FIELDS - Google OAuth and Avatar
  // ============================================
  
  // Google ID for users who sign in with Google
  googleId: {
    type: String,
    default: null
  },
  
  // Google profile picture URL
  googleAvatar: {
    type: String,
    default: null
  },
  
  // Custom uploaded avatar URL
  avatar: {
    type: String,
    default: null
  },
  
  // Email verification status
  isEmailVerified: {
    type: Boolean,
    default: false
  }
  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);