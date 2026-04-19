// backend/controllers/reportsController.js
// ============================================
// REPORTS CONTROLLER - Generate business analytics reports
// ============================================

const Reservation = require('../models/Reservation');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Staff = require('../models/Staff');

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

    // If date range provided, filter by creation date
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
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
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    // If date range provided, filter by creation date (when booking was submitted)
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const sales = await Sale.find(query)
      .populate('reservation')
      .populate('booking', 'bookingNumber bookingReference customerName totalAmount')
      .sort({ date: -1 });
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);

    res.json({ sales, totalSales });
  } catch (error) {
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

    // Filter usage records by date if range provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const usageReport = inventory.map(item => {
        // Filter usage records within date range
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
    
    // For each staff member, count how many inventory usage records they have
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
          activityCount: usageCount // Number of inventory usages logged
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

    // Generate data based on report type
    if (reportType === 'reservation') {
      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      reportData = await Reservation.find(query).populate('room');
    } else if (reportType === 'sales') {
      const query = {};
      if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      reportData = await Sale.find(query).populate('reservation').populate('booking');
    } else if (reportType === 'inventory') {
      reportData = await Inventory.find();
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.json"`);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};