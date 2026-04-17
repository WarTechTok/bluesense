// backend/scripts/updateSalesWithBookingNumbers.js
// ============================================
// MIGRATION SCRIPT - Update Sale records with booking numbers
// Run with: node backend/scripts/updateSalesWithBookingNumbers.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Sale = require('../models/Sale');

const updateSalesWithBookingNumbers = async () => {
  try {
    console.log('🔄 Starting migration: Updating Sale records with booking numbers...\n');

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log(`📍 Connecting to MongoDB Atlas...\n`);
    
    // Connect to database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all sales
    const sales = await Sale.find()
      .populate('booking')
      .sort({ date: 1 });

    console.log(`📋 Found ${sales.length} sales records\n`);

    let updated = 0;

    for (const sale of sales) {
      if (sale.booking && sale.booking.bookingNumber) {
        console.log(`📝 Sale #${sale._id}:`);
        console.log(`   Customer: ${sale.booking.customerName}`);
        console.log(`   Booking Number: ${sale.booking.bookingNumber}`);

        sale.bookingNumber = sale.booking.bookingNumber;
        await sale.save();

        console.log(`   ✅ Updated\n`);
        updated++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Updated ${updated} sale record(s)\n`);

    console.log(`📋 Final sales list:`);
    const finalSales = await Sale.find()
      .populate('booking', 'customerName bookingNumber bookingReference oasis')
      .sort({ bookingNumber: 1 });
    for (const s of finalSales) {
      if (s.booking) {
        console.log(`   #${s.bookingNumber}: ${s.booking.customerName} (Ref: ${s.booking.bookingReference}) - ${s.booking.oasis}`);
      }
    }

    await mongoose.disconnect();
    console.log(`\n✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

updateSalesWithBookingNumbers();
