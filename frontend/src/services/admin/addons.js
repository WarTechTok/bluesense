// frontend/src/services/admin/addons.js
// ============================================
// ADD-ON MANAGEMENT API - Admin only
// ============================================

import { apiClient } from './apiClient';

// Get all add-ons
export const getAllAddons = async () => {
  try {
    const res = await apiClient.get('/addons');
    return res.data;
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    throw error;
  }
};

// Get active add-ons for frontend
export const getActiveAddons = async () => {
  try {
    const res = await apiClient.get('/addons/active');
    return res.data;
  } catch (error) {
    console.error('Error fetching active add-ons:', error);
    throw error;
  }
};

// Create add-on
export const createAddon = async (addonData) => {
  try {
    const res = await apiClient.post('/addons', addonData);
    return res.data;
  } catch (error) {
    console.error('Error creating add-on:', error);
    throw error;
  }
};

// Update add-on
export const updateAddon = async (id, addonData) => {
  try {
    const res = await apiClient.put(`/addons/${id}`, addonData);
    return res.data;
  } catch (error) {
    console.error('Error updating add-on:', error);
    throw error;
  }
};

// Delete add-on
export const deleteAddon = async (id) => {
  try {
    const res = await apiClient.delete(`/addons/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting add-on:', error);
    throw error;
  }
};