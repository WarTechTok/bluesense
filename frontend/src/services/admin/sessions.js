// frontend/src/services/admin/sessions.js
// ============================================
// SESSION MANAGEMENT API - Admin only
// ============================================

import { apiClient } from './apiClient';

// Get all sessions
export const getAllSessions = async () => {
  try {
    const res = await apiClient.get('/sessions');
    return res.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get session by ID
export const getSessionById = async (id) => {
  try {
    const res = await apiClient.get(`/sessions/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

// Create session
export const createSession = async (sessionData) => {
  try {
    const res = await apiClient.post('/sessions', sessionData);
    return res.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Update session
export const updateSession = async (id, sessionData) => {
  try {
    const res = await apiClient.put(`/sessions/${id}`, sessionData);
    return res.data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

// Delete session
export const deleteSession = async (id) => {
  try {
    const res = await apiClient.delete(`/sessions/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};