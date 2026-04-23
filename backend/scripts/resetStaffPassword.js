// backend/scripts/resetStaffPassword.js
// ============================================
// RESET STAFF PASSWORD
// ============================================
// Usage: node backend/scripts/resetStaffPassword.js <email> <new_password>
// Example: node backend/scripts/resetStaffPassword.js mhikejoshua@gmail.com Test@1234

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Staff = require('../models/Staff');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Usage: node resetStaffPassword.js <email> <new_password>');
      console.log('   Example: node resetStaffPassword.js mhikejoshua@gmail.com Test@1234');
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to database\n');

    // Find staff account
    const staff = await Staff.findOne({ email: email.toLowerCase() });
    
    if (!staff) {
      console.log(`❌ Staff account not found: ${email}`);
      await mongoose.connection.close();
      return;
    }

    console.log(`📋 Found Staff Account: ${staff.name}`);
    console.log(`   Email: ${staff.email}`);
    console.log(`   Position: ${staff.position}\n`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    staff.password = hashedPassword;
    await staff.save();

    console.log('✅ Password reset successfully!');
    console.log(`\n🔐 New Login Credentials:`);
    console.log(`   Email: ${staff.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n   You can now login at: http://localhost:3000/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

resetPassword();
