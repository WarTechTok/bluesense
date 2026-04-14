// backend/scripts/migrateBookingReferences.js
// ============================================
// MIGRATION SCRIPT - Add bookingReference to existing bookings
// ============================================

require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Generate unique booking reference
const generateBookingReference = () => {
  const chars = 'ABCDEFHJKLMNPQRSTUVWXYZ0123456789';
  let reference = '';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
};

const migrateBookingReferences = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Find all bookings without bookingReference
    const bookingsWithoutRef = await Booking.find({ bookingReference: { $exists: false } });
    console.log(`📅 Found ${bookingsWithoutRef.length} bookings without reference`);

    if (bookingsWithoutRef.length === 0) {
      console.log('✅ All bookings already have references!');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const booking of bookingsWithoutRef) {
      try {
        let bookingReference;
        let isUnique = false;
        
        // Generate unique reference
        while (!isUnique) {
          bookingReference = generateBookingReference();
          const existingRef = await Booking.findOne({ bookingReference });
          if (!existingRef) {
            isUnique = true;
          }
        }

        // Update booking
        await Booking.findByIdAndUpdate(
          booking._id,
          { bookingReference },
          { new: true }
        );

        updated++;
        console.log(`✅ Updated: ${booking.customerName} → ${bookingReference}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to update ${booking._id}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Complete!`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateBookingReferences();
