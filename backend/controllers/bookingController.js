// backend/controllers/bookingController.js
// ============================================
// BOOKING CONTROLLER - with booking limits & capacity management
// ============================================

const Booking = require("../models/Booking");

// ============================================
// CAPACITY CONFIGURATION
// ============================================

const OASIS_CONFIG = {
  'Oasis 1': {
    maxBookingsPerDay: 6,
    maxPaxPerDay: 120,
    sessions: {
      'Day': {
        maxBookings: 3,
        maxPax: 60,
        availablePackages: ['Package 1', 'Package 2', 'Package 3', 'Package 4', 'Package 5', 'Package 5+']
      },
      'Night': {
        maxBookings: 3,
        maxPax: 60,
        availablePackages: ['Package 1', 'Package 2', 'Package 3', 'Package 4', 'Package 5', 'Package 5+']
      },
      '22hrs': {
        maxBookings: 2,
        maxPax: 40,
        availablePackages: ['Package 2', 'Package 3', 'Package 4', 'Package 5', 'Package 5+']
      }
    }
  },
  'Oasis 2': {
    maxBookingsPerDay: 8,
    maxPaxPerDay: 200,
    sessions: {
      'Day': {
        maxBookings: 4,
        maxPax: 100,
        availablePackages: ['Package A', 'Package B', 'Package C']
      },
      'Night': {
        maxBookings: 4,
        maxPax: 100,
        availablePackages: ['Package A', 'Package B', 'Package C']
      },
      '22hrs': {
        maxBookings: 3,
        maxPax: 80,
        availablePackages: ['Package B', 'Package C']
      }
    }
  }
};

const PACKAGE_CAPACITY = {
  'Oasis 1': {
    'Package 1': 20,
    'Package 2': 4,
    'Package 3': 12,
    'Package 4': 15,
    'Package 5': 25,
    'Package 5+': 50
  },
  'Oasis 2': {
    'Package A': 30,
    'Package B': 30,
    'Package C': 100
  }
};

// ============================================
// HELPER: Get start and end of day
// ============================================

const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ============================================
// CREATE BOOKING - with all validation limits
// ============================================

const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerContact,
      customerEmail,
      oasis,
      package: packageName,
      session,
      bookingDate,
      pax,
      totalPrice,
      downpayment,
      addons,
      specialRequests,
      paymentMethod,
      paymentType,
      paymentProof
    } = req.body;

    // ============================================
    // VALIDATE REQUIRED FIELDS
    // ============================================
    
    if (!customerName || !customerContact || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, contact, and email are required'
      });
    }

    if (!oasis || !packageName || !session) {
      return res.status(400).json({
        success: false,
        message: 'Oasis, package, and session selection are required'
      });
    }

    if (!bookingDate || !pax || !totalPrice || !downpayment) {
      return res.status(400).json({
        success: false,
        message: 'Booking date, number of guests, total price, and downpayment are required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    const selectedDate = new Date(bookingDate);
    const { start, end } = getDayRange(selectedDate);

    // ============================================
    // 1. CHECK PACKAGE CAPACITY
    // ============================================
    
    const maxPackagePax = PACKAGE_CAPACITY[oasis]?.[packageName];
    if (maxPackagePax && pax > maxPackagePax) {
      return res.status(400).json({
        success: false,
        message: `${packageName} can only accommodate up to ${maxPackagePax} persons. You have ${pax} persons.`
      });
    }

    // ============================================
    // 2. CHECK SESSION AVAILABILITY FOR THIS PACKAGE
    // ============================================
    
    const sessionConfig = OASIS_CONFIG[oasis]?.sessions[session];
    if (!sessionConfig) {
      return res.status(400).json({
        success: false,
        message: `${session} session is not available for ${oasis}.`
      });
    }
    
    if (!sessionConfig.availablePackages.includes(packageName)) {
      return res.status(400).json({
        success: false,
        message: `${packageName} is not available for ${session} session. Available packages: ${sessionConfig.availablePackages.join(', ')}`
      });
    }

    // ============================================
    // 3. CHECK EXISTING BOOKINGS ON SAME DATE
    // ============================================
    
    const existingBookings = await Booking.find({
      oasis,
      bookingDate: { $gte: start, $lt: end },
      status: { $in: ['Pending', 'Confirmed'] }
    });

    // 3a. Check if customer already booked this date
    const customerExistingBooking = existingBookings.find(
      b => b.customerEmail === customerEmail
    );
    
    if (customerExistingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking on this date. Please choose another date.'
      });
    }

    // 3b. Check total bookings per day limit
    if (existingBookings.length >= OASIS_CONFIG[oasis].maxBookingsPerDay) {
      return res.status(400).json({
        success: false,
        message: `${oasis} is fully booked for this date. Please choose another date.`
      });
    }

    // 3c. Check total pax per day limit
    const totalPaxForDay = existingBookings.reduce((sum, b) => sum + b.pax, 0);
    if (totalPaxForDay + pax > OASIS_CONFIG[oasis].maxPaxPerDay) {
      return res.status(400).json({
        success: false,
        message: `Daily capacity reached for ${oasis}. Maximum ${OASIS_CONFIG[oasis].maxPaxPerDay} persons per day.`
      });
    }

    // ============================================
    // 4. CHECK SESSION-SPECIFIC LIMITS
    // ============================================
    
    const existingSessionBookings = existingBookings.filter(b => b.session === session);
    
    if (existingSessionBookings.length >= sessionConfig.maxBookings) {
      return res.status(400).json({
        success: false,
        message: `${session} session is fully booked for this date. Maximum ${sessionConfig.maxBookings} bookings per session.`
      });
    }
    
    const totalPaxForSession = existingSessionBookings.reduce((sum, b) => sum + b.pax, 0);
    if (totalPaxForSession + pax > sessionConfig.maxPax) {
      return res.status(400).json({
        success: false,
        message: `${session} session capacity reached. Maximum ${sessionConfig.maxPax} persons per session.`
      });
    }

    // ============================================
    // 5. CHECK PENDING BOOKING LIMIT (per customer)
    // ============================================
    
    const existingPendingBooking = await Booking.findOne({
      customerEmail,
      status: 'Pending',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (existingPendingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have a pending booking. Please complete your payment first.'
      });
    }

    // ============================================
    // 6. CHECK FUTURE BOOKINGS LIMIT (per customer)
    // ============================================
    
    const futureBookingsCount = await Booking.countDocuments({
      customerEmail,
      bookingDate: { $gte: new Date() },
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (futureBookingsCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'You already have 2 upcoming bookings. Please complete or cancel one first.'
      });
    }

    // ============================================
    // 7. CHECK DATE ADVANCE LIMITS
    // ============================================
    
    // 7a. Max 3 months advance
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setMonth(maxAdvanceDate.getMonth() + 3);
    
    if (selectedDate > maxAdvanceDate) {
      return res.status(400).json({
        success: false,
        message: 'You can only book up to 3 months in advance.'
      });
    }
    
    // 7b. Min 1 day advance
    const minAdvanceDate = new Date();
    minAdvanceDate.setDate(minAdvanceDate.getDate() + 1);
    minAdvanceDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < minAdvanceDate) {
      return res.status(400).json({
        success: false,
        message: 'Bookings must be made at least 1 day in advance.'
      });
    }

    // ============================================
    // CREATE BOOKING - ALL CHECKS PASSED
    // ============================================

    // Auto-mark as paid if payment method is Cash
    const paymentStatusForBooking = paymentMethod === 'Cash' ? 'Paid' : 'Pending';

    const newBooking = new Booking({
      customerName,
      customerContact,
      customerEmail,
      oasis,
      package: packageName,
      session,
      bookingDate,
      pax,
      totalAmount: totalPrice,
      downpayment,
      addons: addons || {},
      specialRequests: specialRequests || '',
      paymentMethod,
      paymentType: paymentType || 'downpayment',
      paymentProof: paymentProof || null,
      status: 'Pending',
      paymentStatus: paymentStatusForBooking
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: paymentMethod === 'Cash' 
        ? 'Booking submitted successfully. Payment marked as paid.' 
        : 'Booking submitted successfully. Please complete your downpayment and upload proof.',
      booking: newBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET ALL BOOKINGS - para sa staff/admin
// ============================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("confirmedBy", "name email");
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET BOOKING BY ID - para sa details
// ============================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("confirmedBy", "name email");
      
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE BOOKING STATUS - confirm or cancel
// ============================================

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, confirmedBy } = req.body;
    
    const updateData = { status };
    if (confirmedBy) {
      updateData.confirmedBy = confirmedBy;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.json({
      message: `Booking ${status}`,
      booking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// UPDATE PAYMENT STATUS - for partial payments
// ============================================

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );
    
    res.json({
      message: `Payment ${paymentStatus}`,
      booking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// GET BOOKINGS BY CUSTOMER EMAIL - public (no auth)
// ============================================

const getBookingsByCustomerEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const bookings = await Booking.find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .populate("confirmedBy", "name email");
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// DELETE BOOKING - admin only (optional)
// ============================================

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET BOOKED DATES WITH SESSION INFO
// ============================================

const getBookedDatesWithSessions = async (req, res) => {
  try {
    const { oasis, package: packageName } = req.query;
    
    if (!oasis || !packageName) {
      return res.status(400).json({
        success: false,
        message: 'Oasis and package are required'
      });
    }

    // Fetch all bookings for this oasis and package
    const bookings = await Booking.find({
      oasis,
      package: packageName,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    // Group bookings by date and session
    const bookedDatesMap = {};
    
    bookings.forEach(booking => {
      const dateStr = booking.bookingDate.toISOString().split('T')[0];
      
      if (!bookedDatesMap[dateStr]) {
        bookedDatesMap[dateStr] = {
          date: dateStr,
          Day: { booked: false, count: 0, names: [] },
          Night: { booked: false, count: 0, names: [] },
          '22hrs': { booked: false, count: 0, names: [] }
        };
      }

      const sessionInfo = bookedDatesMap[dateStr][booking.session];
      sessionInfo.count += 1;
      sessionInfo.names.push(booking.customerName);
    });

    // Process each date to determine availability
    Object.keys(bookedDatesMap).forEach(dateStr => {
      const dayInfo = bookedDatesMap[dateStr];
      const sessionConfig = OASIS_CONFIG[oasis]?.sessions;
      
      // Check if 22hrs session has any bookings - if yes, block entire day
      if (dayInfo['22hrs'].count > 0) {
        dayInfo.Day.booked = true;
        dayInfo.Night.booked = true;
        if (dayInfo['22hrs'].count >= sessionConfig['22hrs'].maxBookings) {
          dayInfo['22hrs'].booked = true;
        }
      } else {
        // Check Day session capacity
        if (dayInfo.Day.count >= sessionConfig.Day.maxBookings) {
          dayInfo.Day.booked = true;
        }
        
        // Check Night session capacity
        if (dayInfo.Night.count >= sessionConfig.Night.maxBookings) {
          dayInfo.Night.booked = true;
        }
        
        // Check 22hrs capacity (if any exist)
        if (dayInfo['22hrs'].count >= sessionConfig['22hrs'].maxBookings) {
          dayInfo['22hrs'].booked = true;
        }
      }
    });

    res.json({
      success: true,
      bookedDates: bookedDatesMap
    });

  } catch (error) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByCustomerEmail,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  getBookedDatesWithSessions
};