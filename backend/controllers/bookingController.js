// backend/controllers/bookingController.js
// ============================================
// BOOKING CONTROLLER - with booking limits & capacity management
// ============================================

console.log("🟢🟢🟢 BOOKING CONTROLLER IS LOADED! 🟢🟢🟢");

const Booking = require("../models/Booking");
const Sale = require("../models/Sale");
const { uploadPaymentProof, uploadRefundProof, deleteFromCloudinary } = require("../utils/cloudinary");

// NEW IMPORT: Package model — needed to look up maxCapacity, maxExtraGuests,
// and extraGuestFee from the database instead of a hardcoded map.
// WHY:  The old PACKAGE_CAPACITY object was hardcoded in this file, meaning
//       any admin change to package capacity in Package Management had NO effect
//       on the backend validation. Now we read directly from MongoDB so admin
//       changes are enforced immediately on new bookings.
const Package = require("../models/Package");

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

// NOTE: The old PACKAGE_CAPACITY hardcoded map has been REMOVED.
// It used to look like:
//   const PACKAGE_CAPACITY = {
//     "Oasis 1": { "Package 1": { base: 20, max: 200 }, ... },
//     "Oasis 2": { "Package A": { base: 30, max: 200 }, ... },
//   };
//
// WHY REMOVED: Any admin change to maxCapacity or maxExtraGuests in Package
// Management had zero effect on booking validation because the controller was
// reading from this static object, not from the database.
//
// REPLACED BY: A live MongoDB lookup in createBooking using:
//   const packageDoc = await Package.findOne({ oasis, name: packageName });
// This means the admin's settings take effect on the very next booking.

// ============================================
// HELPER: Generate unique booking reference
// ============================================

const generateBookingReference = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let reference;

  while (!isUnique) {
    reference = '';
    for (let i = 0; i < 6; i++) {
      reference += characters.charAt(Math.floor(Math.random() * characters.length));
    }
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
// CREATE BOOKING
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
      status,
      paymentStatus,
    } = req.body;

    // Upload payment proof to Cloudinary (buffer from memoryStorage)
    let paymentProof = null;
    if (req.file) {
      try {
        const { url } = await uploadPaymentProof(req.file.buffer);
        paymentProof = url;
        console.log("✅ Payment proof uploaded to Cloudinary:", url);
      } catch (uploadErr) {
        console.error("❌ Cloudinary payment proof upload failed:", uploadErr.message);
      }
    } else {
      console.log("⚠️ No payment proof file received");
    }

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

    console.log("🔍 Validation check:");
    console.log(`   customerName: ${customerName}`);
    console.log(`   customerEmail: ${customerEmail}`);
    console.log(`   oasis: ${oasis}`);
    console.log(`   packageName: ${packageName}`);
    console.log(`   session: ${session}`);
    console.log(`   bookingDate: ${bookingDate}`);
    console.log(`   pax: ${pax}`);
    console.log(`   totalPrice: ${totalPrice}`);
    console.log(`   downpayment: ${downpayment}`);
    console.log(`   paymentMethod: ${paymentMethod}`);

    const trimmedCustomerName    = customerName?.trim();
    const trimmedCustomerContact = customerContact?.trim();
    const trimmedCustomerEmail   = customerEmail?.trim();

    if (!trimmedCustomerName || !trimmedCustomerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required",
      });
    }

    if (!trimmedCustomerContact) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    if (!/^\+63\d{10}$/.test(trimmedCustomerContact)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must start with +63 and include 10 digits",
      });
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(trimmedCustomerEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email must be a valid Gmail address ending with @gmail.com",
      });
    }

    if (!oasis || !packageName || !session) {
      return res.status(400).json({
        success: false,
        message: "Oasis, package, and session selection are required",
      });
    }

    if (!bookingDate || !pax || !totalPrice || downpayment === undefined || downpayment === null) {
      const missingFields = [];
      if (!bookingDate)  missingFields.push("bookingDate");
      if (!pax)          missingFields.push("pax");
      if (!totalPrice)   missingFields.push("totalPrice");
      if (downpayment === undefined || downpayment === null) missingFields.push("downpayment");

      return res.status(400).json({
        success: false,
        message: `❌ VALIDATION FAILED - Missing fields: ${missingFields.join(", ")}`,
        details: {
          bookingDate:  bookingDate  || "MISSING",
          pax:          pax          || "MISSING",
          totalPrice:   totalPrice   || "MISSING",
          downpayment:  downpayment !== undefined && downpayment !== null ? downpayment : "MISSING",
        },
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
      selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    } else {
      selectedDate = new Date(bookingDate);
    }

    console.log(`📅 Parsed booking date: ${bookingDate}`);
    const { start, end } = getDayRange(selectedDate);

    // ============================================
    // 1. VALIDATE PAX AGAINST PACKAGE CAPACITY (DB-DRIVEN)
    // ============================================
    // NEW: Fetch the package document from MongoDB instead of reading from
    // the old hardcoded PACKAGE_CAPACITY map.
    //
    // WHAT: Look up the package by oasis + name to get:
    //   - maxCapacity    (base, included in price)
    //   - maxExtraGuests (hard ceiling above base; null = no cap)
    //   - extraGuestFee  (charge per extra guest; default 150)
    //
    // WHY:  Admin changes in Package Management now take effect immediately on
    //       new bookings. Previously, any admin edit was ignored by the backend.
    //
    // HOW:  Package.findOne({ oasis, name: packageName }) hits the packages
    //       collection directly. We only use the capacity fields — not pricing.
    // ─────────────────────────────────────────────────────────────────────────
    const packageDoc = await Package.findOne({ oasis, name: packageName });

    if (packageDoc) {
      const baseCapacity = packageDoc.maxCapacity;

      // NEW: Read maxExtraGuests from the DB.
      // WHAT: null means the admin set no cap → no upper limit enforced.
      //       A number means the hard ceiling is base + maxExtraGuests.
      const maxExtraGuests = packageDoc.maxExtraGuests ?? null;

      const guestCount = parseInt(pax);

      if (maxExtraGuests !== null) {
        // NEW: Admin has set a cap on extra guests — enforce the hard ceiling.
        // WHAT: totalMax is the absolute maximum number of guests allowed.
        // HOW:  totalMax = baseCapacity + maxExtraGuests
        //       Example: base=20, maxExtraGuests=10 → totalMax=30.
        //       A booking of 31 pax is rejected with a clear error message.
        const totalMax = baseCapacity + maxExtraGuests;

        if (guestCount > totalMax) {
          // BLOCK: pax exceeds the hard ceiling.
          // WHAT: Return a 400 error — the booking is not created.
          // WHY:  This mirrors the frontend block in GuestInfoStep.jsx. The backend
          //       check is the authoritative one — it protects against bypassed UI.
          // HOW:  The error message tells the customer the exact ceiling so they
          //       know what to reduce their count to.
          console.log(`❌ PAX EXCEEDS MAX: ${guestCount} > ${totalMax} (base ${baseCapacity} + extra ${maxExtraGuests})`);
          return res.status(400).json({
            success: false,
            message: `Maximum ${totalMax} pax allowed for ${packageName} (${baseCapacity} base + ${maxExtraGuests} extra). You have ${guestCount} guests.`,
          });
        }
      }

      // WHAT: If pax is above base capacity (but within ceiling), log the extra charge.
      // WHY:  Useful for debugging and audit trail. The actual price validation
      //       happens on the frontend (BookingSummary); we trust the totalPrice
      //       sent by the client here.
      if (guestCount > baseCapacity) {
        const extraGuests = guestCount - baseCapacity;
        const feePerPerson = packageDoc.extraGuestFee ?? 150;
        console.log(`✅ ${extraGuests} extra guest(s) for ${packageName}. Extra charge: ₱${extraGuests * feePerPerson}`);
      }
    } else {
      // Package not found in DB — log a warning but don't block the booking.
      // WHY:  If somehow the package was deleted between the customer selecting it
      //       and submitting, we don't want to silently fail. The warning appears
      //       in the server logs for the admin to investigate.
      console.warn(`⚠️ Package "${packageName}" not found in DB for oasis "${oasis}". Skipping capacity check.`);
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
    // 3. CHECK FOR DOUBLE BOOKING (SAME DATE + SESSION)
    // ============================================

    const exactMatchBooking = await Booking.findOne({
      oasis,
      package: packageName,
      session: session,
      bookingDate: { $gte: start, $lt: end },
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (exactMatchBooking) {
      console.log(`❌ DOUBLE BOOKING DETECTED: ${oasis} - ${packageName} - ${session}`);
      return res.status(409).json({
        success: false,
        message: "This date and session is already booked. Please select another date or session.",
        error: "DUPLICATE_BOOKING",
      });
    }

    // ============================================
    // 4. CHECK DATE ADVANCE LIMITS
    // ============================================

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

    let bookingReference;
    let isUnique = false;
    while (!isUnique) {
      bookingReference = await generateBookingReference();
      const existingRef = await Booking.findOne({ bookingReference });
      if (!existingRef) {
        isUnique = true;
      }
    }

    const lastBooking = await Booking.findOne()
      .sort({ bookingNumber: -1 })
      .select("bookingNumber");

    const nextBookingNumber = (lastBooking?.bookingNumber || 0) + 1;

    const newBooking = new Booking({
      customerName: trimmedCustomerName,
      customerContact: trimmedCustomerContact,
      customerEmail: trimmedCustomerEmail,
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
      status: status || "Pending",
      // Derive paymentStatus from paymentType — never trust the client-supplied value.
      paymentStatus: paymentType === "fullpayment" ? "Paid" : "Partial",
      downpayment:   paymentType === "fullpayment" ? parseFloat(totalPrice) : parseFloat(downpayment),
      bookingReference: bookingReference,
      bookingNumber: nextBookingNumber,
    });

    await newBooking.save();

    console.log(`✅ Booking created successfully:`);
    console.log(`   - Booking ID: ${newBooking._id}`);
    console.log(`   - Payment Proof Saved: ${newBooking.paymentProof || "NONE"}`);

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully. Please wait for staff to verify your payment.",
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
// GET ALL BOOKINGS
// ============================================

const getAllBookings = async (req, res) => {
  console.log("🔴🔴🔴 getAllBookings FUNCTION IS EXECUTING! 🔴🔴🔴");
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${bookings.length} bookings`);

    const bookingsWithProofs = bookings.filter((b) => b.paymentProof);
    console.log(`📸 ${bookingsWithProofs.length} bookings have payment proofs`);

    res.json(bookings);
  } catch (error) {
    console.error("❌ Error in getAllBookings:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET BOOKING BY ID
// ============================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log(`📋 Retrieved booking ${req.params.id}:`);
    console.log(`   - Payment Proof: ${booking.paymentProof || "NONE"}`);
    console.log(`   - Payment Status: ${booking.paymentStatus}`);
    console.log(`   - Status: ${booking.status}`);

    res.json(booking);
  } catch (error) {
    console.error("Error in getBookingById:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE BOOKING - full update for admin edits
// ============================================

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
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
      paymentMethod,
      paymentStatus,
      status,
      specialRequests,
      addons,
    } = req.body;

    const currentBooking = await Booking.findById(id);
    if (!currentBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (currentBooking.status === "Completed") {
      return res.status(400).json({ message: "Cannot modify a completed booking" });
    }

    const updateData = {};
    if (customerName    !== undefined) updateData.customerName    = customerName;
    if (customerContact !== undefined) updateData.customerContact = customerContact;
    if (customerEmail   !== undefined) updateData.customerEmail   = customerEmail;
    if (oasis           !== undefined) updateData.oasis           = oasis;
    if (packageName     !== undefined) updateData.package         = packageName;
    if (session         !== undefined) updateData.session         = session;
    if (bookingDate     !== undefined) updateData.bookingDate     = bookingDate;
    if (pax             !== undefined) updateData.pax             = pax;
    if (totalPrice      !== undefined) updateData.totalPrice      = totalPrice;
    if (downpayment     !== undefined) updateData.downpayment     = downpayment;
    if (paymentMethod   !== undefined) updateData.paymentMethod   = paymentMethod;
    if (paymentStatus   !== undefined) updateData.paymentStatus   = paymentStatus;
    if (status          !== undefined) updateData.status          = status;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (addons          !== undefined) updateData.addons          = addons || {};

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    if (status === "Confirmed" && (!currentBooking.status || currentBooking.status !== "Confirmed")) {
      const existingSale = await Sale.findOne({ booking: id });
      if (!existingSale && booking.totalPrice) {
        const sale = new Sale({
          booking: id,
          amount: booking.totalPrice,
          bookingNumber: booking.bookingNumber || 0,
          bookingReference: booking.bookingReference,
          location: booking.oasis,
          date: new Date(),
        });
        await sale.save();
        console.log(`✅ Sale record created for confirmed booking ${id}`);
      }
    }

    if (status === "Cancelled" && currentBooking.status !== "Cancelled") {
      const deletedSale = await Sale.findOneAndDelete({ booking: id });
      if (deletedSale) {
        console.log(`🗑️ Sale record deleted for cancelled booking ${id}`);
      }
    }

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// UPDATE BOOKING STATUS
// ============================================

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, confirmedBy } = req.body;

    const currentBooking = await Booking.findById(id);
    if (currentBooking.status === "Completed") {
      return res.status(400).json({ message: "Cannot modify a completed booking" });
    }
    if (currentBooking.status === "Checked-in" && status !== "Cancelled") {
      return res.status(400).json({ message: "Checked-in bookings can only be cancelled or checked out" });
    }

    const updateData = { status };
    if (confirmedBy) {
      updateData.confirmedBy = confirmedBy;
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    if (status === "Completed" && booking.totalAmount) {
      const existingSale = await Sale.findOne({ booking: id });
      if (!existingSale) {
        const sale = new Sale({
          booking: id,
          amount: booking.totalAmount,
          bookingNumber: booking.bookingNumber || 0,
          bookingReference: booking.bookingReference,
          location: booking.oasis,
          date: new Date(),
        });
        await sale.save();
        console.log(`✅ Sale record created for ${status} booking ${id} (Booking #${booking.bookingNumber})`);
      }
    }

    if (status === "Cancelled") {
      const deletedSale = await Sale.findOneAndDelete({ booking: id });
      if (deletedSale) {
        console.log(`🗑️ Sale record deleted for cancelled booking ${id}`);
      }
    }

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// UPDATE PAYMENT STATUS
// ============================================

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const updateData = { paymentStatus };
    if (paymentStatus === "Paid") {
      const booking = await Booking.findById(id);
      if (booking && booking.totalAmount) {
        updateData.downpayment = booking.totalAmount;
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: `Payment ${paymentStatus}`, booking });
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
// DELETE BOOKING
// ============================================

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Cannot delete a completed booking" });
    }

    const deletedSale = await Sale.findOneAndDelete({ booking: id });
    if (deletedSale) {
      console.log(`🗑️ Sale record deleted for booking ${id}`);
      console.log(`   Booking Reference: ${booking.bookingReference}`);
      console.log(`   Customer: ${booking.customerName}`);
      console.log(`   Amount: ₱${booking.totalAmount?.toLocaleString() || "N/A"}`);
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    console.log(`🗑️ Booking deleted successfully`);
    console.log(`   Booking #${booking.bookingNumber || "N/A"}`);
    console.log(`   Reference: ${booking.bookingReference}`);
    console.log(`   Status: ${booking.status}`);

    res.json({
      success: true,
      message: "Booking and associated sales records deleted successfully",
      deletedBooking,
      deletedSale,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET BOOKED DATES WITH SESSION INFO (with status colors)
// ============================================

const getBookedDatesWithSessions = async (req, res) => {
  try {
    const { oasis, email } = req.query;

    if (!oasis) {
      return res.status(400).json({ success: false, message: "Oasis is required" });
    }

    const getLocalDateString = (date) => {
      const year  = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day   = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const bookings = await Booking.find({
      oasis,
      status: { $in: ["Confirmed", "Pending"] },
    }).lean();

    console.log(`📅 Found ${bookings.length} bookings for ${oasis}`);

    const bookedDatesMap = {};

    bookings.forEach((booking) => {
      const dateStr   = getLocalDateString(booking.bookingDate);
      const session   = booking.session || "Day";
      const isConfirmed = booking.status === "Confirmed";
      const isPending   = booking.status === "Pending";

      if (!bookedDatesMap[dateStr]) {
        bookedDatesMap[dateStr] = {
          date: dateStr,
          Day:    { booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          Night:  { booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          "22hrs":{ booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          userHasBooking: false,
          userBookingSession: null,
          userBookingStatus: null,
        };
      }

      if (bookedDatesMap[dateStr][session]) {
        const sessionInfo = bookedDatesMap[dateStr][session];
        sessionInfo.count += 1;
        sessionInfo.names.push(booking.customerName);

        if (isConfirmed) sessionInfo.hasConfirmed = true;
        if (isPending)   sessionInfo.hasPending   = true;

        if (sessionInfo.hasConfirmed) {
          sessionInfo.status = "confirmed";
          sessionInfo.booked = true;
        } else if (sessionInfo.hasPending) {
          sessionInfo.status = "pending";
          sessionInfo.booked = true;
        }

        if (email && booking.customerEmail === email) {
          bookedDatesMap[dateStr].userHasBooking     = true;
          bookedDatesMap[dateStr].userBookingSession  = session;
          bookedDatesMap[dateStr].userBookingStatus   = booking.status;
          console.log(`✅ User ${email} has ${booking.status} booking on ${dateStr} for ${session} session`);
        }
      }
    });

    Object.keys(bookedDatesMap).forEach((dateStr) => {
      const dayInfo = bookedDatesMap[dateStr];
      if (dayInfo["22hrs"].count > 0) {
        dayInfo["22hrs"].booked = true;
        dayInfo["22hrs"].status = dayInfo["22hrs"].hasConfirmed ? "confirmed" : "pending";
        dayInfo.Day.booked  = true;
        dayInfo.Day.status  = dayInfo["22hrs"].status;
        dayInfo.Night.booked = true;
        dayInfo.Night.status = dayInfo["22hrs"].status;
      }
    });

    console.log("📤 Returning booked dates with status:", Object.keys(bookedDatesMap));

    res.json({ success: true, bookedDates: bookedDatesMap });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// VERIFY PAYMENT - Admin verifies payment proof and confirms booking
// ============================================

const verifyPayment = async (req, res) => {
  try {
    const { id }    = req.params;
    const userId    = req.user?.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let paymentStatus;
    let isRemainingPayment = false;

    if (booking.paymentStatus === "Partial") {
      paymentStatus = "Paid";
      isRemainingPayment = true;
    } else {
      paymentStatus = booking.paymentType === "fullpayment" ? "Paid" : "Partial";
    }

    const updateFields = {
      paymentStatus: paymentStatus,
      status: "Confirmed",
      paymentVerifiedBy: userId,
      paymentVerifiedAt: new Date(),
      confirmedBy: userId,
    };
    if (paymentStatus === "Paid") {
      updateFields.downpayment = booking.totalAmount;
    }
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })
      .populate("paymentVerifiedBy", "name email");

    const sendEmail = require("../utils/sendEmail");
    const LOGO_URL = `${process.env.FRONTEND_URL || "https://bluesense-de14.vercel.app"}/images/logo/Logo-NoBackground.png`;
    try {
      const isFullyPaid      = booking.paymentType === "fullpayment" || isRemainingPayment;
      const remainingBalance = booking.totalAmount - booking.downpayment;

      await sendEmail({
        to: booking.customerEmail,
        subject: isRemainingPayment
          ? "Final Payment Confirmed - Catherine's Oasis"
          : "Booking Confirmed - Catherine's Oasis",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background: #f0f9ff; padding: 48px 32px 32px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px;">
                <img src="${LOGO_URL}" alt="Catherine's Oasis" width="80" height="80"
                     style="width:80px;height:80px;object-fit:contain;display:block;border-radius:16px;"
                     onerror="this.style.display='none'">
              </div>
              <h1 style="margin: 0; color: #0c4a6e; font-size: 28px; font-weight: 600;">Catherine's Oasis</h1>
            </div>

            <div style="padding: 40px 32px; background: #ffffff;">
              <h2 style="margin: 0 0 8px; color: #0c4a6e; font-size: 22px;">
                ${isRemainingPayment ? "Payment Complete! 🎉" : "Booking Confirmed! 🎉"}
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Dear ${booking.customerName},<br/>
                ${isRemainingPayment
                  ? "Your final payment has been verified and your booking is now fully paid."
                  : "Your payment has been verified and your booking is confirmed."}
              </p>

              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <h3 style="margin: 0 0 16px; color: #0c4a6e; font-size: 16px; font-weight: 600;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 45%;">Venue</td>
                      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.oasis}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Package</td>
                      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.package}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
                      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${new Date(booking.bookingDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Guests</td>
                      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${booking.pax} pax</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Total Amount</td>
                      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">₱${booking.totalAmount.toLocaleString()}</td></tr>
                  ${isRemainingPayment
                    ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Total Paid</td>
                           <td style="padding: 8px 0; color: #16a34a; font-size: 14px; font-weight: 700;">₱${booking.totalAmount.toLocaleString()} ✓</td></tr>`
                    : `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount Paid</td>
                           <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">₱${booking.downpayment.toLocaleString()}</td></tr>
                       ${!isFullyPaid ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Remaining</td>
                           <td style="padding: 8px 0; color: #d97706; font-size: 14px; font-weight: 600;">₱${remainingBalance.toLocaleString()} (payable on-site)</td></tr>` : ""}`}
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status</td>
                      <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">
                        <span style="background: #dcfce7; color: #16a34a; padding: 2px 10px; border-radius: 20px;">Confirmed</span>
                      </td></tr>
                </table>
              </div>

              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                Please keep this email for your records. Show this confirmation to our staff when you arrive.
              </p>

              <div style="height: 1px; background: #e2e8f0; margin: 0 0 24px;"></div>
              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                Catherine's Oasis · 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    res.json({
      success: true,
      message: "Payment verified successfully. Booking confirmed and customer notified.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE PAYMENT PROOF
// ============================================

const deletePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!booking.paymentProof) {
      return res.status(400).json({ success: false, message: "No payment proof to delete" });
    }

    try {
      if (booking.paymentProof && booking.paymentProof.includes("cloudinary.com")) {
        await deleteFromCloudinary(booking.paymentProof);
        console.log("✅ Payment proof deleted from Cloudinary");
      }
    } catch (fileDeleteError) {
      console.warn("⚠️  Could not delete from Cloudinary:", fileDeleteError.message);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { paymentProof: null },
      { new: true }
    );

    res.json({ success: true, message: "Payment proof deleted successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error deleting payment proof:", error);
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(404).json({ success: false, message: "Booking not found. Please refresh and try again." });
    }

    if (booking.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: "You can only cancel your own bookings." });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "This booking has already been cancelled." });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel a completed booking." });
    }

    booking.status             = "Cancelled";
    booking.cancellationReason = isEmergency === "true" ? "emergency" : "user_cancelled";
    booking.cancellationNote   = reason || "User requested cancellation";
    booking.cancelledAt        = new Date();
    booking.cancelledBy        = req.user.email;

    if (isEmergency === "true") {
      booking.refundRequested = true;
      booking.refundStatus    = "pending";
      booking.refundReason    = reason;
      if (proofFile) {
        try {
          const { url } = await uploadRefundProof(proofFile.buffer);
          booking.refundProof = url;
          console.log("✅ Refund proof uploaded to Cloudinary:", url);
        } catch (uploadErr) {
          console.error("❌ Cloudinary refund proof upload failed:", uploadErr.message);
        }
      }
    }

    await booking.save();

    const existingSale = await Sale.findOne({ booking: id });
    if (existingSale) {
      await Sale.findOneAndDelete({ booking: id });
    }

    const message = isEmergency === "true"
      ? "✅ Your cancellation has been submitted successfully. Your refund request is now pending review. Our team will get back to you within 3-5 business days."
      : "✅ Your booking has been cancelled. Please note that the downpayment is non-refundable.";

    res.json({ success: true, message, booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
};

// ============================================
// CHECK-IN - Confirmed → Checked-in
// ============================================

const checkIn = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user?.id;

    const booking = await Booking.findById(id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status === "Checked-in")
      return res.status(400).json({ success: false, message: "Booking is already checked in" });
    if (booking.status === "Completed")
      return res.status(400).json({ success: false, message: "Booking is already completed" });
    if (booking.status === "Cancelled")
      return res.status(400).json({ success: false, message: "Cannot check in a cancelled booking" });
    if (booking.status !== "Confirmed")
      return res.status(400).json({ success: false, message: "Booking must be Confirmed before check-in. Verify the downpayment first." });

    booking.status      = "Checked-in";
    booking.checkedInBy  = userId;
    booking.checkedInAt  = new Date();
    await booking.save();

    console.log(`✅ Check-in: ${booking.customerName} | ${booking.oasis} | ${booking.package}`);
    res.json({ success: true, message: `${booking.customerName} has been checked in successfully.`, booking });
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHECK-OUT - Checked-in → Completed
// ============================================

const checkOut = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user?.id;

    const booking = await Booking.findById(id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status === "Completed")
      return res.status(400).json({ success: false, message: "Booking is already completed" });
    if (booking.status !== "Checked-in")
      return res.status(400).json({ success: false, message: "Booking must be in Checked-in status before check-out." });

    if (booking.paymentStatus === "Partial") {
      booking.downpayment   = booking.totalAmount;
      booking.paymentStatus = "Paid";
    }

    booking.status       = "Completed";
    booking.checkedOutBy  = userId;
    booking.checkedOutAt  = new Date();
    await booking.save();

    const existingSale = await Sale.findOne({ booking: id });
    if (!existingSale && booking.totalAmount) {
      const sale = new Sale({
        booking:          id,
        amount:           booking.totalAmount,
        bookingNumber:    booking.bookingNumber || 0,
        bookingReference: booking.bookingReference,
        location:         booking.oasis,
        date:             new Date(),
      });
      await sale.save();
      console.log(`✅ Sale record created on check-out for booking ${id} (#${booking.bookingNumber})`);
    }

    console.log(`✅ Check-out: ${booking.customerName} | ${booking.oasis} | ${booking.package}`);
    res.json({ success: true, message: `${booking.customerName} has been checked out. Booking completed.`, booking });
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CLEANUP ORPHANED SALES
// ============================================

const cleanupOrphanedSales = async (req, res) => {
  try {
    console.log("🧹 Starting cleanup of orphaned sales records...");

    const allSales = await Sale.find();
    console.log(`📊 Total sales in database: ${allSales.length}`);

    let orphanedCount = 0;
    const orphanedSales = [];

    for (const sale of allSales) {
      if (sale.booking) {
        const booking = await Booking.findById(sale.booking);
        if (!booking) {
          orphanedSales.push(sale._id);
          orphanedCount++;
        }
      }
    }

    if (orphanedCount === 0) {
      return res.json({
        success: true,
        message: "✅ No orphaned sales found. All sales have matching bookings.",
        totalSales: allSales.length,
        orphanedCount: 0,
      });
    }

    console.log(`🗑️ Found ${orphanedCount} orphaned sales records`);

    const result = await Sale.deleteMany({ _id: { $in: orphanedSales } });

    console.log(`✅ Deleted ${result.deletedCount} orphaned sales records`);

    res.json({
      success: true,
      message: `✅ Cleanup complete! Deleted ${orphanedCount} orphaned sales records.`,
      totalSales: allSales.length,
      orphanedCount: orphanedCount,
      deletedCount: result.deletedCount,
      orphanedSalesIds: orphanedSales,
    });
  } catch (error) {
    console.error("❌ Error cleaning up orphaned sales:", error);
    res.status(500).json({ success: false, message: "Error cleaning up orphaned sales: " + error.message });
  }
};

// ============================================
// SYNC BOOKINGS & SALES
// ============================================

const syncBookingsAndSales = async (req, res) => {
  try {
    console.log("🔄 Starting comprehensive booking & sales sync...\n");

    let deletedOrphanedSales = 0;
    let deletedSalesForNonCompleted = 0;
    let issues = [];

    console.log("📋 Step 1: Removing sales with missing bookings...");
    const allSales = await Sale.find();

    for (const sale of allSales) {
      if (sale.booking) {
        const booking = await Booking.findById(sale.booking);
        if (!booking) {
          await Sale.findByIdAndDelete(sale._id);
          deletedOrphanedSales++;
          console.log(`  🗑️ Deleted orphaned sale: ${sale.bookingReference || sale._id}`);
        }
      }
    }

    console.log("\n📋 Step 2: Removing sales for non-completed bookings...");
    const salesForNonCompleted = await Sale.find().populate("booking", "status bookingReference bookingNumber");

    for (const sale of salesForNonCompleted) {
      if (sale.booking && sale.booking.status !== "Completed") {
        await Sale.findByIdAndDelete(sale._id);
        deletedSalesForNonCompleted++;
        console.log(`  🗑️ Deleted sale for ${sale.booking.status} booking: ${sale.booking.bookingReference}`);
      }
    }

    console.log("\n📋 Step 3: Verifying final data state...");
    const finalBookings = await Booking.find();
    const finalSales    = await Sale.find().populate("booking", "bookingReference status bookingNumber");

    for (const sale of finalSales) {
      if (sale.booking && sale.booking.status !== "Completed") {
        issues.push({
          type: "WARNING",
          issue: "Sale found for non-completed booking",
          sale: sale._id,
          booking: sale.booking.bookingReference,
          status: sale.booking.status,
        });
      }
    }

    console.log(`\n✅ Sync Complete!\n`);

    res.json({
      success: true,
      message: "✅ Booking and Sales data synchronized successfully!",
      summary: {
        totalBookings: finalBookings.length,
        totalSales: finalSales.length,
        deletedOrphanedSales,
        deletedSalesForNonCompleted,
        totalDeleted: deletedOrphanedSales + deletedSalesForNonCompleted,
        remainingIssues: issues.length,
      },
      issues: issues,
    });
  } catch (error) {
    console.error("❌ Error syncing bookings & sales:", error);
    res.status(500).json({ success: false, message: "Error syncing bookings & sales: " + error.message });
  }
};

// ============================================
// VERIFY SALES AND BOOKINGS CONNECTION
// ============================================

const verifySalesConnection = async (req, res) => {
  try {
    console.log("🔍 Verifying sales and bookings connection...");

    const allBookings = await Booking.find();
    const allSales    = await Sale.find();

    console.log(`📊 Total bookings: ${allBookings.length}`);
    console.log(`💰 Total sales: ${allSales.length}`);

    let connectedCount   = 0;
    let orphanedBookings = 0;
    let orphanedSales    = 0;
    const issues = [];

    for (const booking of allBookings) {
      if (booking.status === "Completed") {
        const sale = await Sale.findOne({ booking: booking._id });
        if (!sale) {
          orphanedBookings++;
          issues.push({ type: "Missing Sale", bookingId: booking._id, bookingRef: booking.bookingReference, bookingStatus: booking.status, bookingNumber: booking.bookingNumber });
        } else {
          connectedCount++;
        }
      }
    }

    for (const sale of allSales) {
      if (sale.booking) {
        const booking = await Booking.findById(sale.booking);
        if (!booking) {
          orphanedSales++;
          issues.push({ type: "Orphaned Sale", saleId: sale._id, bookingId: sale.booking, amount: sale.amount });
        }
      }
    }

    res.json({
      success: true,
      summary: {
        totalBookings: allBookings.length,
        totalSales: allSales.length,
        connectedPairs: connectedCount,
        orphanedBookings: orphanedBookings,
        orphanedSales: orphanedSales,
      },
      issues: issues.slice(0, 50),
    });
  } catch (error) {
    console.error("❌ Error verifying sales connection:", error);
    res.status(500).json({ success: false, message: "Error verifying connection: " + error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  getBookingsByCustomerEmail,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  getBookedDatesWithSessions,
  verifyPayment,
  checkIn,
  checkOut,
  deletePaymentProof,
  cancelBooking,
  cleanupOrphanedSales,
  verifySalesConnection,
  syncBookingsAndSales,
};