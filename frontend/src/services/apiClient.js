// src/services/apiClient.js
// ============================================
// CENTRALIZED API CLIENT - Ensures all requests go to correct backend
// ============================================

const API_BASE_URL = "http://localhost:8080";

/**
 * Centralized fetch wrapper for all API calls
 * @param {string} endpoint - API endpoint (e.g., '/api/bookings')
 * @param {object} options - fetch options (method, body, headers, etc)
 * @returns {Promise} JSON response
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Ensure endpoint starts with /
  const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  console.log(`📡 API Call: ${config.method || 'GET'} ${finalUrl}`);
  
  try {
    const response = await fetch(finalUrl, config);
    
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error('❌ Failed to parse JSON response:', err);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error on ${finalUrl}:`, error.message);
    throw error;
  }
}

export default apiCall;
