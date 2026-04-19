// backend/controllers/maintenanceController.js
// ============================================
// MAINTENANCE CONTROLLER
// ============================================
// Handles CRUD operations for maintenance records and expense tracking

const Maintenance = require('../models/Maintenance');
const Room = require('../models/Room');
const Staff = require('../models/Staff');

/**
 * GET /api/admin/maintenance
 * Fetch all maintenance records with optional filters
 * Query params: status, priority, category, room, dateFrom, dateTo
 * Auth: Admin required
 */
exports.getAllMaintenance = async (req, res) => {
  try {
    const { status, priority, category, room, dateFrom, dateTo } = req.query;

    console.log('🔍 Fetching maintenance records - Filter:', { status, priority, category, room });

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (room) filter.room = room;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.reportedDate = {};
      if (dateFrom) filter.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedDate.$lte = new Date(dateTo);
    }

    const maintenance = await Maintenance.find(filter)
      .populate('room', 'name roomNumber')
      .populate('reportedBy', 'name email staffId')
      .populate('assignedTo', 'name email staffId')
      .sort({ reportedDate: -1 });

    console.log('✅ Found', maintenance.length, 'maintenance records');
    res.json(maintenance);
  } catch (error) {
    console.error('❌ Error fetching maintenance records:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/maintenance/:id
 * Fetch a single maintenance record by ID
 * Auth: Admin required
 */
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('room', 'name roomNumber')
      .populate('reportedBy', 'name email staffId')
      .populate('assignedTo', 'name email staffId')
      .populate('approvedBy', 'name email staffId');

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/maintenance
 * Create a new maintenance record
 * Body: { title, description, category, amount, priority, etc. }
 * Auth: Admin required
 */
exports.createMaintenance = async (req, res) => {
  try {
    const {
      title,
      description,
      room,
      amount,
      currency,
      category,
      vendor,
      invoiceNumber,
      priority,
      scheduledDate,
      dueDate,
      reportedBy,
      assignedTo,
      partsNeeded,
      inventoryUsed,
      laborHours,
      notes,
      isRecurring,
      recurringFrequency
    } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Generate maintenance ID
    const lastMaintenance = await Maintenance.findOne().sort({ createdAt: -1 });
    const lastSequence = lastMaintenance
      ? parseInt(lastMaintenance.maintenanceId.slice(4))
      : 0;
    const newSequence = lastSequence + 1;
    const maintenanceId = `MNT-${String(newSequence).padStart(4, '0')}`;

    const maintenance = new Maintenance({
      maintenanceId,
      title: title.trim(),
      description: description || '',
      room: room || null,
      amount,
      currency: currency || 'PHP',
      category: category || 'General',
      vendor: vendor || null,
      invoiceNumber: invoiceNumber || null,
      priority: priority || 'Medium',
      scheduledDate: scheduledDate || null,
      dueDate: dueDate || null,
      reportedBy: reportedBy || null,
      assignedTo: assignedTo || null,
      partsNeeded: partsNeeded || [],
      inventoryUsed: inventoryUsed || [],
      laborHours: laborHours || 0,
      notes: notes || '',
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || 'As-Needed'
    });

    await maintenance.save();

    // Update room status if applicable
    if (room) {
      await Room.findByIdAndUpdate(room, { status: 'Maintenance' });
    }

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/maintenance/:id
 * Update a maintenance record
 * Auth: Admin required
 */
exports.updateMaintenance = async (req, res) => {
  try {
    const {
      title,
      description,
      room,
      amount,
      category,
      vendor,
      invoiceNumber,
      status,
      priority,
      scheduledDate,
      completedDate,
      dueDate,
      assignedTo,
      approvedBy,
      paymentStatus,
      paymentDate,
      receiptNumber,
      notes,
      laborHours,
      nextMaintenanceDate
    } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    // Update fields
    if (title !== undefined) maintenance.title = title;
    if (description !== undefined) maintenance.description = description;
    if (room !== undefined) maintenance.room = room;
    if (amount !== undefined) maintenance.amount = amount;
    if (category !== undefined) maintenance.category = category;
    if (vendor !== undefined) maintenance.vendor = vendor;
    if (invoiceNumber !== undefined) maintenance.invoiceNumber = invoiceNumber;
    if (status !== undefined) maintenance.status = status;
    if (priority !== undefined) maintenance.priority = priority;
    if (scheduledDate !== undefined) maintenance.scheduledDate = scheduledDate;
    if (completedDate !== undefined) maintenance.completedDate = completedDate;
    if (dueDate !== undefined) maintenance.dueDate = dueDate;
    if (assignedTo !== undefined) maintenance.assignedTo = assignedTo;
    if (approvedBy !== undefined) maintenance.approvedBy = approvedBy;
    if (paymentStatus !== undefined) maintenance.paymentStatus = paymentStatus;
    if (paymentDate !== undefined) maintenance.paymentDate = paymentDate;
    if (receiptNumber !== undefined) maintenance.receiptNumber = receiptNumber;
    if (notes !== undefined) maintenance.notes = notes;
    if (laborHours !== undefined) maintenance.laborHours = laborHours;
    if (nextMaintenanceDate !== undefined)
      maintenance.nextMaintenanceDate = nextMaintenanceDate;

    await maintenance.save();

    res.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/maintenance/:id
 * Delete a maintenance record
 * Auth: Admin required
 */
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/maintenance/stats/summary
 * Get maintenance expense summary statistics
 * Returns: total expenses, by category, by status, etc.
 * Auth: Admin required
 */
exports.getMaintenanceStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filter = {};
    if (dateFrom || dateTo) {
      filter.reportedDate = {};
      if (dateFrom) filter.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedDate.$lte = new Date(dateTo);
    }

    // Total expenses
    const totalExpenses = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Expenses by category
    const byCategory = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Expenses by status
    const byStatus = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly expenses
    const monthlyExpenses = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$reportedDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Pending payments
    const pendingPayments = await Maintenance.aggregate([
      { $match: { ...filter, paymentStatus: 'Pending' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      byCategory,
      byStatus,
      monthlyExpenses,
      pendingPayments: pendingPayments[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/maintenance/:id/mark-complete
 * Mark maintenance as completed
 * Auth: Admin required
 */
exports.markMaintenanceComplete = async (req, res) => {
  try {
    const { completedDate, notes } = req.body;

    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        completedDate: completedDate || new Date(),
        notes: notes || maintenance.notes,
        lastMaintenanceDate: new Date()
      },
      { new: true }
    );

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    // If room was in maintenance, update it back to available
    if (maintenance.room) {
      await Room.findByIdAndUpdate(maintenance.room, { status: 'Available' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error('Error marking maintenance complete:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/admin/maintenance/category/breakdown
 * Get expense breakdown by category
 * Auth: Admin required
 */
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filter = {};
    if (dateFrom || dateTo) {
      filter.reportedDate = {};
      if (dateFrom) filter.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedDate.$lte = new Date(dateTo);
    }

    const breakdown = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching expense breakdown:', error);
    res.status(500).json({ error: error.message });
  }
};
