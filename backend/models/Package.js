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

    // Base capacity — guests up to this number are included in the package price.
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    minCapacity: {
      type: Number,
      default: 0,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // NEW FIELD: maxExtraGuests
    // ─────────────────────────────────────────────────────────────────────────
    // WHAT: The maximum number of guests allowed ABOVE the base capacity
    //       (maxCapacity). The hard booking ceiling becomes:
    //         maxCapacity + maxExtraGuests
    //
    //       Example: maxCapacity=20, maxExtraGuests=10 → max total = 30 pax.
    //       Guests 1–20 → included in package price (no extra charge).
    //       Guests 21–30 → each pay extraGuestFee (₱150 by default).
    //       A booking for 31+ pax → BLOCKED with an error message.
    //
    // WHY:  Previously there was no upper bound on extra guests — only the
    //       base capacity (maxCapacity) existed. This lets admins enforce a
    //       hard cap per package (e.g. fire code limits, venue size).
    //
    // HOW:  type: Number — Mongoose stores it as a number in MongoDB.
    //       default: null — null means "no cap on extra guests". Any existing
    //       packages in the DB that don't have this field will read as null
    //       and behave exactly as before (no extra-guest upper limit enforced).
    //       This makes the change fully backward-compatible — no migration needed.
    //       min: 0 — prevents negative values. A value of 0 means zero extra
    //       guests are allowed (customers must stay at or below base capacity).
    // ─────────────────────────────────────────────────────────────────────────
    maxExtraGuests: {
      type: Number,
      default: null, // null = no cap; positive integer = hard ceiling above base
      min: 0,
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING FIELD: extraGuestFee  (per-package, NOT global)
    // ─────────────────────────────────────────────────────────────────────────
    // WHAT: The peso amount charged per guest above maxCapacity.
    // WHY:  Kept per-package so each package can have its own rate.
    //       No global Settings model is needed.
    // HOW:  default: 150 — existing packages that were saved before this field
    //       existed will automatically read as ₱150 (Mongoose applies the
    //       default at read time; no migration script required).
    // ─────────────────────────────────────────────────────────────────────────
    extraGuestFee: {
      type: Number,
      default: 150,
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
    //
    // WHY Mixed: Mongoose's typed Map would coerce PAX-based values and zero
    //   them out on every save. Mixed disables that coercion.
    // ─────────────────────────────────────────────────────────────────────────
    pricing: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

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