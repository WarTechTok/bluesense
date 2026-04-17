// backend/scripts/addSequentialBookingNumbers.js
// ============================================
// MIGRATION SCRIPT - Add sequential booking numbers
// Run with: node backend/scripts/addSequentialBookingNumbers.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const addSequentialBookingNumbers = async () => {
  try {
    console.log('🔄 Starting migration: Adding sequential booking numbers...\n');

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log(`📍 Connecting to MongoDB Atlas...\n`);
    
    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all bookings sorted by creation date
    const bookings = await Booking.find()
      .sort({ createdAt: 1 });

    console.log(`📋 Found ${bookings.length} bookings\n`);

    let updated = 0;

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const bookingNumber = i + 1;
      
      console.log(`📝 Booking #${bookingNumber}:`);
      console.log(`   ID: ${booking._id}`);
      console.log(`   Customer: ${booking.customerName}`);
      console.log(`   Reference: ${booking.bookingReference}`);
      console.log(`   Setting bookingNumber to: ${bookingNumber}`);

      // Add sequential booking number
      booking.bookingNumber = bookingNumber;
      await booking.save();

      console.log(`   ✅ Updated\n`);
      updated++;
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Added sequential numbers to ${updated} bookings\n`);

    console.log(`📋 Final booking list:`);
    const finalBookings = await Booking.find().sort({ bookingNumber: 1 });
    for (const b of finalBookings) {
      console.log(`   #${b.bookingNumber}: ${b.customerName} (Ref: ${b.bookingReference})`);
    }

    await mongoose.disconnect();
    console.log(`\n✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

addSequentialBookingNumbers();
