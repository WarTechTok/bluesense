// frontend/src/services/admin/staff.js
// ============================================
// STAFF API - Staff management endpoints
// ============================================

import { apiClient } from './apiClient';

export const getAllStaff = async () => {
  try {
    const res = await apiClient.get('/staff');
    return res.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

export const createStaffAccount = async (staffData) => {
  try {
    const res = await apiClient.post('/staff', staffData);
    return res.data;
  } catch (error) {
    console.error('Error creating staff account:', error);
    throw error;
  }
};

export const updateStaff = async (id, staffData) => {
  try {
    const res = await apiClient.put(`/staff/${id}`, staffData);
    return res.data;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

export const disableStaffAccount = async (id) => {
  try {
    const res = await apiClient.put(`/staff/${id}/disable`);
    return res.data;
  } catch (error) {
    console.error('Error disabling staff account:', error);
    throw error;
  }
};

export const activateStaffAccount = async (id) => {
  try {
    const res = await apiClient.put(`/staff/${id}/activate`);
    return res.data;
  } catch (error) {
    console.error('Error activating staff account:', error);
    throw error;
  }
};

export const resetPassword = async (id, newPassword) => {
  try {
    const res = await apiClient.put(`/staff/${id}/reset-password`, { newPassword });
    return res.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const deleteStaff = async (id) => {
  try {
    const res = await apiClient.delete(`/staff/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

export const debugVerifyAdminToken = async () => {
  try {
    const res = await apiClient.get('/staff/debug/verify-token');
    return res.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};