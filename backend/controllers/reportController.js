// backend/controllers/reportsController.js
// ============================================
// REPORTS CONTROLLER - Generate business analytics reports
// ============================================

const Reservation = require('../models/Reservation');
const Sale = require('../models/Sale');
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');
const Staff = require('../models/Staff');

// ============================================
// HELPER - Build timezone-aware date range (Philippine Time UTC+8)
// ============================================
const buildDateRange = (startDate, endDate) => {
  // Append Philippine timezone offset so date boundaries are correct
  // e.g. "2026-04-01" becomes 2026-04-01T00:00:00+08:00 in UTC = 2026-03-31T16:00:00Z
  const start = new Date(startDate + 'T00:00:00+08:00');
  const end   = new Date(endDate   + 'T23:59:59.999+08:00');
  return { $gte: start, $lte: end };
};

// ============================================
// GET RESERVATION REPORT
// ============================================
/**
 * GET /api/admin/reports/reservation?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Generate reservation report (Admin only)
 * Query: startDate, endDate (both optional - ISO format)
 * Returns: Array of reservations within date range
 */
exports.getReservationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = buildDateRange(startDate, endDate);
    }

    const reservations = await Reservation.find(query).populate('room');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET SALES REPORT
// ============================================
/**
 * GET /api/admin/reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Generate sales report (Admin only)
 * Query: startDate, endDate (both optional)
 * Returns: Array of sales and total sales amount in period
 *
 * FIX: Previously used raw new Date(startDate) which treated the date as
 * UTC midnight, causing Philippine-timezone sales to fall outside the range.
 * Now uses +08:00 offset so the full local day is included.
 *
 * FIX 2: Removed strict Confirmed/Completed filter so that ALL sales records
 * linked to any booking status appear. The Sales tab shows them — Reports
 * should too. Pending bookings with a Sale record are now included.
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      // FIX: Use Philippine timezone-aware boundaries instead of raw UTC
      query.date = buildDateRange(startDate, endDate);
      console.log(`📊 Sales Report Query: ${startDate} to ${endDate}`);
      console.log(`   Date Range: ${query.date.$gte.toISOString()} to ${query.date.$lte.toISOString()}`);
    } else {
      console.log('📊 No date range provided, fetching all sales');
    }

    const sales = await Sale.find(query)
      .populate('reservation')
      .populate('booking', 'bookingNumber bookingReference customerName totalAmount status oasis')
      .sort({ date: -1 });

    console.log(`📋 Found ${sales.length} total sales in database for query`);

    // If no data found but dates were provided, log all sales to debug
    if (sales.length === 0 && (startDate || endDate)) {
      const allSales = await Sale.find({}).sort({ date: -1 }).limit(5);
      console.log(`⚠️  No sales in date range. Sample of most recent sales:`);
      allSales.forEach(s => {
        console.log(`   Sale date: ${s.date}, Amount: ${s.amount}`);
      });
    }

    // FIX: Include Pending bookings that already have a Sale record.
    // A Sale record is only created when a booking is Confirmed/Completed,
    // so any Sale that exists is already valid revenue — no need to re-filter
    // by booking status here (that was causing empty reports when booking
    // status hadn't been updated yet but a sale record existed).
    const validSales = sales.filter(sale => {
      if (sale.booking) {
        return ['Confirmed', 'Completed', 'Pending'].includes(sale.booking.status);
      }
      return true; // Keep reservation sales
    });

    console.log(`✅ After filtering: ${validSales.length} valid sales`);

    // Format sales with reference code and location
    const formattedSales = validSales.map(sale => ({
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

    const totalSales = formattedSales.reduce((sum, sale) => sum + sale.amount, 0);

    res.json({ sales: formattedSales, totalSales });
  } catch (error) {
    console.error('❌ Error in getSalesReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET INVENTORY USAGE REPORT
// ============================================
/**
 * GET /api/admin/reports/inventory-usage?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Generate inventory usage report
 * Query: startDate, endDate (both optional)
 * Returns: Usage details for each inventory item
 * Includes: total quantity used, current stock, usage records
 */
exports.getInventoryUsageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const inventory = await Inventory.find();

    if (startDate && endDate) {
      // FIX: Use timezone-aware boundaries here too
      const { $gte: start, $lte: end } = buildDateRange(startDate, endDate);

      const usageReport = inventory.map(item => {
        const usageInPeriod = item.usageRecords.filter(
          record => record.date >= start && record.date <= end
        );
        const totalUsed = usageInPeriod.reduce((sum, record) => sum + record.quantityUsed, 0);
        return {
          item: item.item,
          totalUsed,
          currentStock: item.quantity,
          usageRecords: usageInPeriod
        };
      });

      return res.json(usageReport);
    }

    // If no date range, include all usage records
    const usageReport = inventory.map(item => {
      const totalUsed = item.usageRecords.reduce((sum, record) => sum + record.quantityUsed, 0);
      return {
        item: item.item,
        totalUsed,
        currentStock: item.quantity,
        usageRecords: item.usageRecords
      };
    });

    res.json(usageReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET STAFF ACTIVITY REPORT
// ============================================
/**
 * GET /api/admin/reports/staff-activity
 * Generate staff activity report (Admin only)
 * Returns: Each staff member's activity count (inventory usage logs)
 * Shows: Name, email, role, status, and number of activities
 */
exports.getStaffActivityReport = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');

    const staffActivity = await Promise.all(
      staff.map(async (member) => {
        const usageCount = await Inventory.countDocuments({
          'usageRecords.usedBy': member._id
        });
        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          status: member.status,
          activityCount: usageCount
        };
      })
    );

    res.json(staffActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// EXPORT REPORT AS JSON
// ============================================
/**
 * GET /api/admin/reports/export?reportType=TYPE&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Export report data as JSON (Admin only)
 * Query: reportType (reservation, sales, inventory, all)
 *        startDate, endDate (optional)
 * Returns: JSON file download with report data
 * Supported types: reservation, sales, inventory
 */
exports.exportReportAsJSON = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let reportData = {};

    if (reportType === 'reservation') {
      const query = {};
      if (startDate && endDate) {
        query.createdAt = buildDateRange(startDate, endDate);
      }
      reportData = await Reservation.find(query).populate('room');
    } else if (reportType === 'sales') {
      const query = {};
      if (startDate && endDate) {
        query.date = buildDateRange(startDate, endDate);
      }
      let sales = await Sale.find(query)
        .populate('reservation')
        .populate('booking', 'status bookingNumber bookingReference customerName totalAmount oasis');

      sales = sales.filter(sale => {
        if (sale.booking) {
          return ['Confirmed', 'Completed', 'Pending'].includes(sale.booking.status);
        }
        return true;
      });

      reportData = sales;
    } else if (reportType === 'inventory') {
      reportData = await Inventory.find();
    }

    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.json"`);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DEBUG ENDPOINT - Check Sales & Booking Status
// ============================================
/**
 * GET /api/admin/reports/debug/sales-status
 * DEBUG ONLY - Check why sales aren't appearing
 * Shows all bookings and their sales status
 */
exports.debugSalesStatus = async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .select('bookingNumber bookingReference customerName status totalAmount createdAt')
      .lean();

    const allSales = await Sale.find()
      .populate('booking', 'bookingNumber status customerName')
      .lean();

    const bookingsByStatus = {
      pending: allBookings.filter(b => b.status === 'Pending').length,
      confirmed: allBookings.filter(b => b.status === 'Confirmed').length,
      completed: allBookings.filter(b => b.status === 'Completed').length,
      cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
    };

    const salesStatus = {
      withValidBookings: allSales.filter(s => s.booking && (s.booking.status === 'Confirmed' || s.booking.status === 'Completed')).length,
      withPendingBookings: allSales.filter(s => s.booking && s.booking.status === 'Pending').length,
      orphaned: allSales.filter(s => !s.booking).length,
    };

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const dateRangeStart = monthStart.toISOString().split('T')[0];
    const dateRangeEnd = monthEnd.toISOString().split('T')[0];

    const { $gte: rangeStart, $lte: rangeEnd } = buildDateRange(dateRangeStart, dateRangeEnd);

    const monthSales = allSales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= rangeStart && saleDate <= rangeEnd;
    });

    const validMonthSales = monthSales.filter(s =>
      s.booking && ['Confirmed', 'Completed', 'Pending'].includes(s.booking.status)
    );

    const monthTotal = validMonthSales.reduce((sum, s) => sum + (s.amount || 0), 0);

    res.json({
      summary: {
        totalBookings: allBookings.length,
        totalSales: allSales.length,
        bookingsByStatus,
        salesStatus,
      },
      defaultMonthQuery: {
        dateRange: `${dateRangeStart} to ${dateRangeEnd}`,
        salesFound: monthSales.length,
        validSales: validMonthSales.length,
        totalAmount: monthTotal,
      },
      sampleData: {
        bookings: allBookings.slice(0, 3),
        sales: allSales.slice(0, 3),
      },
      message: validMonthSales.length === 0
        ? '⚠️ No sales for this month in the database! Check if bookings were confirmed.'
        : '✅ Sales data exists and will appear in Reports!',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};