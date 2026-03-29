/**
 * Staff Dashboard Routes
 * Endpoints for staff members to view notifications, tasks, and manage assignments
 * All routes require authentication and staff role
 */

const express = require('express');
const router = express.Router();
const staffDashboardController = require('../controllers/staffDashboardController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

/**
 * GET /api/staff/dashboard/notifications
 * Fetch all notifications for authenticated staff
 * Query: ?limit=20&skip=0&type=&isRead=
 */
router.get('/notifications', authenticate, authorize('staff'), staffDashboardController.getNotifications);

/**
 * GET /api/staff/dashboard/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/notifications/unread-count', authenticate, authorize('staff'), staffDashboardController.getUnreadCount);

/**
 * PUT /api/staff/dashboard/notifications/:notificationId/read
 * Mark a notification as read
 */
router.put('/notifications/:notificationId/read', authenticate, authorize('staff'), staffDashboardController.markNotificationAsRead);

/**
 * PUT /api/staff/dashboard/notifications/mark-all-read
 * Mark all notifications as read
 */
router.put('/notifications/mark-all-read', authenticate, authorize('staff'), staffDashboardController.markAllNotificationsAsRead);

/**
 * DELETE /api/staff/dashboard/notifications/:notificationId
 * Delete a notification
 */
router.delete('/notifications/:notificationId', authenticate, authorize('staff'), staffDashboardController.deleteNotification);

// ============================================
// TASK ENDPOINTS
// ============================================

/**
 * GET /api/staff/dashboard/tasks
 * Fetch all task assignments for staff
 * Query: ?status=Pending&limit=20&skip=0
 */
router.get('/tasks', authenticate, authorize('staff'), staffDashboardController.getTasks);

/**
 * GET /api/staff/dashboard/tasks/:taskId
 * Get specific task details
 */
router.get('/tasks/:taskId', authenticate, authorize('staff'), staffDashboardController.getTaskDetails);

/**
 * PUT /api/staff/dashboard/tasks/:taskId/status
 * Update task status
 * Body: { status, notes?, actualHours? }
 */
router.put('/tasks/:taskId/status', authenticate, authorize('staff'), staffDashboardController.updateTaskStatus);

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /api/staff/dashboard/stats
 * Get dashboard statistics for staff
 */
router.get('/stats', authenticate, authorize('staff'), staffDashboardController.getDashboardStats);

module.exports = router;
