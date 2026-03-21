const Sale = require('../models/Sale');

/**
 * Sales Controller
 * Handles revenue tracking and sales reporting
 * Provides daily, weekly, and monthly sales data for financial overview
 */

/**
 * GET /api/admin/sales
 * Get all sales transactions (Admin only)
 * Includes reservation details
 */
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('reservation');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/daily?date=YYYY-MM-DD
 * Get sales for a specific day
 * Query: date (format: YYYY-MM-DD)
 * Returns: sales array and total for the day
 */
exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day

    const dailySales = await Sale.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate('reservation');

    const total = dailySales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: dailySales, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/weekly
 * Get sales for the current week (Sunday to current day)
 * Returns: sales array and total for the week
 */
exports.getWeeklySales = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySales = await Sale.find({
      date: { $gte: startOfWeek }
    }).populate('reservation');

    const total = weeklySales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: weeklySales, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/sales/monthly?month=0&year=2026
 * Get sales for a specific month
 * Query: month (0-11), year (e.g., 2026)
 * Returns: sales array and total for the month
 */
exports.getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const monthlySales = await Sale.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate('reservation');

    const total = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);
    res.json({ sales: monthlySales, total });
  } catch (error) {
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
 * Warning: Use with caution as this affects financial records
 */
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
