// src/services/api.js
// ============================================
// NETWORK CONFIG - Uses environment variable
// ============================================

// Get API URL from environment variable (set in .env file or Vercel/Render dashboard)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Log which URL is being used (helps with debugging)
console.log(`🔗 API Base URL: ${API_BASE_URL}`);

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

// Staff login - for staff members managed in Staff Management system
export async function staffLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/staff-login`, {
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
  
  const isFormData = bookingData instanceof FormData;
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers,
    body: isFormData ? bookingData : JSON.stringify(bookingData),
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

// ============================================
// DASHBOARD API CALLS (Admin/Staff)
// ============================================

// Get dashboard statistics
export async function getDashboardStats() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Get recent bookings for dashboard
export async function getRecentBookings(limit = 10) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/recent-bookings?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// ============================================
// ROOM MANAGEMENT API CALLS
// ============================================

export async function getRooms() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

export async function createRoom(roomData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(roomData),
  });
  return res.json();
}

export async function updateRoom(id, roomData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(roomData),
  });
  return res.json();
}

export async function deleteRoom(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}