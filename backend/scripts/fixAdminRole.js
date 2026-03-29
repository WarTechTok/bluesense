// backend/scripts/fixAdminRole.js
// ============================================
// FIX ADMIN ROLE CASING - convert 'Admin' to 'admin'
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require("mongoose");
const User = require("../models/User");

const fixAdminRole = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users with capitalized role
    const usersWithCapitalRole = await User.find({
      $or: [
        { role: 'Admin' },
        { role: 'Staff' },
        { role: 'Customer' }
      ]
    });

    if (usersWithCapitalRole.length === 0) {
      console.log("✅ No users with capitalized roles found - all good!");
    } else {
      console.log(`⚠️ Found ${usersWithCapitalRole.length} users with capitalized roles:`);
      usersWithCapitalRole.forEach((user) => {
        console.log(`   - ${user.email} has role: ${user.role}`);
      });

      // Fix them
      console.log("\n🔄 Fixing role casing...");
      
      const updateResults = await Promise.all(
        usersWithCapitalRole.map(async (user) => {
          const newRole = user.role.toLowerCase();
          await User.updateOne(
            { _id: user._id },
            { role: newRole }
          );
          console.log(`   ✅ ${user.email}: ${user.role} → ${newRole}`);
        })
      );

      console.log("\n✅ All roles fixed!");
    }

    // Show all users and their roles
    const allUsers = await User.find({}).select('name email role');
    console.log("\n📋 Current users in database:");
    allUsers.forEach((user) => {
      console.log(`   ${user.email} [${user.role}]`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Done!");
    process.exit(0);
  }
};

fixAdminRole();
