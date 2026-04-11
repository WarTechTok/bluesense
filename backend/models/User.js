// backend/models/User.js
// ============================================
// USER MODEL - with email verification
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
  // Google OAuth and Avatar
  googleId: {
    type: String,
    default: null
  },
  googleAvatar: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  // ============================================
  // EMAIL VERIFICATION FIELDS (ADD THESE)
  // ============================================
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  }
  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);