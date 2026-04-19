const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Staff = require('./backend/models/Staff');

async function fixEmailMismatch() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bluesense');
    console.log('Connected to database\n');
    
    // Find the user with wrong email
    const wrongEmailUser = await User.findOne({ email: 'mhikejoshua@gmail.com' });
    if (!wrongEmailUser) {
      console.log('❌ User with mhikejoshua@gmail.com not found');
      const allUsers = await User.find().select('email name role');
      console.log('All users:', allUsers);
      await mongoose.connection.close();
      return;
    }
    
    console.log('Found user:', { email: wrongEmailUser.email, name: wrongEmailUser.name });
    
    // Find the staff record with correct email
    const correctStaff = await Staff.findOne({ email: 'mike.joshua@gmail.com' });
    if (!correctStaff) {
      console.log('❌ Staff with mike.joshua@gmail.com not found');
      const allStaff = await Staff.find().select('email name staffId');
      console.log('All staff:', allStaff);
      await mongoose.connection.close();
      return;
    }
    
    console.log('Found staff:', { email: correctStaff.email, name: correctStaff.name, staffId: correctStaff.staffId });
    
    // Update user email to match staff email
    console.log('\n🔄 Updating user email...');
    wrongEmailUser.email = 'mike.joshua@gmail.com';
    await wrongEmailUser.save();
    
    console.log('✅ User email updated to:', wrongEmailUser.email);
    console.log('✅ Now user and staff emails match!');
    console.log('\n📝 Next steps:');
    console.log('1. Logout from the app');
    console.log('2. Login with email: mike.joshua@gmail.com');
    console.log('3. Password: Mhike#123');
    console.log('4. Go to Staff Dashboard - should work now!');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixEmailMismatch();
