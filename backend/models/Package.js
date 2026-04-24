// backend/models/Package.js
// ============================================
// PACKAGE MODEL - Dynamic package management
// ============================================

const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    // Basic Info
    oasis: {
      type: String,
      enum: ["Oasis 1", "Oasis 2"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Image
    image: {
      type: String,
      default: "",
    },

    // Capacity - Simple: max capacity only
    // Minimum is handled separately for special packages
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Minimum capacity (only for packages that require a minimum)
    // e.g., Package 5+ needs min 30, Package C needs min 50
    minCapacity: {
      type: Number,
      default: 0,
    },

    // Inclusions (array of strings)
    inclusions: [
      {
        type: String,
      },
    ],

    // Pricing: dynamic for different sessions and day types
    pricing: {
      type: Map,
      of: {
        weekday: { type: Number, default: 0 },
        weekend: { type: Number, default: 0 },
      },
    },

    // Available sessions for this package
    availableSessions: [
      {
        type: String,
        enum: ["Day", "Night", "22hrs"],
      },
    ],

    // Order in display
    displayOrder: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique oasis+name
packageSchema.index({ oasis: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Package", packageSchema);
