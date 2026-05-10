// frontend/src/services/admin/apiClient.js
// ============================================
// API CLIENT - Shared axios configuration with auth interceptor
// ============================================

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const ADMIN_API_BASE_URL = `${API_BASE_URL}/api/admin`;
export const BOOKINGS_API_BASE_URL = `${API_BASE_URL}/api`;

const getAuthToken = () => localStorage.getItem('token');

// Main API Client for Admin endpoints
export const apiClient = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Bookings API Client (no /admin prefix)
export const bookingsApiClient = axios.create({
  baseURL: BOOKINGS_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add token
const addTokenInterceptor = (client) => {
  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  });
};

addTokenInterceptor(apiClient);
addTokenInterceptor(bookingsApiClient);

// ─────────────────────────────────────────────────────────────
// Response interceptors
// CRITICAL: must return Promise.reject(error) so that .catch()
// blocks in components actually receive the error. Without this
// the interceptor swallows errors and every API call appears to
// "succeed" even when the server returns 4xx / 5xx.
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
      // Attach the server's message so callers can surface it in the UI
      const serverMsg = error.response.data?.error || error.response.data?.message;
      if (serverMsg) error.message = serverMsg;
    } else if (error.request) {
      console.error('❌ No response from API:', error.message);
      error.message = 'No response from server. Check your connection.';
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error); // ← was missing; this is the fix
  }
);

bookingsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`❌ Bookings API Error [${error.response.status}]:`, error.response.data);
      const serverMsg = error.response.data?.error || error.response.data?.message;
      if (serverMsg) error.message = serverMsg;
    }
    return Promise.reject(error); // ← was missing; this is the fix
  }
);