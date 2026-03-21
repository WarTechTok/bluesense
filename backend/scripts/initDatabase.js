// ============================================
// DATABASE SEED SCRIPT
// ============================================
// Creates all required collections and schema indexes
// Run: node scripts/initDatabase.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require("mongoose");

// Import all models to trigger schema creation
const User = require("../models/User");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const Inventory = require("../models/Inventory");
const Staff = require("../models/Staff");
const Sale = require("../models/Sale");

const initDatabase = async () => {
  try {
    console.log("🔍 Checking MongoDB Connection...");
    console.log("📌 MONGO_URI:", process.env.MONGO_URI ? "✅ FOUND" : "❌ NOT FOUND");

    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in .env file");
    }

    console.log("\n🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas\n");

    // ============================================
    // CREATE INDEXES AND COLLECTIONS
    // ============================================
    
    console.log("📋 Initializing Database Collections...\n");

    // User collection
    console.log("  ✓ Users collection");
    await User.collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    // Room collection  
    console.log("  ✓ Rooms collection");
    await Room.collection.createIndex({ name: 1 }).catch(() => {});

    // Reservation collection
    console.log("  ✓ Reservations collection");
    await Reservation.collection.createIndex({ status: 1 }).catch(() => {});

    // Inventory collection
    console.log("  ✓ Inventory collection");
    await Inventory.collection.createIndex({ itemName: 1 }).catch(() => {});

    // Staff collection
    console.log("  ✓ Staff collection");
    await Staff.collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    // Sale collection
    console.log("  ✓ Sales collection");
    await Sale.collection.createIndex({ createdAt: 1 }).catch(() => {});

    console.log("\n✅ Database initialization complete!");
    console.log("\n📊 Collection Summary:");
    console.log("  • Users (for login/authentication)");
    console.log("  • Rooms (pool/guest rooms)");
    console.log("  • Reservations (guest bookings)");
    console.log("  • Inventory (cleaning supplies & equipment)");
    console.log("  • Staff (staff accounts & assignments)");
    console.log("  • Sales (transaction records)");

    console.log("\n💡 Next Steps:");
    console.log("  1. Create admin: node scripts/createAdmin.js");
    console.log("  2. Start backend: node index.js");
    console.log("  3. Access at: http://localhost:8080");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run initialization
initDatabase();
