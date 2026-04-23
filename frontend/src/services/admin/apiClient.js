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

// Response interceptor for error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from API:', error.message);
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

bookingsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`❌ Bookings API Error [${error.response.status}]:`, error.response.data);
    }
    return Promise.reject(error);
  }
);