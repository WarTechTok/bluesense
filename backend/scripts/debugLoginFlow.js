// backend/scripts/debugLoginFlow.js
// ============================================
// DEBUG LOGIN FLOW - Trace through both staff accounts
// ============================================
// Usage: node backend/scripts/debugLoginFlow.js <email> <password>
// Example: node backend/scripts/debugLoginFlow.js mhikejoshua@gmail.com TestPassword@123

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Staff = require('../models/Staff');

async function debugLogin() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log('❌ Usage: node debugLoginFlow.js <email> <password>');
      console.log('   Example: node debugLoginFlow.js mhikejoshua@gmail.com TestPassword@123\n');
      
      console.log('📋 AVAILABLE STAFF ACCOUNTS:');
      
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      await mongoose.connect(mongoUri);
      
      const staffAccounts = await Staff.find({});
      staffAccounts.forEach(staff => {
        console.log(`   Email: ${staff.email} | Position: ${staff.position} | Status: ${staff.status}`);
      });
      
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    console.log(`🔍 Attempting login with: ${email}`);
    console.log('='.repeat(60) + '\n');

    // STEP 1: Check User model
    console.log('STEP 1: Checking User model...');
    const userAccount = await User.findOne({ email });
    if (userAccount) {
      console.log(`   ✓ Found in User model`);
      console.log(`     Name: ${userAccount.name}`);
      console.log(`     Role: ${userAccount.role}`);
      
      const userPasswordMatch = await bcrypt.compare(password, userAccount.password);
      console.log(`     Password match: ${userPasswordMatch ? '✅ YES' : '❌ NO'}`);
      console.log('');
    } else {
      console.log('   ✗ Not found in User model\n');
    }

    // STEP 2: Check Staff model
    console.log('STEP 2: Checking Staff model...');
    const staffAccount = await Staff.findOne({ email: email.toLowerCase() });
    if (staffAccount) {
      console.log(`   ✓ Found in Staff model`);
      console.log(`     Name: ${staffAccount.name}`);
      console.log(`     Role: ${staffAccount.role}`);
      console.log(`     Position: ${staffAccount.position}`);
      console.log(`     Status: ${staffAccount.status}`);
      
      // Check if password hash exists
      if (!staffAccount.password) {
        console.log(`     ❌ ERROR: No password hash found!`);
      } else {
        const staffPasswordMatch = await bcrypt.compare(password, staffAccount.password);
        console.log(`     Password match: ${staffPasswordMatch ? '✅ YES' : '❌ NO'}`);
      }
      console.log('');
    } else {
      console.log('   ✗ Not found in Staff model\n');
    }

    // STEP 3: Simulate login flow
    console.log('STEP 3: Simulating unified login flow...');
    console.log('='.repeat(60));
    
    if (userAccount) {
      console.log('→ Customer account found first (would attempt customer login)');
      const match = await bcrypt.compare(password, userAccount.password);
      if (match) {
        console.log('✅ Would login as CUSTOMER');
      } else {
        console.log('❌ Password mismatch (would fail)');
      }
    } else if (staffAccount) {
      console.log('→ No customer account, checking staff...');
      if (!staffAccount.password) {
        console.log('❌ ERROR: Staff password hash is missing or corrupted!');
      } else {
        const match = await bcrypt.compare(password, staffAccount.password);
        if (match) {
          console.log('✅ Would login as STAFF');
        } else {
          console.log('❌ Password mismatch (would fail)');
        }
      }
    } else {
      console.log('❌ Account not found in either model (would fail)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugLogin();
