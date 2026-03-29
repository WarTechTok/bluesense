// backend/controllers/dashboardController.js
// ============================================
// DASHBOARD CONTROLLER - stats, chart data, and staff inspections
// ============================================

const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Staff = require('../models/Staff');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const InspectionRecord = require('../models/InspectionRecord');

/**
 * Dashboard Controller
 * Handles dashboard overview statistics and chart data
 * Provides key metrics for the admin dashboard home page
 */

/**
 * GET /api/admin/dashboard/stats
 * Fetches all key statistics for the dashboard overview
 * Returns: total reservations, available rooms, staff count, monthly revenue, low stock items
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const maintainanceRooms = await Room.countDocuments({ status: 'Maintenance' });
    const activeStaff = await Staff.countDocuments({ status: 'Active' });

    // Calculate monthly revenue (from current month start to now)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyRevenue = await Sale.aggregate([
      {
        $match: {
          date: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get inventory items below their low stock threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantity', '$lowStockAlert'] }
    });

    res.json({
      totalReservations,
      availableRooms,
      maintainanceRooms,
      activeStaff,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      lowStockItems: lowStockItems.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/dashboard/daily-chart
 * Fetches sales data for the last 7 days
 * Used for: Daily sales chart visualization
 */
exports.getDailyChartData = async (req, res) => {
  try {
    // Get date from 7 days ago
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Aggregate sales by date
    const dailySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: last7Days }
        }
      },
      {
        // Group by date (YYYY-MM-DD format)
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 } // Sort chronologically
      }
    ]);

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/dashboard/monthly-chart
 * Fetches sales data for the last 12 months
 * Used for: Monthly sales chart visualization
 */
exports.getMonthlyChartData = async (req, res) => {
  try {
    // Get date from 12 months ago
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);

    // Aggregate sales by month
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: last12Months }
        }
      },
      {
        // Group by month (YYYY-MM format)
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 } // Sort chronologically
      }
    ]);

    res.json(monthlySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/dashboard/staff-inspections
 * Fetches all staff inspection records
 * Query params: staffId, roomId, status, startDate, endDate
 * Auth: Admin Required
 */
exports.getStaffInspections = async (req, res) => {
  try {
    const { staffId, roomId, status, startDate, endDate } = req.query;

    const filter = {};

    // Filter by staff member
    if (staffId) filter.inspectedBy = staffId;

    // Filter by room
    if (roomId) filter.room = roomId;

    // Filter by inspection status (Draft | Submitted | Reviewed | Action-Required)
    if (status) filter.status = status;

    // Filter by date range
    if (startDate || endDate) {
      filter.inspectionDate = {};
      if (startDate) filter.inspectionDate.$gte = new Date(startDate);
      if (endDate)   filter.inspectionDate.$lte = new Date(endDate);
    }

    const inspections = await InspectionRecord.find(filter)
      .populate('inspectedBy', 'name email staffId')
      .populate('room', 'roomNumber type status')
      .sort({ inspectionDate: -1 }); // Most recent first

    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/dashboard/staff-inspections/:inspectionId
 * Fetches a specific staff inspection record detail
 * Auth: Admin Required
 */
exports.getStaffInspectionDetails = async (req, res) => {
  try {
    const inspection = await InspectionRecord.findById(req.params.inspectionId)
      .populate('inspectedBy', 'name email staffId')
      .populate('room', 'roomNumber type status');

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};