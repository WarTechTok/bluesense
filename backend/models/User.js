// backend/models/User.js
// ============================================
// USER MODEL - for admin, staff, and customers
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
    type: String  // contact number ng customer
  },
  address: {
    type: String  // optional
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);