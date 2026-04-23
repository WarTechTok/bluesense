// backend/index.js
// ============================================
// MAIN SERVER - with Google OAuth and file upload support
// ============================================

require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fs = require('fs');

require("dotenv").config({ path: path.join(__dirname, ".env") });
const readingRoutes = require("./routes/readings.js");
const authRoutes = require("./routes/auth.js");
const bookingRoutes = require("./routes/bookings.js");

// Admin Dashboard Routes
const dashboardRoutes = require("./routes/dashboard.js");
const staffDashboardRoutes = require("./routes/staffDashboard.js");
const roomRoutes = require("./routes/rooms.js");
const reservationRoutes = require("./routes/reservations.js");
const inventoryRoutes = require("./routes/inventory.js");
const staffRoutes = require("./routes/staff.js");
const salesRoutes = require("./routes/sales.js");
const reportRoutes = require("./routes/reports.js");
const maintenanceRoutes = require("./routes/maintenance.js");

const app = express();

// Create uploads folder for payment proofs if it doesn't exist
const paymentProofDir = path.join(__dirname, 'uploads/payment-proofs');
if (!fs.existsSync(paymentProofDir)) {
  fs.mkdirSync(paymentProofDir, { recursive: true });
  console.log('✅ Created uploads/payment-proofs folder');
}

// ============================================
// CORS CONFIGURATION - Allow all origins (ESP32, frontend, etc.)
// ============================================
// 🔴 SIMPLIFIED - Allows ESP32, mobile apps, any client to connect
app.use(cors());

// Apply urlencoded and json AFTER cors
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// Serve static files from public folder (for logo, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// GOOGLE OAUTH SETUP
// ============================================

// Create uploads folder for avatars if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads/avatars folder');
}

// Serve static files for avatars and payment proofs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get callback URL from environment or use default
const getGoogleCallbackUrl = () => {
  // Use environment variable if set, otherwise use production URL
  const backendUrl = process.env.BACKEND_URL || 'https://bluesense.onrender.com';
  return `${backendUrl}/api/auth/google/callback`;
};

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getGoogleCallbackUrl()
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract user data from Google profile
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value
      };
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Initialize passport
app.use(passport.initialize());

// ============================================
// ROUTES
// ============================================

// LOGGING MIDDLEWARE - track all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", readingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Staff Dashboard Routes (STAFF USER ROUTES)
app.use("/api/staff/dashboard", staffDashboardRoutes);

// Admin Dashboard API Routes
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/rooms", roomRoutes);
app.use("/api/admin/reservations", reservationRoutes);
app.use("/api/admin/bookings", bookingRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/sales", salesRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/admin/maintenance", maintenanceRoutes);

// ============================================
// TEST ENDPOINT - Direct database access
// ============================================
app.get('/api/test-bookings-direct', async (req, res) => {
  console.log("🔥🔥🔥 DIRECT TEST ENDPOINT HIT! 🔥🔥🔥");
  try {
    const Booking = require('./models/Booking');
    const bookings = await Booking.find().sort({ createdAt: -1 });
    console.log(`✅ Test endpoint found ${bookings.length} bookings`);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("❌ Test endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DIAGNOSTIC ENDPOINT - Check sales/bookings mismatch
// ============================================
app.get('/api/diagnose-sales', async (req, res) => {
  console.log("🔍 DIAGNOSTIC ENDPOINT - Checking bookings vs sales");
  try {
    const Booking = require('./models/Booking');
    const Sale = require('./models/Sale');

    // Get all bookings with their status
    const allBookings = await Booking.find({}, 'bookingNumber status totalAmount oasis customerName createdAt');
    const confirmedBookings = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
    
    // Get all sales and populate booking info
    const allSales = await Sale.find({})
      .populate('booking', 'bookingNumber status totalAmount oasis customerName');
    
    // Check which confirmed bookings don't have sales
    const bookingsWithoutSales = confirmedBookings.filter(booking => 
      !allSales.some(sale => sale.booking && sale.booking._id.toString() === booking._id.toString())
    );

    const diagnosis = {
      totalBookings: allBookings.length,
      confirmedBookings: confirmedBookings.length,
      totalSales: allSales.length,
      bookingsWithoutSales: bookingsWithoutSales.length,
      
      // Group bookings by status
      bookingsByStatus: {
        pending: allBookings.filter(b => b.status === 'Pending').length,
        confirmed: allBookings.filter(b => b.status === 'Confirmed').length,
        completed: allBookings.filter(b => b.status === 'Completed').length,
        cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
      },
      
      // Sample data
      sampleConfirmedBookings: confirmedBookings.slice(0, 5).map(b => ({
        id: b._id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        amount: b.totalAmount,
        oasis: b.oasis,
        customerName: b.customerName,
        createdAt: b.createdAt,
        hasSale: allSales.some(s => s.booking && s.booking._id.toString() === b._id.toString())
      })),
      
      sampleSales: allSales.slice(0, 5).map(s => ({
        id: s._id,
        bookingId: s.booking ? s.booking._id : null,
        bookingNumber: s.booking ? s.booking.bookingNumber : s.bookingNumber,
        amount: s.amount,
        date: s.date,
        bookingStatus: s.booking ? s.booking.status : 'No booking'
      })),
      
      issue: bookingsWithoutSales.length > 0 
        ? `⚠️ ${bookingsWithoutSales.length} confirmed/completed bookings are missing sales records!`
        : '✅ All confirmed/completed bookings have sales records'
    };

    res.json(diagnosis);
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Atlas Database Connected Successfully...");
    console.log(`📊 Using database: ${mongoose.connection.name}`);
  })
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));