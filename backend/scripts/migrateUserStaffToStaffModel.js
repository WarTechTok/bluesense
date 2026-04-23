// backend/scripts/migrateUserStaffToStaffModel.js
// ============================================
// MIGRATION SCRIPT: Move staff accounts from User model to Staff model
// ============================================
// Usage: node backend/scripts/migrateUserStaffToStaffModel.js
// This script safely migrates existing staff accounts that were created in the User model
// to the proper Staff model, preserving passwords and data.

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Staff = require('../models/Staff');

async function migrateStaffAccounts() {
  try {
    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    // Find all staff accounts in User model
    const userStaffAccounts = await User.find({ role: 'staff' });
    
    if (userStaffAccounts.length === 0) {
      console.log('ℹ️  No staff accounts found in User model to migrate.');
      await mongoose.connection.close();
      return;
    }

    console.log(`📋 Found ${userStaffAccounts.length} staff account(s) to migrate:\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const userStaff of userStaffAccounts) {
      try {
        // Check if staff already exists in Staff model
        const existingStaff = await Staff.findOne({ email: userStaff.email.toLowerCase() });
        
        if (existingStaff) {
          console.log(`⏭️  Skipped: ${userStaff.email} (already exists in Staff model)`);
          skippedCount++;
          continue;
        }

        // Generate sequential staff ID
        const lastStaff = await Staff.findOne().sort({ createdAt: -1 });
        let staffId = 'STF-0001';
        if (lastStaff && lastStaff.staffId) {
          const lastNum = parseInt(lastStaff.staffId.split('-')[1]) || 0;
          staffId = `STF-${String(lastNum + 1).padStart(4, '0')}`;
        }

        // Create new staff account in Staff model
        const newStaffAccount = new Staff({
          staffId,
          name: userStaff.name,
          email: userStaff.email.toLowerCase(),
          password: userStaff.password, // Keep hashed password
          role: 'staff',
          position: userStaff.position || 'Housekeeper',
          status: 'Active',
          createdAt: userStaff.createdAt
        });

        await newStaffAccount.save();
        console.log(`✅ Migrated: ${userStaff.email} (${newStaffAccount.staffId})`);
        successCount++;

      } catch (error) {
        console.log(`❌ Error migrating ${userStaff.email}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (already migrated): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (successCount > 0) {
      console.log(`\n✨ Staff accounts have been migrated to the Staff model!`);
      console.log(`   Staff can now use the /staff-login endpoint.`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

migrateStaffAccounts();
