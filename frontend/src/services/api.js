// src/services/api.js
// ============================================
// NETWORK CONFIG - CHANGE THIS WHEN YOU MOVE!
// ============================================

// OPTION 1: Home WiFi
//const API_BASE_URL = "http://192.168.100.224:8080";

//const API_BASE_URL = "http://192.168.100.236:8080";

// Pauig
//const API_BASE_URL= "http://192.168.81.219:8080";

// OPTION 2: Redmi Hotspot (current)
//const API_BASE_URL = "http://10.122.57.40:8080";

// OPTION 3: School WiFi
// const API_BASE_URL = "http://[SCHOOL-IP-HERE]:8080";

// OPTION 4: Laptop (LOCAL - for testing)
const API_BASE_URL = "http://localhost:8080";

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
// BOOKING API CALLS
// ============================================

// Create a new booking (customer submits reservation)
export async function createBooking(bookingData) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add token if available (optional for public booking)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bookingData),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Booking failed');
  }
  
  return data;
}

// Get all bookings (staff/admin only)
export async function getAllBookings() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Get single booking by ID
export async function getBookingById(id) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`);
  return res.json();
}

// Update booking status (staff/admin only)
export async function updateBookingStatus(id, status, confirmedBy) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status, confirmedBy }),
  });
  return res.json();
}

// Update payment status (staff/admin only)
export async function updatePaymentStatus(id, paymentStatus) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentStatus }),
  });
  return res.json();
}

// Delete booking (staff/admin only)
export async function deleteBooking(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}