// frontend/src/services/admin/packages.js
// ============================================
// PACKAGE MANAGEMENT API - Admin only
// ============================================

import { apiClient } from './apiClient';

// Get all packages
export const getAllPackages = async () => {
  try {
    const res = await apiClient.get('/packages');
    return res.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

// Get packages by oasis
export const getPackagesByOasis = async (oasis) => {
  try {
    const res = await apiClient.get(`/packages/oasis/${oasis}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching packages by oasis:', error);
    throw error;
  }
};

// Get single package
export const getPackageById = async (id) => {
  try {
    const res = await apiClient.get(`/packages/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching package:', error);
    throw error;
  }
};

// Create package
export const createPackage = async (packageData) => {
  try {
    const res = await apiClient.post('/packages', packageData);
    return res.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

// Update package
export const updatePackage = async (id, packageData) => {
  try {
    const res = await apiClient.put(`/packages/${id}`, packageData);
    return res.data;
  } catch (error) {
    console.error('Error updating package:', error);
    throw error;
  }
};

// Delete package
export const deletePackage = async (id) => {
  try {
    const res = await apiClient.delete(`/packages/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting package:', error);
    throw error;
  }
};