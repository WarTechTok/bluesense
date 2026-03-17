// src/services/api.js
// ============================================
// NETWORK CONFIG - CHANGE THIS WHEN YOU MOVE!
// ============================================

// OPTION 1: Home WiFi
const API_BASE_URL = "http://192.168.100.224:8080";

// OPTION 2: Redmi Hotspot (current)
//const API_BASE_URL = "http://10.122.57.40:8080";

// OPTION 3: School WiFi
// const API_BASE_URL = "http://[SCHOOL-IP-HERE]:8080";

// OPTION 4: Laptop
// const API_BASE_URL = "http://192.168.100.152:8080";

// ============================================
// AUTHENTICATION API CALLS
// ============================================

// Login user
export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Register user
export async function register(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return res.json();
}

// Forgot password
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// Reset password
export async function resetPassword(token, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
  return res.json();
}

// ============================================
// PROFILE API CALLS (Require Token)
// ============================================

// Get user profile
export async function getProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Update profile with avatar
export async function updateProfile(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // DON'T set Content-Type - FormData sets it automatically
    },
    body: formData
  });
  return res.json();
}

// ============================================
// SENSOR DATA API CALLS
// ============================================

export async function getLatestReading() {
  const res = await fetch(`${API_BASE_URL}/api/readings/latest`);
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE_URL}/api/readings/history`);
  return res.json();
}

// ============================================
// BOOKING API CALLS (Will add later)
// ============================================
// export async function createBooking(bookingData) { ... }
// export async function getBookings() { ... }