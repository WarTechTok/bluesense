// backend/scripts/cleanupLegacyStaffAccounts.js
// ============================================
// CLEANUP - Remove duplicate legacy staff accounts from User model
// ============================================
// Usage: node backend/scripts/cleanupLegacyStaffAccounts.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Staff = require('../models/Staff');

async function cleanupLegacyStaffAccounts() {
  try {
    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    // Find all legacy staff accounts in User model
    const legacyStaffAccounts = await User.find({ role: 'staff' });
    
    if (legacyStaffAccounts.length === 0) {
      console.log('✅ No legacy staff accounts to clean up!');
      await mongoose.connection.close();
      return;
    }

    console.log(`📋 Found ${legacyStaffAccounts.length} legacy staff account(s) to review:\n`);

    let deletedCount = 0;
    let skippedCount = 0;

    for (const legacyStaff of legacyStaffAccounts) {
      try {
        // Check if this account exists in Staff model
        const existsInStaffModel = await Staff.findOne({ email: legacyStaff.email.toLowerCase() });
        
        if (existsInStaffModel) {
          console.log(`🗑️  Deleting duplicate: ${legacyStaff.email}`);
          console.log(`   Name: ${legacyStaff.name}`);
          console.log(`   (Account already exists in Staff model as: ${existsInStaffModel.name})`);
          
          // Delete the legacy account
          await User.deleteOne({ _id: legacyStaff._id });
          deletedCount++;
        } else {
          console.log(`⏭️  Skipped: ${legacyStaff.email}`);
          console.log(`   (No matching account in Staff model)`);
          skippedCount++;
        }
        console.log('');
      } catch (error) {
        console.log(`❌ Error processing ${legacyStaff.email}: ${error.message}`);
      }
    }

    console.log('=====================================');
    console.log(`✅ Cleaned up: ${deletedCount} duplicate account(s)`);
    console.log(`⏭️  Skipped: ${skippedCount}`);

    if (deletedCount > 0) {
      console.log(`\n✨ Cleanup complete! All staff now use the Staff model.`);
    }

  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

cleanupLegacyStaffAccounts();
