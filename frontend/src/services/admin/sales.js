// frontend/src/services/admin/sales.js
// ============================================
// SALES API - Sales tracking and revenue endpoints
// ============================================

import { apiClient } from './apiClient';

export const getAllSales = async () => {
  try {
    const res = await apiClient.get('/sales');
    return res.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

export const getDailySales = async (date) => {
  try {
    const res = await apiClient.get('/sales/daily', { params: { date } });
    return res.data;
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    throw error;
  }
};

export const getWeeklySales = async () => {
  try {
    const res = await apiClient.get('/sales/weekly');
    return res.data;
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    throw error;
  }
};

export const getMonthlySales = async (month, year) => {
  try {
    const res = await apiClient.get('/sales/monthly', { params: { month, year } });
    return res.data;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }
};

export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/sales/date-range', { 
      params: { startDate, endDate } 
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    throw error;
  }
};