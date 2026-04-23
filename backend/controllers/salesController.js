const Sale = require('../models/Sale');
const Booking = require('../models/Booking');

/**
 * Sales Controller
 * Handles revenue tracking and sales reporting
 * Provides daily, weekly, and monthly sales data for financial overview
 */

/**
 * GET /api/admin/sales
 * Get all sales transactions (Admin only)
 * Includes booking or reservation details, reference code, and location
 */
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('booking', 'bookingNumber bookingReference oasis customerName totalAmount status')
      .populate('reservation', 'room guestName')
      .sort({ date: -1 });
    
    // Filter to only include confirmed or completed bookings (both represent received revenue)
    const completedSales = sales.filter(sale => {
      if (sale.booking) {
        return sale.booking.status === 'Confirmed' || sale.booking.status === 'Completed';
      }
      return true; // Keep reservation sales (no booking status to check)
    });
    
    // Format sales with reference code and location
    const formattedSales = completedSales.map(sale => ({
      _id: sale._id,
      amount: sale.amount,
      date: sale.date,
      bookingNumber: sale.booking?.bookingNumber || sale.bookingNumber || 'N/A',
      referenceCode: sale.booking?.bookingReference || sale.bookingReference || 'N/A',
      location: sale.booking?.oasis || sale.location || 'N/A',
      customerName: sale.booking?.customerName || 'N/A',
      type: sale.booking ? 'Booking' : 'Reservation',
      booking: sale.booking,
      reservation: sale.reservation,
    }));
    
    res.json(formattedSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/daily?date=YYYY-MM-DD
 * Get sales for a specific day
 * Query: date (format: YYYY-MM-DD)
 * Returns: sales array, reference codes, locations, and total for the day
 */
exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day

    const dailySales = await Sale.find({
      date: { $gte: startDate, $lt: endDate }
    })
      .populate('booking', 'bookingNumber bookingReference oasis customerName totalAmount status')
      .populate('reservation', 'room guestName')
      .sort({ date: -1 });

    // Filter to only include confirmed or completed bookings (both represent received revenue)
    const completedSales = dailySales.filter(sale => {
      if (sale.booking) {
        return sale.booking.status === 'Confirmed' || sale.booking.status === 'Completed';
      }
      return true; // Keep reservation sales
    });

    // Format sales with reference code and location
    const formattedSales = completedSales.map(sale => ({
      _id: sale._id,
      amount: sale.amount,
      date: sale.date,
      bookingNumber: sale.bookingNumber || sale.booking?.bookingNumber || 'N/A',
      referenceCode: sale.bookingReference || sale.booking?.bookingReference || 'N/A',
      location: sale.location || sale.booking?.oasis || 'N/A',
      type: sale.booking ? 'Booking' : 'Reservation',
      booking: sale.booking,
      reservation: sale.reservation,
    }));

    const total = formattedSales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: formattedSales, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/weekly
 * Get sales for the current week (Sunday to current day)
 * Returns: sales array with reference codes, locations, and total for the week
 */
exports.getWeeklySales = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySales = await Sale.find({
      date: { $gte: startOfWeek }
    })
      .populate('booking', 'bookingNumber bookingReference oasis customerName totalAmount status')
      .populate('reservation', 'room guestName')
      .sort({ date: -1 });

    // Filter to only include confirmed or completed bookings (both represent received revenue)
    const completedSales = weeklySales.filter(sale => {
      if (sale.booking) {
        return sale.booking.status === 'Confirmed' || sale.booking.status === 'Completed';
      }
      return true; // Keep reservation sales
    });

    // Format sales with reference code and location
    const formattedSales = completedSales.map(sale => ({
      _id: sale._id,
      amount: sale.amount,
      date: sale.date,
      bookingNumber: sale.bookingNumber || sale.booking?.bookingNumber || 'N/A',
      referenceCode: sale.bookingReference || sale.booking?.bookingReference || 'N/A',
      location: sale.location || sale.booking?.oasis || 'N/A',
      type: sale.booking ? 'Booking' : 'Reservation',
      booking: sale.booking,
      reservation: sale.reservation,
    }));

    const total = completedSales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: formattedSales, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/monthly?month=0&year=2026
 * Get sales for a specific month
 * Query: month (0-11, where 0=January), year (e.g., 2026)
 * Returns: sales array with reference codes, locations, and total for the month
 */
exports.getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const monthlySales = await Sale.find({
      date: { $gte: startDate, $lt: endDate }
    })
      .populate('booking', 'bookingNumber bookingReference oasis customerName totalAmount status')
      .populate('reservation', 'room guestName')
      .sort({ date: -1 });

    // Filter to only include confirmed or completed bookings (both represent received revenue)
    const completedSales = monthlySales.filter(sale => {
      if (sale.booking) {
        return sale.booking.status === 'Confirmed' || sale.booking.status === 'Completed';
      }
      return true; // Keep reservation sales
    });

    // Format sales with reference code and location
    const formattedSales = completedSales.map(sale => ({
      _id: sale._id,
      amount: sale.amount,
      date: sale.date,
      bookingNumber: sale.bookingNumber || sale.booking?.bookingNumber || 'N/A',
      referenceCode: sale.bookingReference || sale.booking?.bookingReference || 'N/A',
      location: sale.location || sale.booking?.oasis || 'N/A',
      type: sale.booking ? 'Booking' : 'Reservation',
      booking: sale.booking,
      reservation: sale.reservation,
    }));

    const total = completedSales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: formattedSales, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/controllers/salesController.js
// ============================================
// GET SALES BY DATE RANGE
// ============================================

/**
 * GET /api/admin/sales/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get sales for a custom date range
 * Query: startDate, endDate (format: YYYY-MM-DD)
 * Returns: sales array with reference codes, locations, and total for the date range
 */
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('📅 Sales date range request:', { startDate, endDate });
    
    // Parse dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const salesInRange = await Sale.find({
      date: { $gte: start, $lte: end }
    })
      .populate('booking', 'bookingNumber bookingReference oasis customerName totalAmount status')
      .populate('reservation', 'room guestName')
      .sort({ date: -1 });
    
    // Filter to only include confirmed or completed bookings
    const completedSales = salesInRange.filter(sale => {
      if (sale.booking) {
        return sale.booking.status === 'Confirmed' || sale.booking.status === 'Completed';
      }
      return true;
    });
    
    // Format sales with reference code and location
    const formattedSales = completedSales.map(sale => ({
      _id: sale._id,
      amount: sale.amount,
      date: sale.date,
      bookingNumber: sale.bookingNumber || sale.booking?.bookingNumber || 'N/A',
      referenceCode: sale.bookingReference || sale.booking?.bookingReference || 'N/A',
      location: sale.location || sale.booking?.oasis || 'N/A',
      customerName: sale.booking?.customerName || 'N/A',
      type: sale.booking ? 'Booking' : 'Reservation',
      booking: sale.booking,
      reservation: sale.reservation,
    }));
    
    const total = formattedSales.reduce((sum, sale) => sum + sale.amount, 0);
    
    res.json({
      success: true,
      sales: formattedSales,
      total,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/sales
 * Create a new sale record (Admin only)
 * Body: { reservation (ID), amount }
 * Note: Usually created automatically when reservation is confirmed
 */
exports.recordSale = async (req, res) => {
  try {
    const { reservation, amount } = req.body;
    const sale = new Sale({ reservation, amount });
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/sales/:id
 * Delete a sale record (Admin only)
 * ⚠️ WARNING: Automatically deletes the associated booking to maintain data integrity
 * This ensures only accurate sales data remains in the system
 */
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    
    // Also delete the associated booking to keep data in sync
    if (sale.booking) {
      const deletedBooking = await Booking.findByIdAndDelete(sale.booking);
      if (deletedBooking) {
        console.log(`🗑️ Associated booking deleted when sale was removed`);
        console.log(`   Booking Reference: ${deletedBooking.bookingReference}`);
        console.log(`   Customer: ${deletedBooking.customerName}`);
        console.log(`   Amount: ₱${deletedBooking.totalAmount?.toLocaleString() || 'N/A'}`);
      }
    }
    
    res.json({ 
      success: true,
      message: 'Sale and associated booking deleted successfully (data synchronized)',
      deletedSale: sale
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
