// frontend/src/services/admin/inventory.js
// ============================================
// INVENTORY API - Inventory management endpoints
// ============================================

import { apiClient } from './apiClient';

export const getAllInventory = async () => {
  try {
    const res = await apiClient.get('/inventory');
    return res.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const createInventoryItem = async (itemData) => {
  try {
    const res = await apiClient.post('/inventory', itemData);
    return res.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryQuantity = async (id, quantity) => {
  try {
    const res = await apiClient.put(`/inventory/${id}`, { quantity });
    return res.data;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

export const recordInventoryUsage = async (id, usageData) => {
  try {
    const res = await apiClient.put(`/inventory/${id}/usage`, usageData);
    return res.data;
  } catch (error) {
    console.error('Error recording inventory usage:', error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const res = await apiClient.get('/inventory/alerts/low-stock');
    return res.data;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const res = await apiClient.delete(`/inventory/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};