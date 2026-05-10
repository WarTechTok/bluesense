// backend/scripts/resetOasisDefault.js
// ============================================
// ONE-TIME MIGRATION: Reset currentOasis to 'none'
//
// Run this ONCE if your database was already initialized with
// the old default of 'oasis1'. After this, the ESP32 will boot
// into idle state and wait for an admin to explicitly select an oasis.
//
// Usage:
//   node scripts/resetOasisDefault.js
//
// Safe to run multiple times — it's idempotent.
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/Settings');

async function resetOasisDefault() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const existing = await Settings.findOne({ key: 'currentOasis' });

    if (!existing) {
      console.log("ℹ️  No 'currentOasis' setting found — nothing to migrate.");
      console.log("   The next ESP32 poll will create it with value 'none'.\n");
    } else {
      console.log(`   Current value: "${existing.value}"`);

      if (existing.value === 'none') {
        console.log("✅ Already set to 'none' — no change needed.\n");
      } else {
        await Settings.findOneAndUpdate(
          { key: 'currentOasis' },
          { value: 'none' }
        );
        console.log("✅ Reset currentOasis from '" + existing.value + "' → 'none'\n");
        console.log("   ESP32 will now boot idle until admin selects an oasis.");
      }
    }

    await mongoose.disconnect();
    console.log('Done. Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

resetOasisDefault();