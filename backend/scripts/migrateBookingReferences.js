// backend/scripts/migrateBookingReferences.js
// ============================================
// MIGRATION SCRIPT - Convert all bookings to sequential numeric IDs
// ============================================

require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const migrateBookingReferences = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[OK] Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);

    // Get all bookings sorted by creation date
    const allBookings = await Booking.find().sort({ createdAt: 1 });
    console.log('Found', allBookings.length, 'total bookings');

    if (allBookings.length === 0) {
      console.log('No bookings found');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let failed = 0;

    // Assign sequential numeric IDs based on creation order
    for (let i = 0; i < allBookings.length; i++) {
      try {
        const newId = String(i + 1);
        const oldId = allBookings[i].bookingReference;

        // Update booking
        await Booking.findByIdAndUpdate(
          allBookings[i]._id,
          { bookingReference: newId },
          { new: true }
        );

        updated++;
        console.log('Booking', i + 1 + ':', allBookings[i].customerName, '| Old:', oldId, '-> New:', newId);
      } catch (error) {
        failed++;
        console.error('Failed to update booking', i + 1 + ':', error.message);
      }
    }

    console.log('Migration Complete!');
    console.log('Updated:', updated);
    console.log('Failed:', failed);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateBookingReferences();