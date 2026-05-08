// backend/models/Package.js
// ============================================
// PACKAGE MODEL - with multi-image gallery support
// ============================================

const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
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

    // PRIMARY image — kept for full backward compatibility
    // Always mirrors images[0] when images array is used
    image: {
      type: String,
      default: "",
    },

    // GALLERY — array of Cloudinary URLs (max 10)
    // images[0] is always the primary/cover image
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "A package can have at most 10 images",
      },
    },

    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    minCapacity: {
      type: Number,
      default: 0,
    },

    inclusions: [{ type: String }],

    pricing: {
      type: Map,
      of: {
        weekday: { type: Number, default: 0 },
        weekend: { type: Number, default: 0 },
      },
    },

    availableSessions: [
      {
        type: String,
        enum: ["Day", "Night", "22hrs"],
      },
    ],

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

packageSchema.index({ oasis: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Package", packageSchema);