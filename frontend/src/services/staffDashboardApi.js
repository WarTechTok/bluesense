/**
 * Staff Dashboard API Service
 * Handles all API calls for staff dashboard
 * Endpoints: notifications, tasks, statistics
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/staff/dashboard';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// NOTIFICATIONS API
// ============================================

/**
 * Get all notifications
 * Query: limit, skip, type, isRead
 */
export const getNotifications = async (options = {}) => {
  try {
    const { limit = 20, skip = 0, type, isRead } = options;
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('skip', skip);
    if (type) params.append('type', type);
    if (isRead !== undefined) params.append('isRead', isRead);

    const res = await apiClient.get(`/notifications?${params}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await apiClient.put(`/notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const res = await apiClient.put('/notifications/mark-all-read');
    return res.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const res = await apiClient.delete(`/notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ============================================
// TASKS API
// ============================================

/**
 * Get all tasks for staff
 * Query: status, limit, skip
 */
export const getTasks = async (options = {}) => {
  try {
    const { status, limit = 20, skip = 0 } = options;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit);
    params.append('skip', skip);

    const res = await apiClient.get(`/tasks?${params}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get specific task details
 */
export const getTaskDetails = async (taskId) => {
  try {
    const res = await apiClient.get(`/tasks/${taskId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching task details:', error);
    throw error;
  }
};

/**
 * Update task status
 * Body: { status, notes?, actualHours? }
 */
export const updateTaskStatus = async (taskId, updateData) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}/status`, updateData);
    return res.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// ============================================
// DASHBOARD STATS API
// ============================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const res = await apiClient.get('/stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ============================================
// INSPECTIONS API
// ============================================

/**
 * Get all inspections for staff
 */
export const getMyInspections = async (options = {}) => {
  try {
    const { limit = 50, skip = 0 } = options;
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('skip', skip);

    const res = await apiClient.get(`/inspections?${params}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
};

/**
 * Create a new inspection record
 * Body: { roomId, condition, cleaningNeeded, damageFound, damageDescription, itemsNeeded, notes, rating }
 */
export const createInspectionRecord = async (inspectionData) => {
  try {
    const res = await apiClient.post('/inspections', inspectionData);
    return res.data;
  } catch (error) {
    console.error('Error creating inspection record:', error);
    throw error;
  }
};

// ============================================
// ROOMS API
// ============================================

/**
 * Get assigned rooms for staff
 */
export const getAssignedRooms = async () => {
  try {
    const res = await apiClient.get('/assigned-rooms');
    return res.data;
  } catch (error) {
    console.error('Error fetching assigned rooms:', error);
    throw error;
  }
};
