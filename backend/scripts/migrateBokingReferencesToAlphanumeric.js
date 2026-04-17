// backend/scripts/migrateBokingReferencesToAlphanumeric.js
// ============================================
// MIGRATION SCRIPT - Convert numeric references to alphanumeric
// Run with: node backend/scripts/migrateBokingReferencesToAlphanumeric.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Sale = require('../models/Sale');

// Reference mapping: Convert numeric to alphanumeric
const referenceMap = {
  '1': 'A1B2C3',
  '2': 'D4E5F6',
  '3': 'G7H8I9',
  '4': 'J0K1L2',
  '5': 'M3N4O5',
};

const generateAlphanumericReference = (originalNumber) => {
  if (referenceMap[originalNumber]) {
    return referenceMap[originalNumber];
  }
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = '';
  for (let i = 0; i < 6; i++) {
    reference += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return reference;
};

const migrateBookingReferences = async () => {
  try {
    console.log('🔄 Starting migration: Converting numeric booking references to alphanumeric...\n');

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log(`📍 Connecting to MongoDB Atlas...\n`);
    
    // Connect to database
    await mongoose.connect(mongoUri, {
      
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all bookings with numeric references
    const bookings = await Booking.find({ bookingReference: { $exists: true } })
      .sort({ createdAt: 1 });

    console.log(`📋 Found ${bookings.length} bookings to migrate\n`);

    let updated = 0;

    for (const booking of bookings) {
      const oldRef = booking.bookingReference;
      
      // Check if it's a numeric reference
      if (/^\d+$/.test(oldRef)) {
        const newRef = generateAlphanumericReference(oldRef);
        
        console.log(`📝 Booking ${booking._id}:`);
        console.log(`   Customer: ${booking.customerName}`);
        console.log(`   Old Reference: ${oldRef} → New Reference: ${newRef}`);

        // Update booking
        booking.bookingReference = newRef;
        await booking.save();

        // Update corresponding sale record
        const sale = await Sale.findOne({ booking: booking._id });
        if (sale) {
          sale.bookingReference = newRef;
          sale.location = booking.oasis;
          await sale.save();
          console.log(`   ✅ Updated booking and sale record`);
        } else {
          console.log(`   ✅ Updated booking (no sale record)`);
        }

        updated++;
        console.log('');
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Updated ${updated} booking reference(s)\n`);
    console.log(`📋 Reference Mapping Applied:`);
    console.log(`   1 → A1B2C3`);
    console.log(`   2 → D4E5F6`);
    console.log(`   3 → G7H8I9`);
    console.log(`   4 → J0K1L2`);
    console.log(`   5 → M3N4O5\n`);

    // Verify migration
    const allBookings = await Booking.find().sort({ createdAt: 1 });
    console.log(`📋 All bookings after migration:`);
    for (const b of allBookings) {
      console.log(`   ${b.customerName}: ${b.bookingReference}`);
    }

    await mongoose.disconnect();
    console.log(`\n✅ Disconnected from database`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

migrateBookingReferences();

