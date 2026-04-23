// frontend/src/services/admin/rooms.js
// ============================================
// ROOMS API - Room management endpoints
// ============================================

import { apiClient } from './apiClient';

export const getAllRooms = async () => {
  try {
    const res = await apiClient.get('/rooms');
    return res.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const getRoomById = async (id) => {
  try {
    const res = await apiClient.get(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};

export const createRoom = async (roomData) => {
  try {
    const res = await apiClient.post('/rooms', roomData);
    return res.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const res = await apiClient.put(`/rooms/${id}`, roomData);
    return res.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    const res = await apiClient.delete(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

export const uploadRoomImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await apiClient.post('/rooms/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading room image:', error);
    throw error;
  }
};

export const assignStaffToRoom = async (id, staffData) => {
  try {
    const res = await apiClient.put(`/rooms/${id}/assign-staff`, staffData);
    return res.data;
  } catch (error) {
    console.error('Error assigning staff to room:', error);
    throw error;
  }
};

export const removeStaffFromRoom = async (id, staffId) => {
  try {
    const res = await apiClient.delete(`/rooms/${id}/remove-staff/${staffId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing staff from room:', error);
    throw error;
  }
};

export const getRoomStaff = async (id) => {
  try {
    const res = await apiClient.get(`/rooms/${id}/staff`);
    return res.data;
  } catch (error) {
    console.error('Error fetching room staff:', error);
    throw error;
  }
};