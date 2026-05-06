// frontend/src/services/admin/tasks.js
// ============================================
// TASKS API - Task assignment endpoints
// ============================================

import { apiClient } from './apiClient';

export const createTaskAssignment = async (taskData) => {
  try {
    const res = await apiClient.post('/tasks/assign', taskData);
    return res.data;
  } catch (error) {
    console.error('Error creating task assignment:', error);
    throw error;
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const res = await apiClient.post('/notifications/send', notificationData);
    return res.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const getTasksByStaff = async (staffId) => {
  try {
    const res = await apiClient.get(`/tasks/staff/${staffId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const res = await apiClient.put(`/tasks/${taskId}`, { status });
    return res.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
