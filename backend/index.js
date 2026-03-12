const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const readingRoutes = require("./routes/readings.js");
const authRoutes = require("./routes/auth.js");
const bookingRoutes = require("./routes/bookings.js");

// Admin Dashboard Routes
const dashboardRoutes = require("./routes/dashboard.js");
const roomRoutes = require("./routes/rooms.js");
const reservationRoutes = require("./routes/reservations.js");
const inventoryRoutes = require("./routes/inventory.js");
const staffRoutes = require("./routes/staff.js");
const salesRoutes = require("./routes/sales.js");
const reportRoutes = require("./routes/reports.js");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// LOGGING MIDDLEWARE - track all requests
// ============================================
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", readingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Admin Dashboard API Routes
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/rooms", roomRoutes);
app.use("/api/admin/reservations", reservationRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/sales", salesRoutes);
app.use("/api/admin/reports", reportRoutes);

// ============================================
// MONGODB CONNECTION
// ============================================
// Uses MONGO_URI from .env file
// Auto-creates collections when models are used
const mongoUri = process.env.MONGO_URI || "mongodb+srv://poolUser:poolUser123@poolcluster.brghuqk.mongodb.net/poolmonitor?appName=PoolCluster";

mongoose.connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully");
    console.log(`📊 Database: poolmonitor`);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Dashboard API running at http://localhost:${port}`));