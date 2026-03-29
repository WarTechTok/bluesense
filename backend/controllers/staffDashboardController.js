/**
 * Staff Dashboard Controller
 * Handles all staff dashboard operations: notifications, tasks, assignments
 * Provides real-time data for staff members
 */

const Notification = require('../models/Notification');
const TaskAssignment = require('../models/TaskAssignment');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * GET /api/staff/notifications
 * Fetch all notifications for authenticated staff member
 * Query params: ?limit=20&skip=0&type=&isRead=
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0, isRead, type } = req.query;

    // Get staff record by email
    const staff = await Staff.findOne({ email: req.user.email });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    // Build query filter
    const filter = { userId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;

    // Fetch notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Total count
    const totalCount = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      notifications,
      totalCount,
      unreadCount,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/staff/notifications/unread-count
 * Get count of unread notifications
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/staff/notifications/:notificationId/read
 * Mark a notification as read
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/staff/notifications/mark-all-read
 * Mark all notifications as read
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/staff/notifications/:notificationId
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/staff/tasks
 * Fetch all task assignments for authenticated staff member
 * Query params: ?status=Pending&limit=20&skip=0
 */
exports.getTasks = async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    // Get staff record by email
    const staff = await Staff.findOne({ email: req.user.email });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    // Build filter
    const filter = { staffId: staff._id };
    if (status) filter.status = status;

    // Fetch tasks with room details
    const tasks = await TaskAssignment.find(filter)
      .populate('roomId', 'name capacity status')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Count by status
    const pendingCount = await TaskAssignment.countDocuments({ staffId: staff._id, status: 'Pending' });
    const inProgressCount = await TaskAssignment.countDocuments({ staffId: staff._id, status: 'In Progress' });
    const completedCount = await TaskAssignment.countDocuments({ staffId: staff._id, status: 'Completed' });

    res.json({
      tasks,
      counts: { pendingCount, inProgressCount, completedCount },
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/staff/tasks/:taskId
 * Get specific task details
 */
exports.getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get staff record
    const staff = await Staff.findOne({ email: req.user.email });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    const task = await TaskAssignment.findById(taskId)
      .populate('roomId')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.staffId.toString() !== staff._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/staff/tasks/:taskId/status
 * Update task status
 * Body: { status, notes?, actualHours? }
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes, actualHours } = req.body;

    // Get staff record
    const staff = await Staff.findOne({ email: req.user.email });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    const task = await TaskAssignment.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.staffId.toString() !== staff._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update fields
    task.status = status || task.status;
    if (notes) task.notes = notes;
    if (actualHours) task.actualHours = actualHours;

    // Set timestamps
    if (status === 'In Progress' && !task.startedAt) {
      task.startedAt = new Date();
    }
    if (status === 'Completed' && !task.completedAt) {
      task.completedAt = new Date();
    }

    task.updatedAt = new Date();
    await task.save();

    // Create notification for admin when task is completed
    if (status === 'Completed') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        await Notification.create({
          userId: admin._id,
          staffId: staff._id,
          type: 'Task Update',
          title: 'Task Completed',
          message: `${staff.name} has completed task: "${task.title}"`,
          relatedId: task._id,
          relatedType: 'Task',
          priority: 'High',
          data: { taskId: task._id, roomId: task.roomId }
        });
      }
    }

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/staff/dashboard/stats
 * Get dashboard statistics for staff
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get staff record
    const staff = await Staff.findOne({ email: req.user.email });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    const pendingTasks = await TaskAssignment.countDocuments({ 
      staffId: staff._id, 
      status: 'Pending' 
    });
    const inProgressTasks = await TaskAssignment.countDocuments({ 
      staffId: staff._id, 
      status: 'In Progress' 
    });
    const completedTasks = await TaskAssignment.countDocuments({ 
      staffId: staff._id, 
      status: 'Completed' 
    });
    const unreadNotifications = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    // Get assigned rooms for this staff member
    const assignedRooms = await Room.find({
      'assignedStaff.staffId': staff._id
    }).select('name capacity status');

    res.json({
      staffName: staff.name,
      position: staff.position,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      unreadNotifications,
      totalTasks: pendingTasks + inProgressTasks + completedTasks,
      assignedRoomsCount: assignedRooms.length
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Internal Helper: Create notification for staff
 * Used by admin endpoints to notify staff of assignments
 */
exports.createNotificationForStaff = async (staffId, userId, notification) => {
  try {
    const newNotification = await Notification.create({
      staffId,
      userId,
      ...notification
    });
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
