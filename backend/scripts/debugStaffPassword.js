// backend/scripts/debugStaffPassword.js
// ============================================
// DEBUG - Check staff account password
// ============================================
// Usage: node backend/scripts/debugStaffPassword.js

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../models/Staff');

async function debugPassword() {
  try {
    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    // Get Mhike's account
    const staff = await Staff.findOne({ email: 'mhikejoshua@gmail.com' });
    
    if (!staff) {
      console.log('❌ Staff account not found!');
      await mongoose.connection.close();
      return;
    }

    console.log('📋 Staff Account Found:');
    console.log(`   Name: ${staff.name}`);
    console.log(`   Email: ${staff.email}`);
    console.log(`   Role: ${staff.role}`);
    console.log(`   Position: ${staff.position}`);
    console.log(`   Status: ${staff.status}`);
    console.log(`   Password Hash: ${staff.password.substring(0, 20)}...`);
    console.log('');

    // Test password verification
    const testPassword = 'Test@1234'; // Change this to the actual password
    
    console.log(`🔐 Testing password verification with: "${testPassword}"`);
    const isMatch = await bcrypt.compare(testPassword, staff.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match');
      console.log('   Make sure you enter the EXACT password used when creating the account');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugPassword();
