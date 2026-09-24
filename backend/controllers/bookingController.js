// backend/controllers/bookingController.js
// ============================================
// BOOKING CONTROLLER - with booking limits & capacity management
// ============================================

console.log("🟢🟢🟢 BOOKING CONTROLLER IS LOADED! 🟢🟢🟢");

const Booking = require("../models/Booking");
const Sale = require("../models/Sale");
const { uploadPaymentProof, uploadRefundProof, deleteFromCloudinary } = require("../utils/cloudinary");

const Package = require("../models/Package");

// ============================================
// CAPACITY CONFIGURATION
// ============================================

const OASIS_CONFIG = {
  "Oasis 1": {
    sessions: { Day: {}, Night: {}, "22hrs": {} },
  },
  "Oasis 2": {
    sessions: { Day: {}, Night: {}, "22hrs": {} },
  },
};

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
// CRON JOB: Auto-delete expired Reserved bookings
// ============================================
// WHY: A Reserved booking holds a slot for 30 minutes. If the customer
//      abandons the flow (closes the tab, goes back, etc.) their Reserved
//      booking must be cleaned up so the slot becomes available again.
//
// HOW: We use setInterval instead of a cron library to avoid adding a
//      dependency. Runs every 5 minutes. Deletes any booking where:
//        status === "Reserved" AND reservedUntil < now
//
// IMPORTANT: This runs once when the controller module is first loaded
//            (i.e. when the Express app starts). It will keep running for
//            the lifetime of the process.
//
// If you later add node-cron, replace this with:
//   cron.schedule('*/5 * * * *', cleanupExpiredReservations);

const cleanupExpiredReservations = async () => {
  try {
    const result = await Booking.deleteMany({
      status: "Reserved",
      reservedUntil: { $lt: new Date() },
    });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cron: Deleted ${result.deletedCount} expired Reserved booking(s)`);
    }
  } catch (err) {
    console.error("❌ Cron: Error cleaning up expired reservations:", err.message);
  }
};

// Start the cleanup interval immediately on module load.
setInterval(cleanupExpiredReservations, 1 * 60 * 1000); // every 1 minute
console.log("⏰ Reservation cleanup cron started (runs every 1 minute)");

// ============================================
// RESERVE SLOT — Step 2 Continue button
// ============================================
// POST /api/bookings/reserve
//
// Creates an internal "Reserved" booking to hold the slot for 30 minutes.
// This is NOT a real booking and is NOT visible to admin.
// It graduates to "Pending" only when the customer clicks Confirm Booking (Step 4).
//
// Race protection: The compound unique index on { bookingDate, session, oasis, package }
// with partialFilterExpression { status: { $nin: ['Cancelled','Completed','Checked-in'] }}
// means only ONE document per slot can exist at a time (Reserved counts as blocking).
// If two customers click Continue simultaneously, one insert wins and the other gets
// a duplicate-key error (E11000), which we catch and return as a 409.

const reserveSlot = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerContact,
      oasis,
      package: packageName,
      session,
      bookingDate,
      pax,
      specialRequests,
    } = req.body;

    // ---- Basic required-field validation ----
    if (!customerName?.trim() || !customerEmail?.trim()) {
      return res.status(400).json({ success: false, message: "Customer name and email are required" });
    }
    if (!oasis || !packageName || !session || !bookingDate) {
      return res.status(400).json({ success: false, message: "Oasis, package, session, and date are required" });
    }

    // ---- Parse booking date as local midnight ----
    let selectedDate;
    if (typeof bookingDate === "string") {
      const [year, month, day] = bookingDate.split("-");
      selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    } else {
      selectedDate = new Date(bookingDate);
    }

    // ---- Must be at least 1 day in advance ----
    const minAdvanceDate = new Date();
    minAdvanceDate.setDate(minAdvanceDate.getDate() + 1);
    minAdvanceDate.setHours(0, 0, 0, 0);
    if (selectedDate < minAdvanceDate) {
      return res.status(400).json({ success: false, message: "Bookings must be made at least 1 day in advance." });
    }

    // ---- Validate session ----
    const sessionConfig = OASIS_CONFIG[oasis]?.sessions[session];
    if (!sessionConfig) {
      return res.status(400).json({ success: false, message: `${session} session is not available for ${oasis}.` });
    }

    // ---- Validate package is active ----
    const packageDoc = await Package.findOne({ oasis, name: packageName });
    if (!packageDoc || packageDoc.isActive === false) {
      return res.status(400).json({ success: false, message: `${packageName} is not available for booking.` });
    }

    // ---- Create the Reserved booking ----
    // The compound unique index provides the race protection here.
    // If the slot is already taken (by a Reserved, Pending, or Confirmed booking),
    // Mongoose throws a duplicate-key error (code 11000) which we convert to a 409.
    const reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // now + 5 minutes

    const reservation = new Booking({
      customerName:    customerName.trim(),
      customerEmail:   customerEmail.trim(),
      customerContact: customerContact?.trim() || "",
      oasis,
      package:         packageName,
      session,
      bookingDate:     selectedDate,
      pax:             parseInt(pax) || 1,
      specialRequests: specialRequests || "",
      status:          "Reserved",
      reservedUntil,
      // Payment fields are intentionally omitted — they are filled in at Step 4
      // when the customer calls confirmBooking. The model no longer requires them
      // at schema level to allow this partial creation.
    });

    await reservation.save();

    console.log(`✅ Slot reserved: ${oasis} | ${packageName} | ${session} | ${bookingDate} until ${reservedUntil.toISOString()}`);

    return res.status(201).json({
      success: true,
      message: "Slot reserved for 5 minutes. Please complete your booking.",
      bookingId: reservation._id,
      reservedUntil,
    });

  } catch (error) {
    // E11000 = MongoDB duplicate key — the slot is already taken
    if (error.code === 11000) {
      // FIX 6: Before returning 409, check if this is the SAME customer's own reservation.
      // We must use the parsed selectedDate Date object (built above), NOT the raw string
      // from req.body.bookingDate — otherwise the query won't match the stored Date.
      try {
        const {
          customerEmail,
          oasis,
          package: packageName,
          session,
        } = req.body;

        // Re-parse the date the same way as above so the query matches what's stored
        let selectedDateForLookup;
        if (typeof req.body.bookingDate === "string") {
          const [year, month, day] = req.body.bookingDate.split("-");
          selectedDateForLookup = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        } else {
          selectedDateForLookup = new Date(req.body.bookingDate);
        }

        const existing = await Booking.findOne({
          oasis,
          package:       packageName,
          session,
          bookingDate:   selectedDateForLookup,
          status:        "Reserved",
          customerEmail: customerEmail.trim(),
        });

        if (existing) {
          // Same customer's own reservation — return it so the frontend can reuse it
          console.log(`♻️  Reusing existing reservation ${existing._id} for ${customerEmail}`);
          return res.status(200).json({
            success:      true,
            bookingId:    existing._id,
            reservedUntil: existing.reservedUntil,
            reused:       true,
          });
        }
      } catch (lookupErr) {
        console.error("Reserve slot: error during reuse lookup:", lookupErr.message);
        // Fall through to the 409 below
      }

      console.log(`❌ Slot already reserved/booked: ${req.body.oasis} | ${req.body.package} | ${req.body.session} | ${req.body.bookingDate}`);
      return res.status(409).json({
        success: false,
        message: "This date and session is already reserved. Please select another date or session.",
        error: "SLOT_TAKEN",
      });
    }
    console.error("Reserve slot error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// RELEASE SLOT — in-app Back button / beforeunload
// ============================================
// DELETE /api/bookings/reserve/:id
//
// Deletes a Reserved booking so the slot is freed immediately.
// Idempotent: returns 200 even if the booking is already gone (already released
// or cleaned up by cron). Returns 400 if the booking exists but is NOT Reserved
// — we never delete a Pending/Confirmed booking this way.

const releaseSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      // Already gone (released, expired, or never existed) — idempotent success
      return res.status(200).json({ success: true, message: "Already released" });
    }

    if (booking.status !== "Reserved") {
      // Never release a Pending, Confirmed, etc.
      return res.status(400).json({
        success: false,
        message: `Cannot release a booking with status "${booking.status}".`,
      });
    }

    await Booking.findByIdAndDelete(id);
    console.log(`🔓 Slot released: ${id} | ${booking.oasis} | ${booking.package} | ${booking.session} | ${booking.bookingDate}`);

    return res.status(200).json({ success: true, message: "Slot released successfully." });
  } catch (error) {
    console.error("Release slot error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CONFIRM BOOKING — Step 4 Confirm Booking button
// ============================================
// PATCH /api/bookings/:id/confirm
//
// Upgrades the existing Reserved booking to "Pending" with all payment details.
// This is when the booking first becomes visible to admin.
//
// Why we update instead of create:
//   The slot is already held by the Reserved booking (created at Step 2).
//   If we deleted + re-created, there would be a brief window where the slot
//   is free and a race condition could slip through. Updating in-place keeps
//   the slot continuously held.

const confirmBooking = async (req, res) => {
  try {
    console.log("📥 Confirm Booking Request Body:", req.body);
    console.log("📥 Confirm Booking File:", req.file);

    const { id } = req.params;

    const {
      totalPrice,
      downpayment,
      paymentMethod,
      paymentType,
      addons,
      pax,
    } = req.body;

    // ---- Find the Reserved booking ----
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Reservation not found. Please start over." });
    }

    if (booking.status !== "Reserved") {
      // Already confirmed or cancelled — guard against double-submit
      return res.status(400).json({
        success: false,
        message: `Booking is already in "${booking.status}" status. Cannot confirm again.`,
      });
    }

    // ---- Check the reservation hasn't expired ----
    if (booking.reservedUntil && new Date() > booking.reservedUntil) {
      // The cron might not have fired yet — delete it now and tell the customer to retry
      await Booking.findByIdAndDelete(id);
      return res.status(410).json({
        success: false,
        message: "Your reservation has expired. Please go back to Step 2 and select your date again.",
        error: "RESERVATION_EXPIRED",
      });
    }

    // ---- Validate payment fields ----
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method is required" });
    }
    if (!totalPrice || downpayment === undefined || downpayment === null) {
      return res.status(400).json({ success: false, message: "Total price and downpayment are required" });
    }

    // ---- Upload payment proof ----
    let paymentProof = null;
    if (req.file) {
      try {
        const { url } = await uploadPaymentProof(req.file.buffer);
        paymentProof = url;
        console.log("✅ Payment proof uploaded to Cloudinary:", url);
      } catch (uploadErr) {
        console.error("❌ Cloudinary payment proof upload failed:", uploadErr.message);
      }
    }

    // ---- Parse addons ----
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

    // ---- Generate booking reference and number ----
    // These are only assigned when the booking becomes real (Pending).
    const bookingReference = await generateBookingReference();

    const lastBooking = await Booking.findOne({ bookingNumber: { $exists: true, $ne: null } })
      .sort({ bookingNumber: -1 })
      .select("bookingNumber");
    const nextBookingNumber = (lastBooking?.bookingNumber || 0) + 1;

    // ---- Upgrade Reserved → Pending ----
    const mapPaymentMethod = (m) =>
      ({ cash: "Cash", gcash: "GCash", maya: "Maya", seabank: "SeaBank", gotyme: "GoTyme" })[m] || m;

    booking.status           = "Pending";
    booking.reservedUntil    = null; // no longer needed
    booking.totalAmount      = parseFloat(totalPrice);
    booking.downpayment      = paymentType === "fullpayment" ? parseFloat(totalPrice) : parseFloat(downpayment);
    booking.paymentMethod    = mapPaymentMethod(paymentMethod);
    booking.paymentType      = paymentType || "downpayment";
    booking.paymentStatus    = paymentType === "fullpayment" ? "Paid" : "Partial";
    booking.paymentProof     = paymentProof;
    booking.addons           = parsedAddons;
    booking.pax              = parseInt(pax) || booking.pax;
    booking.bookingReference = bookingReference;
    booking.bookingNumber    = nextBookingNumber;

    await booking.save();

    console.log(`✅ Booking confirmed (Reserved → Pending):`);
    console.log(`   - Booking ID:        ${booking._id}`);
    console.log(`   - Booking Reference: ${booking.bookingReference}`);
    console.log(`   - Booking Number:    ${booking.bookingNumber}`);
    console.log(`   - Payment Proof:     ${booking.paymentProof || "NONE"}`);

    return res.status(200).json({
      success: true,
      message: "Booking submitted successfully. Please wait for staff to verify your payment.",
      booking,
    });

  } catch (error) {
    console.error("Confirm booking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CREATE BOOKING (legacy — kept for any internal/admin use)
// ============================================
// NOTE: The customer-facing flow no longer calls this directly.
// Step 2 calls reserveSlot, Step 4 calls confirmBooking.
// This function is kept so any admin tooling that calls POST /api/bookings
// directly continues to work.

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

    const trimmedCustomerName    = customerName?.trim();
    const trimmedCustomerContact = customerContact?.trim();
    const trimmedCustomerEmail   = customerEmail?.trim();

    if (!trimmedCustomerName || !trimmedCustomerEmail) {
      return res.status(400).json({ success: false, message: "Customer name and email are required" });
    }

    if (trimmedCustomerContact) {
      const phPhoneRegex = /^(\+?63|0)?9\d{9}$/;
      if (!phPhoneRegex.test(trimmedCustomerContact)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number. Accepted formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX, 9XXXXXXXXX",
        });
      }
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(trimmedCustomerEmail)) {
      return res.status(400).json({ success: false, message: "Email must be a valid Gmail address ending with @gmail.com" });
    }

    if (!oasis || !packageName || !session) {
      return res.status(400).json({ success: false, message: "Oasis, package, and session selection are required" });
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
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method is required" });
    }

    let selectedDate;
    if (typeof bookingDate === "string") {
      const [year, month, day] = bookingDate.split("-");
      selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    } else {
      selectedDate = new Date(bookingDate);
    }

    const { start, end } = getDayRange(selectedDate);

    const packageDoc = await Package.findOne({ oasis, name: packageName });

    if (packageDoc) {
      const baseCapacity  = packageDoc.maxCapacity;
      const maxExtraGuests = packageDoc.maxExtraGuests ?? null;
      const guestCount    = parseInt(pax);

      if (maxExtraGuests !== null) {
        const totalMax = baseCapacity + maxExtraGuests;
        if (guestCount > totalMax) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${totalMax} pax allowed for ${packageName} (${baseCapacity} base + ${maxExtraGuests} extra). You have ${guestCount} guests.`,
          });
        }
      }

      if (guestCount > baseCapacity) {
        const extraGuests  = guestCount - baseCapacity;
        const feePerPerson = packageDoc.extraGuestFee ?? 150;
        console.log(`✅ ${extraGuests} extra guest(s) for ${packageName}. Extra charge: ₱${extraGuests * feePerPerson}`);
      }
    } else {
      console.warn(`⚠️ Package "${packageName}" not found in DB for oasis "${oasis}". Skipping capacity check.`);
    }

    const sessionConfig = OASIS_CONFIG[oasis]?.sessions[session];
    if (!sessionConfig) {
      return res.status(400).json({ success: false, message: `${session} session is not available for ${oasis}.` });
    }

    const activePackageDoc = packageDoc ?? await Package.findOne({ oasis, name: packageName });
    if (!activePackageDoc || activePackageDoc.isActive === false) {
      return res.status(400).json({ success: false, message: `${packageName} is not available for booking.` });
    }

    // Double-booking check — excludes Reserved so it doesn't interfere with admin-created bookings
    const exactMatchBooking = await Booking.findOne({
      oasis,
      session,
      bookingDate: { $gte: start, $lt: end },
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (exactMatchBooking) {
      return res.status(409).json({
        success: false,
        message: "This date and session is already booked. Please select another date or session.",
        error: "DUPLICATE_BOOKING",
      });
    }

    const minAdvanceDate = new Date();
    minAdvanceDate.setDate(minAdvanceDate.getDate() + 1);
    minAdvanceDate.setHours(0, 0, 0, 0);
    if (selectedDate < minAdvanceDate) {
      return res.status(400).json({ success: false, message: "Bookings must be made at least 1 day in advance." });
    }

    const bookingReference = await generateBookingReference();
    const lastBooking = await Booking.findOne({ bookingNumber: { $exists: true, $ne: null } })
      .sort({ bookingNumber: -1 })
      .select("bookingNumber");
    const nextBookingNumber = (lastBooking?.bookingNumber || 0) + 1;

    const newBooking = new Booking({
      customerName:    trimmedCustomerName,
      customerContact: trimmedCustomerContact,
      customerEmail:   trimmedCustomerEmail,
      oasis,
      package:         packageName,
      session,
      bookingDate,
      pax,
      totalAmount:     totalPrice,
      downpayment:     paymentType === "fullpayment" ? parseFloat(totalPrice) : parseFloat(downpayment),
      addons:          parsedAddons || {},
      specialRequests: specialRequests || "",
      paymentMethod,
      paymentType:     paymentType || "downpayment",
      paymentProof:    paymentProof || null,
      status:          status || "Pending",
      paymentStatus:   paymentType === "fullpayment" ? "Paid" : "Partial",
      bookingReference,
      bookingNumber:   nextBookingNumber,
    });

    await newBooking.save();

    console.log(`✅ Booking created successfully:`);
    console.log(`   - Booking ID: ${newBooking._id}`);

    return res.status(201).json({
      success: true,
      message: "Booking submitted successfully. Please wait for staff to verify your payment.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This date and session is already booked. Please select another date or session.",
        error: "DUPLICATE_BOOKING",
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL BOOKINGS (admin) — filters out Reserved
// ============================================

const getAllBookings = async (req, res) => {
  console.log("🔴🔴🔴 getAllBookings FUNCTION IS EXECUTING! 🔴🔴🔴");
  try {
    // "Reserved" bookings are internal placeholders — never shown to admin.
    const bookings = await Booking.find({ status: { $ne: "Reserved" } }).sort({ createdAt: -1 });
    console.log(`✅ Found ${bookings.length} bookings (Reserved excluded)`);

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
          booking:          id,
          amount:           booking.totalPrice,
          bookingNumber:    booking.bookingNumber || 0,
          bookingReference: booking.bookingReference,
          location:         booking.oasis,
          date:             new Date(),
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
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This date and session is already booked. Please select another date or session.",
        error: "DUPLICATE_BOOKING",
      });
    }
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
          booking:          id,
          amount:           booking.totalAmount,
          bookingNumber:    booking.bookingNumber || 0,
          bookingReference: booking.bookingReference,
          location:         booking.oasis,
          date:             new Date(),
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
// GET BOOKINGS BY CUSTOMER EMAIL
// ============================================

const getBookingsByCustomerEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Exclude Reserved bookings from the customer's booking history view
    // (they are transient and meaningless to display)
    const bookings = await Booking.find({
      customerEmail: email,
      status: { $ne: "Reserved" },
    })
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
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    console.log(`🗑️ Booking deleted: #${booking.bookingNumber || "N/A"} | ${booking.bookingReference} | ${booking.status}`);

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
// GET BOOKED DATES WITH SESSION INFO
// ============================================
// NOTE: "Reserved" bookings ARE included here so the calendar blocks the slot
// for other customers browsing (they'll see it grayed out).
// The "reserved" status is surfaced as "pending" colour-wise (yellow) since
// from a customer's perspective the slot is simply unavailable.

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

    // Include "Reserved" so the calendar shows the slot as taken.
    // Exclude Cancelled / Completed / Checked-in (those slots are free).
    const bookings = await Booking.find({
      oasis,
      status: { $in: ["Reserved", "Pending", "Confirmed"] },
    }).lean();

    console.log(`📅 Found ${bookings.length} bookings for ${oasis} (including Reserved)`);

    const bookedDatesMap = {};

    bookings.forEach((booking) => {
      const dateStr     = getLocalDateString(booking.bookingDate);
      const session     = booking.session || "Day";
      const isConfirmed = booking.status === "Confirmed";
      const isPending   = booking.status === "Pending";
      const isReserved  = booking.status === "Reserved";

      if (!bookedDatesMap[dateStr]) {
        bookedDatesMap[dateStr] = {
          date: dateStr,
          Day:     { booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          Night:   { booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          "22hrs": { booked: false, status: "available", count: 0, names: [], hasConfirmed: false, hasPending: false },
          userHasBooking:       false,
          userBookingSession:   null,
          userBookingStatus:    null,
        };
      }

      if (bookedDatesMap[dateStr][session]) {
        const sessionInfo = bookedDatesMap[dateStr][session];
        sessionInfo.count += 1;
        sessionInfo.names.push(booking.customerName);

        if (isConfirmed) sessionInfo.hasConfirmed = true;
        if (isPending)   sessionInfo.hasPending   = true;
        // Reserved slots show as "pending" colour to the customer (yellow / unavailable)
        if (isReserved && !sessionInfo.hasPending && !sessionInfo.hasConfirmed) {
          sessionInfo.hasPending = true;
        }

        if (sessionInfo.hasConfirmed) {
          sessionInfo.status = "confirmed";
          sessionInfo.booked = true;
        } else if (sessionInfo.hasPending) {
          sessionInfo.status = "pending";
          sessionInfo.booked = true;
        }

        // Only surface non-Reserved bookings as the user's own booking
        // (a Reserved booking by this user is just a transient slot hold)
        if (email && booking.customerEmail === email && booking.status !== "Reserved") {
          bookedDatesMap[dateStr].userHasBooking    = true;
          bookedDatesMap[dateStr].userBookingSession = session;
          bookedDatesMap[dateStr].userBookingStatus  = booking.status;
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

    res.json({ success: true, bookedDates: bookedDatesMap });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// VERIFY PAYMENT - Admin verifies payment proof
// ============================================

const verifyPayment = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user?.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let paymentStatus;
    let isRemainingPayment = false;

    if (booking.paymentStatus === "Partial") {
      paymentStatus      = "Paid";
      isRemainingPayment = true;
    } else {
      paymentStatus = booking.paymentType === "fullpayment" ? "Paid" : "Partial";
    }

    const updateFields = {
      paymentStatus,
      status:             "Confirmed",
      paymentVerifiedBy:  userId,
      paymentVerifiedAt:  new Date(),
      confirmedBy:        userId,
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
        to:      booking.customerEmail,
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

    const updatedBooking = await Booking.findByIdAndUpdate(id, { paymentProof: null }, { new: true });
    res.json({ success: true, message: "Payment proof deleted successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error deleting payment proof:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CANCEL BOOKING
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
// CHECK-IN
// ============================================

const checkIn = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user?.id;

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
// CHECK-OUT
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

    booking.status      = "Completed";
    booking.checkedOutBy = userId;
    booking.checkedOutAt = new Date();
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
        message: "✅ No orphaned sales found.",
        totalSales: allSales.length,
        orphanedCount: 0,
      });
    }

    const result = await Sale.deleteMany({ _id: { $in: orphanedSales } });

    res.json({
      success: true,
      message: `✅ Cleanup complete! Deleted ${orphanedCount} orphaned sales records.`,
      totalSales: allSales.length,
      orphanedCount,
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

    const allSales = await Sale.find();
    for (const sale of allSales) {
      if (sale.booking) {
        const booking = await Booking.findById(sale.booking);
        if (!booking) {
          await Sale.findByIdAndDelete(sale._id);
          deletedOrphanedSales++;
        }
      }
    }

    const salesForNonCompleted = await Sale.find().populate("booking", "status bookingReference bookingNumber");
    for (const sale of salesForNonCompleted) {
      if (sale.booking && sale.booking.status !== "Completed") {
        await Sale.findByIdAndDelete(sale._id);
        deletedSalesForNonCompleted++;
      }
    }

    const finalBookings = await Booking.find({ status: { $ne: "Reserved" } });
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
      issues,
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
    const allBookings = await Booking.find({ status: { $ne: "Reserved" } });
    const allSales    = await Sale.find();

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
        orphanedBookings,
        orphanedSales,
      },
      issues: issues.slice(0, 50),
    });
  } catch (error) {
    console.error("❌ Error verifying sales connection:", error);
    res.status(500).json({ success: false, message: "Error verifying connection: " + error.message });
  }
};

module.exports = {
  reserveSlot,
  releaseSlot,
  confirmBooking,
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