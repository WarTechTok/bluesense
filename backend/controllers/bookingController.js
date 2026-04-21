// backend/controllers/bookingController.js
// ============================================
// BOOKING CONTROLLER - with booking limits & capacity management
// ============================================

console.log("🟢🟢🟢 BOOKING CONTROLLER IS LOADED! 🟢🟢🟢");

const Booking = require("../models/Booking");
const Sale = require("../models/Sale");

// ============================================
// CAPACITY CONFIGURATION
// ============================================

const OASIS_CONFIG = {
  "Oasis 1": {
    maxBookingsPerDay: 6,
    maxPaxPerDay: 120,
    sessions: {
      Day: {
        maxBookings: 3,
        maxPax: 60,
        availablePackages: [
          "Package 1",
          "Package 2",
          "Package 3",
          "Package 4",
          "Package 5",
          "Package 5+",
        ],
      },
      Night: {
        maxBookings: 3,
        maxPax: 60,
        availablePackages: [
          "Package 1",
          "Package 2",
          "Package 3",
          "Package 4",
          "Package 5",
          "Package 5+",
        ],
      },
      "22hrs": {
        maxBookings: 2,
        maxPax: 40,
        availablePackages: [
          "Package 2",
          "Package 3",
          "Package 4",
          "Package 5",
          "Package 5+",
        ],
      },
    },
  },
  "Oasis 2": {
    maxBookingsPerDay: 8,
    maxPaxPerDay: 200,
    sessions: {
      Day: {
        maxBookings: 4,
        maxPax: 100,
        availablePackages: ["Package A", "Package B", "Package C"],
      },
      Night: {
        maxBookings: 4,
        maxPax: 100,
        availablePackages: ["Package A", "Package B", "Package C"],
      },
      "22hrs": {
        maxBookings: 3,
        maxPax: 80,
        availablePackages: ["Package B", "Package C"],
      },
    },
  },
};

const PACKAGE_CAPACITY = {
  "Oasis 1": {
    "Package 1": { base: 20, max: 200 }, // 20 base, up to 100 total with extra charge
    "Package 2": { base: 20, max: 200 },
    "Package 3": { base: 20, max: 200 },
    "Package 4": { base: 20, max: 200 },
    "Package 5": { base: 20, max: 200 },
    "Package 5+": { base: 30, max: 200 }, // 30 base, up to 100 total
  },
  "Oasis 2": {
    "Package A": { base: 30, max: 200 },
    "Package B": { base: 30, max: 200 },
    "Package C": { base: 50, max: 200 }, // 50 base, up to 100 total
  },
};

// ============================================
// HELPER: Generate unique booking reference
// ============================================
// Generates reference like: A1B2C3, X9Y8Z7, etc. (6-character random alphanumeric)

const generateBookingReference = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let reference;

  while (!isUnique) {
    // Generate random 6-character alphanumeric code
    reference = '';
    for (let i = 0; i < 6; i++) {
      reference += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if reference is unique
    const existingRef = await Booking.findOne({ bookingReference: reference });
    if (!existingRef) {
      isUnique = true;
    }
  }

  return reference;
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
    console.log("📥 Booking Request Body:", req.body);
    console.log("📥 Booking File:", req.file);

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
    } = req.body;

    // Get payment proof file from multer
    const paymentProof = req.file
      ? `/uploads/payment-proofs/${req.file.filename}`
      : null;

    console.log("💾 Payment Proof Path:", paymentProof);

    // Parse addons if it's a JSON string (from FormData)
    let parsedAddons = {};
    try {
      if (addons && typeof addons === "string") {
        parsedAddons = JSON.parse(addons);
      } else if (addons) {
        parsedAddons = addons;
      }
    } catch (e) {
      console.log("⚠️ Could not parse addons:", e);
    }

    // ============================================
    // VALIDATE REQUIRED FIELDS
    // ============================================

    if (!customerName || !customerContact || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer name, contact, and email are required",
      });
    }

    if (!oasis || !packageName || !session) {
      return res.status(400).json({
        success: false,
        message: "Oasis, package, and session selection are required",
      });
    }

    if (!bookingDate || !pax || !totalPrice || !downpayment) {
      return res.status(400).json({
        success: false,
        message:
          "Booking date, number of guests, total price, and downpayment are required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Parse booking date correctly as local date (not UTC)
    let selectedDate;
    if (typeof bookingDate === "string") {
      const [year, month, day] = bookingDate.split("-");
      selectedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        0,
        0,
        0,
        0,
      );
    } else {
      selectedDate = new Date(bookingDate);
    }

    console.log(
      `📅 Parsed booking date: ${bookingDate} → ${selectedDate.toISOString()}`,
    );
    const { start, end } = getDayRange(selectedDate);

    // ============================================
    // 1. CHECK PACKAGE CAPACITY
    // ============================================

    const packageLimit = PACKAGE_CAPACITY[oasis]?.[packageName];
    if (packageLimit) {
      const maxAllowed =
        typeof packageLimit === "object" ? packageLimit.max : packageLimit;
      const baseCapacity =
        typeof packageLimit === "object" ? packageLimit.base : packageLimit;

      if (pax > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `${packageName} can only accommodate up to ${maxAllowed} persons maximum. You have ${pax} persons.`,
        });
      }

      if (pax > baseCapacity) {
        const extraGuests = pax - baseCapacity;
        console.log(
          `✅ ${extraGuests} extra guest(s) for ${packageName}. Extra charge: ₱${extraGuests * 150}`,
        );
      }
    }

    // ============================================
    // 2. CHECK SESSION AVAILABILITY FOR THIS PACKAGE
    // ============================================

    const sessionConfig = OASIS_CONFIG[oasis]?.sessions[session];
    if (!sessionConfig) {
      return res.status(400).json({
        success: false,
        message: `${session} session is not available for ${oasis}.`,
      });
    }

    if (!sessionConfig.availablePackages.includes(packageName)) {
      return res.status(400).json({
        success: false,
        message: `${packageName} is not available for ${session} session. Available packages: ${sessionConfig.availablePackages.join(", ")}`,
      });
    }

    // ============================================
    // 3. CHECK EXISTING BOOKINGS ON SAME DATE
    // ============================================

    const existingBookings = await Booking.find({
      oasis,
      bookingDate: { $gte: start, $lt: end },
      status: { $in: ["Pending", "Confirmed"] },
    });

    const customerExistingBooking = existingBookings.find(
      (b) => b.customerEmail === customerEmail,
    );

    if (customerExistingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a booking on this date. Please choose another date.",
      });
    }

    if (existingBookings.length >= OASIS_CONFIG[oasis].maxBookingsPerDay) {
      return res.status(400).json({
        success: false,
        message: `${oasis} is fully booked for this date. Please choose another date.`,
      });
    }

    // const totalPaxForDay = existingBookings.reduce((sum, b) => sum + b.pax, 0);
    // if (totalPaxForDay + pax > OASIS_CONFIG[oasis].maxPaxPerDay) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Daily capacity reached for ${oasis}. Maximum ${OASIS_CONFIG[oasis].maxPaxPerDay} persons per day.`,
    //   });
    // }

    // ============================================
    // 4. CHECK SESSION-SPECIFIC AVAILABILITY
    // ============================================

    console.log(`🔍 Checking if ${session} is available on ${bookingDate}`);
    console.log(
      `   Date range: ${start.toISOString()} to ${end.toISOString()}`,
    );

    const confirmedSessionBooking = await Booking.findOne({
      oasis,
      session,
      bookingDate: { $gte: start, $lt: end },
      status: "Confirmed",
      paymentStatus: "Paid",
    });

    if (confirmedSessionBooking) {
      console.log(`❌ Found conflicting booking:`, confirmedSessionBooking);
      return res.status(400).json({
        success: false,
        message: `${session} session is already booked on this date. Please choose a different session (Day, Night, or 22hrs).`,
      });
    }

    console.log(`✅ ${session} session is available on this date`);

    // ============================================
    // 5. CHECK PENDING BOOKING LIMIT (per customer)
    // ============================================

    const existingPendingBooking = await Booking.findOne({
      customerEmail,
      status: "Pending",
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (existingPendingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "You have a pending booking. Please complete your payment first.",
      });
    }

    // ============================================
    // 6. CHECK FUTURE BOOKINGS LIMIT (per customer)
    // ============================================

    const futureBookingsCount = await Booking.countDocuments({
      customerEmail,
      bookingDate: { $gte: new Date() },
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (futureBookingsCount >= 2) {
      return res.status(400).json({
        success: false,
        message:
          "You already have 2 upcoming bookings. Please complete or cancel one first.",
      });
    }

    // ============================================
    // 7. CHECK DATE ADVANCE LIMITS
    // ============================================

    const maxAdvanceDate = new Date();
    maxAdvanceDate.setMonth(maxAdvanceDate.getMonth() + 3);

    if (selectedDate > maxAdvanceDate) {
      return res.status(400).json({
        success: false,
        message: "You can only book up to 3 months in advance.",
      });
    }

    const minAdvanceDate = new Date();
    minAdvanceDate.setDate(minAdvanceDate.getDate() + 1);
    minAdvanceDate.setHours(0, 0, 0, 0);

    if (selectedDate < minAdvanceDate) {
      return res.status(400).json({
        success: false,
        message: "Bookings must be made at least 1 day in advance.",
      });
    }

    // ============================================
    // CREATE BOOKING - ALL CHECKS PASSED
    // ============================================

    // FIXED: All payments start as Pending - no auto-confirmation
    // Staff must verify payment proof before confirming
    const paymentStatusForBooking = "Pending";

    // Generate unique booking reference
    let bookingReference;
    let isUnique = false;
    while (!isUnique) {
      bookingReference = await generateBookingReference();
      const existingRef = await Booking.findOne({ bookingReference });
      if (!existingRef) {
        isUnique = true;
      }
    }

    // Generate sequential booking number
    const lastBooking = await Booking.findOne()
      .sort({ bookingNumber: -1 })
      .select('bookingNumber');
    
    const nextBookingNumber = (lastBooking?.bookingNumber || 0) + 1;

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
      addons: parsedAddons || {},
      specialRequests: specialRequests || "",
      paymentMethod,
      paymentType: paymentType || "downpayment",
      paymentProof: paymentProof || null,
      status: "Pending",
      paymentStatus: paymentStatusForBooking,
      bookingReference: bookingReference,
      bookingNumber: nextBookingNumber
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully. Please wait for staff to verify your payment and confirm your booking.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET ALL BOOKINGS - EXACT SAME PATTERN AS ROOMS
// ============================================

const getAllBookings = async (req, res) => {
  console.log("🔴🔴🔴 getAllBookings FUNCTION IS EXECUTING! 🔴🔴🔴");
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (error) {
    console.error("❌ Error in getAllBookings:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET BOOKING BY ID - para sa details
// ============================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    // Removed .populate to avoid errors

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error in getBookingById:", error);
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

    // Prevent operations on completed bookings
    const currentBooking = await Booking.findById(id);
    if (currentBooking.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot modify a completed booking" });
    }

    const updateData = { status };
    if (confirmedBy) {
      updateData.confirmedBy = confirmedBy;
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Create sale record if booking is confirmed
    if (status === "Confirmed" && booking.totalAmount) {
      const existingSale = await Sale.findOne({ booking: id });
      if (!existingSale) {
        const sale = new Sale({
          booking: id,
          amount: booking.totalAmount,
          bookingNumber: booking.bookingNumber || 0,
          bookingReference: booking.bookingReference,
          location: booking.oasis,
        });
        await sale.save();
        console.log(`✅ Sale record created for booking ${id} (Booking #${booking.bookingNumber})`);
      }
    }

    // Delete sale record if booking is cancelled
    if (status === "Cancelled") {
      const deletedSale = await Sale.findOneAndDelete({ booking: id });
      if (deletedSale) {
        console.log(`🗑️ Sale record deleted for cancelled booking ${id}`);
      }
    }

    res.json({
      message: `Booking ${status}`,
      booking,
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

    // If setting to 'Paid', update downpayment to match totalAmount
    // This prevents balance from being recalculated and auto-correcting to 'Partial'
    const updateData = { paymentStatus };
    if (paymentStatus === 'Paid') {
      const booking = await Booking.findById(id);
      if (booking && booking.totalAmount) {
        updateData.downpayment = booking.totalAmount;
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    res.json({
      message: `Payment ${paymentStatus}`,
      booking,
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

    // Prevent deletion of completed bookings
    const booking = await Booking.findById(id);
    if (booking.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot delete a completed booking" });
    }

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
    const { oasis, package: packageName, email } = req.query;

    if (!oasis) {
      return res.status(400).json({
        success: false,
        message: "Oasis is required",
      });
    }

    const getLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Fetch ALL bookings for this OASIS (Confirmed AND Pending)
    // This ensures users can see their pending bookings as already booked
    const bookings = await Booking.find({
      oasis,
      status: { $in: ["Confirmed", "Pending"] },
    }).lean();

    console.log(`📅 Found ${bookings.length} bookings for ${oasis} (Confirmed + Pending)`);

    // Group bookings by date and session
    const bookedDatesMap = {};

    bookings.forEach((booking) => {
      const dateStr = getLocalDateString(booking.bookingDate);

      if (!bookedDatesMap[dateStr]) {
        bookedDatesMap[dateStr] = {
          date: dateStr,
          Day: { booked: false, count: 0, names: [] },
          Night: { booked: false, count: 0, names: [] },
          "22hrs": { booked: false, count: 0, names: [] },
          userHasBooking: false,
          userBookingSession: null,
        };
      }

      const session = booking.session || "Day";
      if (bookedDatesMap[dateStr][session]) {
        const sessionInfo = bookedDatesMap[dateStr][session];
        sessionInfo.count += 1;
        sessionInfo.names.push(booking.customerName);
        
        // Check if this booking belongs to the current user
        if (email && booking.customerEmail === email) {
          bookedDatesMap[dateStr].userHasBooking = true;
          bookedDatesMap[dateStr].userBookingSession = session;
          console.log(`✅ User ${email} has booking on ${dateStr} for ${session} session`);
        }
      }
    });

    // Process each date to determine availability for new bookings
    Object.keys(bookedDatesMap).forEach((dateStr) => {
      const dayInfo = bookedDatesMap[dateStr];
      const sessionConfig = OASIS_CONFIG[oasis]?.sessions;

      if (!sessionConfig) {
        console.warn(`⚠️ No session config for ${oasis}`);
        return;
      }

      if (dayInfo["22hrs"].count > 0) {
        dayInfo["22hrs"].booked = true;
        dayInfo.Day.booked = true;
        dayInfo.Night.booked = true;
      } else {
        if (dayInfo.Day.count > 0) {
          dayInfo.Day.booked = true;
        }
        if (dayInfo.Night.count > 0) {
          dayInfo.Night.booked = true;
        }
      }
    });

    console.log("📤 Returning booked dates:", Object.keys(bookedDatesMap));

    res.json({
      success: true,
      bookedDates: bookedDatesMap,
    });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// VERIFY PAYMENT - Admin verifies payment proof and confirms booking
// ============================================

const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth token

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Determine payment status based on payment type and current status
    // If payment status is already "Partial", verify the remaining balance and set to "Paid"
    // Otherwise, determine based on payment type
    let paymentStatus;
    let isRemainingPayment = false;

    if (booking.paymentStatus === 'Partial') {
      // Guest is paying the remaining balance
      paymentStatus = 'Paid';
      isRemainingPayment = true;
    } else {
      // Initial payment verification
      paymentStatus = booking.paymentType === 'fullpayment' ? 'Paid' : 'Partial';
    }

    // Update booking - mark payment as verified and booking as confirmed
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        paymentStatus: paymentStatus,
        status: "Confirmed",
        paymentVerifiedBy: userId,
        paymentVerifiedAt: new Date(),
        confirmedBy: userId,
      },
      { new: true },
    ).populate("paymentVerifiedBy", "name email");

    // Create sale record for revenue tracking
    try {
      const existingSale = await Sale.findOne({ booking: id });
      if (!existingSale && booking.totalAmount) {
        const sale = new Sale({
          booking: id,
          amount: booking.totalAmount,
          bookingNumber: booking.bookingNumber,
          bookingReference: booking.bookingReference,
          location: booking.oasis,
        });
        await sale.save();
        console.log(`✅ Sale record created for booking ${id}`);
      }
    } catch (saleError) {
      console.error("⚠️  Failed to create sale record:", saleError.message);
      // Continue with email even if sale creation fails
    }

    // Send email notification to customer
    const sendEmail = require("../utils/sendEmail");
    try {
      await sendEmail({
        to: booking.customerEmail,
        subject: isRemainingPayment ? "Final Payment Confirmed - Catherine's Oasis" : "Booking Confirmation - Catherine's Oasis",
        html: `
          <h2>${isRemainingPayment ? 'Payment Complete!' : 'Booking Confirmed!'}</h2>
          <p>Dear ${booking.customerName},</p>
          <p>${isRemainingPayment ? 'Your final payment has been verified and your booking is now fully paid.' : 'Your payment has been verified and your booking is now confirmed.'}</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Booking Details:</h3>
            <p><strong>Venue:</strong> ${booking.oasis}</p>
            <p><strong>Package:</strong> ${booking.package}</p>
            <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Number of Guests:</strong> ${booking.pax}</p>
            ${isRemainingPayment ? `<p><strong>Final Payment Verified:</strong> ✓</p><p><strong>Total Paid:</strong> ₱${booking.totalAmount.toLocaleString()}</p>` : `<p><strong>Amount Paid:</strong> ₱${booking.downpayment.toLocaleString()}</p>
            ${booking.paymentType === 'downpayment' ? `<p><strong>Remaining Balance:</strong> ₱${(booking.totalAmount - booking.downpayment).toLocaleString()} (payable on-site)</p>` : ''}`}
            <p><strong>Payment Status:</strong> ${paymentStatus}</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          
          <p>Please keep this email for your records. You can now show this booking confirmation to our staff when you arrive.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Thank you,<br/>Catherine's Oasis Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't throw error, booking is already confirmed
    }

    res.json({
      success: true,
      message:
        "Payment verified successfully. Booking confirmed and customer notified.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// CANCEL BOOKING - Customer cancels their booking
// ============================================

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, isEmergency } = req.body;
    const proofFile = req.file;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found. Please refresh and try again."
      });
    }
    
    // Check if booking belongs to this user
    if (booking.customerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings."
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: "This booking has already been cancelled."
      });
    }
    
    if (booking.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking."
      });
    }
    
    // Update booking
    booking.status = 'Cancelled';
    booking.cancellationReason = isEmergency === 'true' ? 'emergency' : 'user_cancelled';
    booking.cancellationNote = reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.email;
    
    if (isEmergency === 'true') {
      booking.refundRequested = true;
      booking.refundStatus = 'pending';
      booking.refundReason = reason;
      if (proofFile) {
        booking.refundProof = `/uploads/refund-proofs/${proofFile.filename}`;
      }
    }
    
    await booking.save();
    
    // Delete associated sale record if exists
    const existingSale = await Sale.findOne({ booking: id });
    if (existingSale) {
      await Sale.findOneAndDelete({ booking: id });
    }
    
    let message = "";
    if (isEmergency === 'true') {
      message = "✅ Your cancellation has been submitted successfully. Your refund request is now pending review. Our team will get back to you within 3-5 business days.";
    } else {
      message = "✅ Your booking has been cancelled. Please note that the downpayment is non-refundable.";
    }
    
    res.json({
      success: true,
      message: message,
      booking
    });
    
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
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
  getBookedDatesWithSessions,
  verifyPayment,
  cancelBooking
};
