const mongoose = require('mongoose');
const fs = require('fs');

// Load .env
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const User = require('./backend/models/User');
const Staff = require('./backend/models/Staff');

async function diagnose() {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/bluesense';
    console.log('Connecting to:', mongoUrl);
    
    await mongoose.connect(mongoUrl);
    console.log('\n✅ Connected to MongoDB\n');
    
    // Get all staff users
    const staffUsers = await User.find({ role: 'staff' }).select('email name _id');
    console.log('📋 STAFF USERS (in User collection):');
    if (staffUsers.length === 0) {
      console.log('  (none found)');
    } else {
      staffUsers.forEach(u => {
        console.log(`  • Email: ${u.email} | Name: ${u.name} | ID: ${u._id}`);
      });
    }
    
    // Get all staff records
    const staffRecords = await Staff.find({}).select('email name staffId _id');
    console.log('\n📋 STAFF RECORDS (in Staff collection):');
    if (staffRecords.length === 0) {
      console.log('  (none found)');
    } else {
      staffRecords.forEach(s => {
        console.log(`  • Email: ${s.email} | Name: ${s.name} | StaffID: ${s.staffId} | MongoDB ID: ${s._id}`);
      });
    }
    
    // Check for mismatches
    console.log('\n🔍 CHECKING FOR MISMATCHES:');
    for (const user of staffUsers) {
      const staff = await Staff.findOne({ email: user.email });
      if (!staff) {
        console.log(`  ❌ User ${user.email} has NO matching Staff record`);
      } else {
        console.log(`  ✅ User ${user.email} ← → Staff ${staff.email}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

diagnose();
