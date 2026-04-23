// frontend/src/services/admin/reports.js
// ============================================
// REPORTS API - Report generation endpoints
// ============================================

import { apiClient } from './apiClient';

export const getReservationReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/reservation', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching reservation report:', error);
    throw error;
  }
};

export const getSalesReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/sales', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

export const getInventoryUsageReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/inventory-usage', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching inventory usage report:', error);
    throw error;
  }
};

export const getStaffActivityReport = async () => {
  try {
    const res = await apiClient.get('/reports/staff-activity');
    return res.data;
  } catch (error) {
    console.error('Error fetching staff activity report:', error);
    throw error;
  }
};

export const exportReportAsJSON = async (reportType, startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/export', { params: { reportType, startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};