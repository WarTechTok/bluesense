const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Staff = require('./backend/models/Staff');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bluesense');
    console.log('Connected');
    
    const users = await User.find({ role: 'staff' });
    console.log('\nStaff Users (' + users.length + '):');
    users.forEach(u => console.log('  ' + u.email + ' - ' + u.name));
    
    const staffs = await Staff.find({});
    console.log('\nStaff Records (' + staffs.length + '):');
    staffs.forEach(s => console.log('  ' + s.email + ' - ' + s.name + ' (ID: ' + s.staffId + ')'));
    
    console.log('\nMismatches:');
    for (const user of users) {
      const staff = await Staff.findOne({ email: user.email });
      if (!staff) {
        console.log('  ❌ ' + user.email + ' - NO Staff record');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
