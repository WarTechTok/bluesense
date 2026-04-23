// frontend/src/services/admin/dashboard.js
// ============================================
// DASHBOARD API - Dashboard statistics and chart data
// ============================================

import { apiClient } from './apiClient';

export const getDashboardStats = async () => {
  try {
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getDailyChartData = async () => {
  try {
    const res = await apiClient.get('/dashboard/daily-chart');
    return res.data;
  } catch (error) {
    console.error('Error fetching daily chart data:', error);
    throw error;
  }
};

export const getMonthlyChartData = async () => {
  try {
    const res = await apiClient.get('/dashboard/monthly-chart');
    return res.data;
  } catch (error) {
    console.error('Error fetching monthly chart data:', error);
    throw error;
  }
};