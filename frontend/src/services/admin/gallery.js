// frontend/src/services/admin/gallery.js
// ============================================
// GALLERY API - Admin + Public
// ============================================

import { apiClient } from './apiClient';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ── Public ──────────────────────────────────

// Fetch active gallery images (no auth required)
export const getGalleryImages = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/gallery`);
  return res.data.images || res.data;
};

// ── Admin ────────────────────────────────────

// Fetch ALL images including inactive
export const getAllGalleryImagesAdmin = async () => {
  // Use the same public endpoint (or add /admin to backend)
  const res = await apiClient.get('/gallery');
  return res.data.images || res.data;
};

// Upload a new gallery image
export const uploadGalleryImage = async (imageFile, title, description = '') => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('title', title);
  formData.append('description', description);

  const res = await fetch(`${API_BASE_URL}/api/gallery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload failed');
  }

  const data = await res.json();
  return data.image;
};

// Update title, description, or isActive
export const updateGalleryImage = async (id, updates) => {
  const res = await apiClient.put(`/gallery/${id}`, updates);
  return res.data.image;
};

// Reorder — send array of ids in desired order
export const reorderGalleryImages = async (orderedIds) => {
  const res = await apiClient.put('/gallery/reorder', { orderedIds });
  return res.data.images;
};

// Delete image
export const deleteGalleryImage = async (id) => {
  const res = await apiClient.delete(`/gallery/${id}`);
  return res.data;
};