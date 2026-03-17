// backend/scripts/createAdmin.js
// ============================================
// DEBUG VERSION - shows exactly what's in database
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

console.log("🔍 Current directory:", __dirname);
console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? "✅ FOUND" : "❌ NOT FOUND");

const debugDatabase = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🔍 DEBUG: Show database name
    const dbName = mongoose.connection.name;
    console.log(`📊 Database name: ${dbName}`);

    // 🔍 DEBUG: List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📚 Collections in database:", collections.map(c => c.name));

    // 🔍 DEBUG: Check if 'users' collection exists
    if (collections.some(c => c.name === 'users')) {
      console.log("✅ 'users' collection exists");
      
      // 🔍 DEBUG: Count all users
      const userCount = await User.countDocuments({});
      console.log(`📊 Total users in collection: ${userCount}`);

      if (userCount > 0) {
        // 🔍 DEBUG: Show all users
        const allUsers = await User.find({}).select('-password');
        console.log("📋 All users in database:");
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) [${user.role}]`);
        });

        // 🔍 DEBUG: Check for admin specifically
        const admin = await User.findOne({ role: "admin" });
        if (admin) {
          console.log("⚠️ ADMIN FOUND:");
          console.log(`   Name: ${admin.name}`);
          console.log(`   Email: ${admin.email}`);
        } else {
          console.log("✅ No admin user found - ready to create!");
          
          // Create admin since none exists
          console.log("🔄 Creating admin user...");
          const hashedPassword = await bcrypt.hash("admin123", 10);
          const newAdmin = await User.create({
            name: "Admin User",
            email: "admin@bluesense.com",
            password: hashedPassword,
            role: "admin"
          });
          console.log("✅ Admin created successfully!");
          console.log(`   Name: ${newAdmin.name}`);
          console.log(`   Email: ${newAdmin.email}`);
        }
      } else {
        console.log("📭 Users collection is EMPTY - creating admin...");
        
        // Create admin since collection is empty
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const newAdmin = await User.create({
          name: "Admin User",
          email: "admin@bluesense.com",
          password: hashedPassword,
          role: "admin"
        });
        console.log("✅ Admin created successfully!");
        console.log(`   Name: ${newAdmin.name}`);
        console.log(`   Email: ${newAdmin.email}`);
      }
    } else {
      console.log("❌ 'users' collection does NOT exist yet");
      console.log("🔄 Creating users collection and admin...");
      
      // Create admin (will auto-create collection)
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = await User.create({
        name: "Admin User",
        email: "admin@bluesense.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("✅ Admin created successfully!");
      console.log(`   Name: ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit();
  }
};

debugDatabase();