// backend/scripts/addSequentialBookingNumbers.js
// ============================================
// MIGRATION SCRIPT - Add sequential booking numbers
// Run with: node backend/scripts/addSequentialBookingNumbers.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Sale = require('../models/Sale');

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
    let maxBookingNumber = 0;

    // First pass: find the maximum booking number
    for (const booking of bookings) {
      if (booking.bookingNumber && booking.bookingNumber > maxBookingNumber) {
        maxBookingNumber = booking.bookingNumber;
      }
    }

    console.log(`📊 Current max booking number: ${maxBookingNumber}\n`);

    // Second pass: assign booking numbers to those without them
    for (const booking of bookings) {
      if (!booking.bookingNumber) {
        maxBookingNumber++;
        const bookingNumber = maxBookingNumber;
        
        console.log(`📝 Booking #${bookingNumber}:`);
        console.log(`   ID: ${booking._id}`);
        console.log(`   Customer: ${booking.customerName}`);
        console.log(`   Reference: ${booking.bookingReference}`);
        console.log(`   Setting bookingNumber to: ${bookingNumber}`);

        // Add sequential booking number
        booking.bookingNumber = bookingNumber;
        await booking.save();

        // Update associated sale record
        const sale = await Sale.findOne({ booking: booking._id });
        if (sale) {
          sale.bookingNumber = bookingNumber;
          await sale.save();
          console.log(`   ✅ Updated booking and sale record\n`);
        } else {
          console.log(`   ✅ Updated booking (no sale record found)\n`);
        }
        
        updated++;
      } else {
        console.log(`✓ Booking #${booking.bookingNumber}: ${booking.customerName} (already has ID)\n`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Added sequential numbers to ${updated} bookings\n`);

    console.log(`📋 Final booking list:`);
    const finalBookings = await Booking.find().sort({ bookingNumber: 1 });
    for (const b of finalBookings) {
      console.log(`   #${b.bookingNumber}: ${b.customerName} (Ref: ${b.bookingReference})`);
    }

    console.log(`\n📋 Verifying Sales records with booking numbers:`);
    const salesWithNumbers = await Sale.find({ bookingNumber: { $exists: true, $ne: null } })
      .sort({ bookingNumber: 1 });
    console.log(`   Found ${salesWithNumbers.length} sales records with booking numbers\n`);

    await mongoose.disconnect();
    console.log(`✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

addSequentialBookingNumbers();
