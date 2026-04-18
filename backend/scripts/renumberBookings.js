// backend/scripts/renumberBookings.js
// ============================================
// MIGRATION SCRIPT - Renumber bookings sequentially from 1 (excluding cancelled)
// Run with: node backend/scripts/renumberBookings.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Sale = require('../models/Sale');

const renumberBookings = async () => {
  try {
    console.log('🔄 Starting renumbering: Assigning sequential booking numbers...\n');

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log(`📍 Connecting to MongoDB Atlas...\n`);
    
    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get ALL bookings (including cancelled) sorted by creation date
    const allBookings = await Booking.find()
      .sort({ createdAt: 1 });

    console.log(`📋 Found ${allBookings.length} total bookings\n`);

    // Step 1: Clear booking numbers for all cancelled bookings
    console.log('Step 1: Clearing booking numbers for cancelled bookings...\n');
    const cancelledBookings = allBookings.filter(b => b.status === 'Cancelled');
    for (const booking of cancelledBookings) {
      console.log(`   ⏭️  Clearing number for: ${booking.customerName}`);
      booking.bookingNumber = null;
      await booking.save();
    }

    // Step 2: Get active bookings and renumber them
    console.log(`\nStep 2: Renumbering active bookings...\n`);
    const activeBookings = allBookings.filter(b => b.status !== 'Cancelled');

    let newNumber = 1;

    for (const booking of activeBookings) {
      const oldNumber = booking.bookingNumber;
      
      console.log(`📝 Renumbering booking:`);
      console.log(`   Customer: ${booking.customerName}`);
      console.log(`   Old Number: ${oldNumber} → New Number: ${newNumber}`);
      
      // Update booking with new number
      booking.bookingNumber = newNumber;
      await booking.save();
      
      // Update corresponding sale record
      const sale = await Sale.findOne({ booking: booking._id });
      if (sale) {
        sale.bookingNumber = newNumber;
        await sale.save();
        console.log(`   ✅ Updated booking and sale record`);
      } else {
        console.log(`   ✅ Updated booking (no sale record)`);
      }
      
      newNumber++;
      console.log('');
    }

    console.log(`\n✅ Renumbering complete!`);
    console.log(`📊 Active bookings renumbered: ${newNumber - 1}\n`);

    // Show final summary
    const finalBookings = await Booking.find()
      .sort({ bookingNumber: 1 });
    
    console.log(`📋 Final booking list:`);
    for (const b of finalBookings) {
      if (b.bookingNumber) {
        console.log(`   #${b.bookingNumber}: ${b.customerName} (${b.status}) - ₱${b.totalAmount.toLocaleString()}`);
      } else {
        console.log(`   (Cancelled): ${b.customerName} - Ref: ${b.bookingReference}`);
      }
    }

    const finalSales = await Sale.find()
      .sort({ bookingNumber: 1 });
    
    console.log(`\n📋 Sales records (${finalSales.length} total):`);
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    for (const s of finalSales) {
      console.log(`   #${s.bookingNumber}: ₱${s.amount?.toLocaleString()}`);
    }
    console.log(`\n   Total Revenue: ₱${(totalRevenue[0]?.total || 0).toLocaleString()}`);

    await mongoose.disconnect();
    console.log(`\n✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

renumberBookings();
