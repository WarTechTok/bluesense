// frontend/src/services/admin/maintenance.js
// ============================================
// MAINTENANCE API - Maintenance records and expense tracking
// ============================================

import { apiClient } from './apiClient';

export const getAllMaintenance = async (filters = {}) => {
  try {
    const res = await apiClient.get('/maintenance', { params: filters });
    return res.data;
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    throw error;
  }
};

export const getMaintenanceById = async (id) => {
  try {
    const res = await apiClient.get(`/maintenance/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    throw error;
  }
};

export const createMaintenance = async (maintenanceData) => {
  try {
    const res = await apiClient.post('/maintenance', maintenanceData);
    return res.data;
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    throw error;
  }
};

export const updateMaintenance = async (id, maintenanceData) => {
  try {
    const res = await apiClient.put(`/maintenance/${id}`, maintenanceData);
    return res.data;
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    throw error;
  }
};

export const deleteMaintenance = async (id) => {
  try {
    const res = await apiClient.delete(`/maintenance/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    throw error;
  }
};

export const getMaintenanceStats = async (dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const res = await apiClient.get('/maintenance/stats/summary', { params });
    return res.data;
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    throw error;
  }
};

export const getExpenseBreakdown = async (dateFrom = null, dateTo = null) => {
  try {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const res = await apiClient.get('/maintenance/category/breakdown', { params });
    return res.data;
  } catch (error) {
    console.error('Error fetching expense breakdown:', error);
    throw error;
  }
};

export const markMaintenanceComplete = async (id, completedData = {}) => {
  try {
    const res = await apiClient.put(`/maintenance/${id}/mark-complete`, completedData);
    return res.data;
  } catch (error) {
    console.error('Error marking maintenance complete:', error);
    throw error;
  }
};