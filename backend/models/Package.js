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

    // ── PRICING ──────────────────────────────────────────────────────────────
    // This field stores TWO different shapes depending on the package type:
    //
    // Regular packages (Oasis 1 and Oasis 2 Package A/B):
    //   { "Day": { weekday: 9000, weekend: 9500 },
    //     "Night": { weekday: 10000, weekend: 10500 },
    //     "22hrs": { weekday: 15000, weekend: 16000 } }
    //
    // PAX-based packages (Package C — or any future package with isPaxBased:true):
    //   { "50pax": { "Day": 19000, "Night": 20000, "22hrs": 26000 },
    //     "100pax": { "Day": 20000, "Night": 21000, "22hrs": 30000 } }
    //   The pax numbers come from minCapacity / maxCapacity — they are DYNAMIC.
    //
    // WHY Mixed (not Map<string, {weekday,weekend}>):
    //   Mongoose's Map sub-schema validator would coerce any value that doesn't
    //   match { weekday: Number, weekend: Number } to { weekday: 0, weekend: 0 }.
    //   PAX-based values like { "Day": 19000 } don't match that shape, so they
    //   were silently zeroed out on every save.  Using Mixed + Schema.Types.Mixed
    //   disables that coercion while keeping full flexibility.
    // ─────────────────────────────────────────────────────────────────────────
    pricing: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Flag set automatically by the route based on pricing key shape.
    // true  → pricing keys are pax tiers ("50pax", "100pax", …)
    // false → pricing keys are session names ("Day", "Night", "22hrs")
    isPaxBased: {
      type: Boolean,
      default: false,
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