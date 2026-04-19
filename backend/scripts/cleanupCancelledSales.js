// backend/scripts/cleanupCancelledSales.js
// ============================================
// CLEANUP SCRIPT - Remove sale records for cancelled bookings
// Run with: node backend/scripts/cleanupCancelledSales.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Sale = require('../models/Sale');

const cleanupCancelledSales = async () => {
  try {
    console.log('🔄 Starting cleanup: Removing sales for cancelled bookings...\n');

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log(`📍 Connecting to MongoDB Atlas...\n`);
    
    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all cancelled bookings
    const cancelledBookings = await Booking.find({ status: 'Cancelled' });
    console.log(`📋 Found ${cancelledBookings.length} cancelled bookings\n`);

    let deleted = 0;

    for (const booking of cancelledBookings) {
      const sale = await Sale.findOne({ booking: booking._id });
      
      if (sale) {
        console.log(`🗑️  Deleting sale for cancelled booking:`);
        console.log(`   Customer: ${booking.customerName}`);
        console.log(`   Reference: ${booking.bookingReference}`);
        console.log(`   Amount: ₱${booking.totalAmount.toLocaleString()}`);

        await Sale.findByIdAndDelete(sale._id);
        deleted++;
        console.log(`   ✅ Deleted\n`);
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`📊 Removed ${deleted} sale record(s) for cancelled bookings\n`);

    // Show final summary
    const finalBookings = await Booking.find({ status: { $in: ['Confirmed', 'Completed'] } });
    const finalSales = await Sale.find();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log(`📊 Final Summary:`);
    console.log(`   Confirmed/Completed Bookings: ${finalBookings.length}`);
    console.log(`   Total Sale Records: ${finalSales.length}`);
    console.log(`   Total Revenue: ₱${(totalRevenue[0]?.total || 0).toLocaleString()}\n`);

    await mongoose.disconnect();
    console.log(`✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    process.exit(1);
  }
};

cleanupCancelledSales();
