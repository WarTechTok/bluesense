// backend/scripts/createAdmin.js
// ============================================
// SEED SCRIPT - gumagawa ng unang admin account
// ============================================
// Run: node scripts/createAdmin.js
// ============================================

// Para siguradong tama ang path ng .env kahit saan ka mag-run
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Debug: tingnan kung na-load ang .env
console.log("🔍 Current directory:", __dirname);
console.log("🔍 Looking for .env at:", path.join(__dirname, '..', '.env'));
console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? "✅ FOUND" : "❌ NOT FOUND");

// Admin details - PWEDE MO BAGUHIN ITO
const adminData = {
  name: "Admin User",
  email: "admin@bluesense.com",
  password: "admin123",
  role: "admin"
};

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in .env file");
    }

    console.log("🔄 Connecting to MongoDB...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check kung may admin na
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists!");
      console.log("──────────────────────────");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log("──────────────────────────");
      console.log("No new admin created.");
      process.exit(0);
    }

    // I-hash ang password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Gumawa ng admin user
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });

    console.log("✅ Admin created successfully!");
    console.log("──────────────────────────");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${admin.role}`);
    console.log("──────────────────────────");
    console.log("You can now login with these credentials.");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    // I-disconnect sa database
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit();
  }
};

// I-run ang function
createAdmin();