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

// ============================================
// NEW: PACKAGE, ADD-ON & SESSION MANAGEMENT ROUTES
// ============================================
const packageRoutes = require("./routes/admin/packages.js");
const addOnRoutes = require("./routes/admin/addons.js");
const sessionRoutes = require("./routes/admin/sessions.js");

// ============================================
// TASKS & NOTIFICATIONS ROUTES
// ============================================
const tasksRoutes = require("./routes/tasks.js");
const notificationsRoutes = require("./routes/notifications.js");
const contactRoutes = require("./routes/contact.js");

// ============================================ 
// GALLERY MANAGEMENT ROUTE
// ============================================
const galleryRoutes = require("./routes/gallery.js");

const app = express();

// Create uploads folder for payment proofs if it doesn't exist
const paymentProofDir = path.join(__dirname, 'uploads/payment-proofs');
if (!fs.existsSync(paymentProofDir)) {
  fs.mkdirSync(paymentProofDir, { recursive: true });
  console.log('✅ Created uploads/payment-proofs folder');
}

// ============================================
// CORS CONFIGURATION - Allow frontend (Vercel) and ESP32
// ============================================
const allowedOrigins = [
  'https://bluesense-de14.vercel.app',
  'https://bluesense.onrender.com',
  'http://localhost:3000',
  'http://localhost:8080'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, ESP32, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, true); // Still allow for now, just log it
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// TEST CORS ENDPOINT
// ============================================
app.post('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    receivedBody: req.body,
    headers: req.headers
  });
});

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
  console.log(`📡 ${req.method} ${req.path} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Routes
app.use("/api", readingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Staff Dashboard Routes
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
// NEW: PACKAGE, ADD-ON & SESSION MANAGEMENT API ROUTES
// ============================================
app.use("/api/admin/packages", packageRoutes);
app.use("/api/admin/addons", addOnRoutes);
app.use("/api/admin/sessions", sessionRoutes);

// ============================================
// TASKS & NOTIFICATIONS API ROUTES
// ============================================
app.use("/api/admin/tasks", tasksRoutes);
app.use("/api/admin/notifications", notificationsRoutes);
app.use("/api/contact", contactRoutes);

// ============================================
// GALLERY API ROUTES
// ============================================
app.use("/api/gallery", galleryRoutes);

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

    const allBookings = await Booking.find({}, 'bookingNumber status totalAmount oasis customerName createdAt');
    const confirmedBookings = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
    
    const allSales = await Sale.find({})
      .populate('booking', 'bookingNumber status totalAmount oasis customerName');
    
    const bookingsWithoutSales = confirmedBookings.filter(booking => 
      !allSales.some(sale => sale.booking && sale.booking._id.toString() === booking._id.toString())
    );

    const diagnosis = {
      totalBookings: allBookings.length,
      confirmedBookings: confirmedBookings.length,
      totalSales: allSales.length,
      bookingsWithoutSales: bookingsWithoutSales.length,
      bookingsByStatus: {
        pending: allBookings.filter(b => b.status === 'Pending').length,
        confirmed: allBookings.filter(b => b.status === 'Confirmed').length,
        completed: allBookings.filter(b => b.status === 'Completed').length,
        cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
      },
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
  console.error('❌ Stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// ============================================
// 404 HANDLER - Catch all unmatched routes
// ============================================
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.path}` 
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

// ============================================
// AUTO-COMPLETE BOOKINGS SCHEDULED JOB
// ============================================
// Auto-completes bookings when their date passes, which triggers sale record creation
const initializeAutoCompleteJob = () => {
  const Booking = require('./models/Booking');
  const Sale = require('./models/Sale');

  setInterval(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find confirmed bookings whose booking date has passed
      const bookingsToComplete = await Booking.find({
        status: 'Confirmed',
        bookingDate: { $lt: today }
      });

      if (bookingsToComplete.length > 0) {
        console.log(`\n⏰ AUTO-COMPLETE JOB: Found ${bookingsToComplete.length} bookings to auto-complete`);

        for (const booking of bookingsToComplete) {
          try {
            // Update booking to Completed
            booking.status = 'Completed';
            await booking.save();

            // Create sale record if it doesn't exist
            const existingSale = await Sale.findOne({ booking: booking._id });
            if (!existingSale && booking.totalAmount) {
              const sale = new Sale({
                booking: booking._id,
                amount: booking.totalAmount,
                bookingNumber: booking.bookingNumber || 0,
                bookingReference: booking.bookingReference,
                location: booking.oasis,
                date: new Date()
              });
              await sale.save();
              console.log(`✅ Auto-completed booking ${booking.bookingNumber} and created sale record`);
            } else if (existingSale) {
              console.log(`✅ Auto-completed booking ${booking.bookingNumber} (sale record already exists)`);
            }
          } catch (error) {
            console.error(`❌ Error auto-completing booking ${booking.bookingNumber}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Auto-complete job error:', error);
    }
  }, 60000); // Run every 60 seconds (1 minute)
};

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  // Initialize auto-complete job
  initializeAutoCompleteJob();
  console.log('⏰ Auto-complete booking job initialized (runs every 60 seconds)');
});