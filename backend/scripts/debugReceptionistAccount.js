// backend/scripts/debugReceptionistAccount.js
// ============================================
// DEBUG SCRIPT - Check receptionist account status
// ============================================
// Usage: node backend/scripts/debugReceptionistAccount.js

const mongoose = require('mongoose');
require('dotenv').config();

const Staff = require('../models/Staff');
const User = require('../models/User');

async function debugReceptionistAccount() {
  try {
    console.log('🔍 Checking receptionist account...\n');

    const email = 'michaelpauig326@gmail.com';

    // Check in Staff model
    console.log('1️⃣ Checking Staff model for:', email);
    const staffAccount = await Staff.findOne({ email: email.toLowerCase() });
    if (staffAccount) {
      console.log('   ✅ FOUND in Staff model');
      console.log('   - Name:', staffAccount.name);
      console.log('   - Role:', staffAccount.role);
      console.log('   - Position:', staffAccount.position);
      console.log('   - Status:', staffAccount.status);
      console.log('   - Staff ID:', staffAccount.staffId);
    } else {
      console.log('   ❌ NOT FOUND in Staff model');
    }

    console.log('\n2️⃣ Checking User model for:', email);
    const userAccount = await User.findOne({ email: email.toLowerCase() });
    if (userAccount) {
      console.log('   ⚠️ FOUND in User model (DUPLICATE - SHOULD BE DELETED)');
      console.log('   - Name:', userAccount.name);
      console.log('   - Role:', userAccount.role);
      console.log('   - Position:', userAccount.position || 'NOT SET');
      console.log('\n   🔧 FIX: Delete this User account - it will cause login issues.');
      console.log('   The account will use Staff model instead.');
    } else {
      console.log('   ✅ NOT FOUND in User model (GOOD - no duplicates)');
    }

    console.log('\n📝 Summary:');
    if (staffAccount && staffAccount.position === 'Receptionist' && staffAccount.status === 'Active') {
      console.log('✅ Receptionist account is properly configured!');
      console.log('   The account should now work with the new login flow.');
      if (userAccount) {
        console.log('   ⚠️ But there\'s a duplicate User record.');
        console.log('   🔧 Deleting the duplicate User record...\n');
        await User.deleteOne({ email: email.toLowerCase() });
        console.log('   ✅ Duplicate User record deleted successfully!');
      }
    } else if (staffAccount && staffAccount.status === 'Disabled') {
      console.log('❌ Account is DISABLED. Enable it from the admin panel.');
    } else if (!staffAccount) {
      console.log('❌ Account not found in Staff model. Create it from the admin panel.');
    }

    console.log('\n✨ Done! You can now try logging in.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Connect to MongoDB and run debug
console.log('🔗 Connecting to MongoDB Atlas...\n');
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('📦 Connected to MongoDB\n');
  debugReceptionistAccount();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
