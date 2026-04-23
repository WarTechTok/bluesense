// backend/scripts/checkStaffAccounts.js
// ============================================
// CHECK ALL STAFF ACCOUNTS - Verify Staff Model setup
// ============================================
// Usage: node backend/scripts/checkStaffAccounts.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../models/Staff');
const User = require('../models/User');

async function checkStaffAccounts() {
  try {
    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    console.log('📊 STAFF ACCOUNTS IN STAFF MODEL:');
    console.log('=====================================\n');
    
    const staffAccounts = await Staff.find({});
    
    if (staffAccounts.length === 0) {
      console.log('❌ No staff accounts found in Staff model!');
    } else {
      staffAccounts.forEach((staff, index) => {
        console.log(`${index + 1}. ${staff.name}`);
        console.log(`   Email: ${staff.email}`);
        console.log(`   Role: ${staff.role}`);
        console.log(`   Position: ${staff.position}`);
        console.log(`   Status: ${staff.status}`);
        console.log(`   Staff ID: ${staff.staffId}`);
        console.log('');
      });
    }

    console.log('\n📊 STAFF ACCOUNTS IN USER MODEL (Legacy):');
    console.log('=====================================\n');
    
    const userStaffAccounts = await User.find({ role: 'staff' });
    
    if (userStaffAccounts.length === 0) {
      console.log('✅ No legacy staff accounts in User model (all migrated!)');
    } else {
      console.log(`⚠️  Found ${userStaffAccounts.length} legacy staff account(s):\n`);
      userStaffAccounts.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('   ⚠️  Need migration to Staff model');
        console.log('');
      });
    }

    console.log('=====================================');
    console.log(`Total in Staff model: ${staffAccounts.length}`);
    console.log(`Total in User model (legacy): ${userStaffAccounts.length}`);
    console.log(`Total staff accounts: ${staffAccounts.length + userStaffAccounts.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkStaffAccounts();
