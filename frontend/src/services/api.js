// src/services/api.js
// ============================================
// NETWORK CONFIG - CHANGE THIS WHEN YOU MOVE!
// ============================================

// OPTION 1: Home WiFi
const API_BASE_URL = "http://192.168.100.170:8080";

//const API_BASE_URL = "http://192.168.100.236:8080";

// Pauig
//const API_BASE_URL= "http://192.168.81.219:8080";

// OPTION 2: Redmi Hotspot (current)
//const API_BASE_URL = "http://10.122.57.40:8080";

// OPTION 3: School WiFi
// const API_BASE_URL = "http://[SCHOOL-IP-HERE]:8080";

// OPTION 4: Laptop (LOCAL - for testing)
//const API_BASE_URL = "http://localhost:8080";

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
      // DON'T set Content-Type - FormData sets it automatically
    },
    body: formData
  });
  return res.json();
}

// ============================================
// SENSOR DATA API CALLS (with oasis filtering)
// ============================================

export async function getLatestReading(oasis) {
  const url = oasis 
    ? `${API_BASE_URL}/api/readings/latest?oasis=${oasis}`
    : `${API_BASE_URL}/api/readings/latest`;
  const res = await fetch(url);
  return res.json();
}

export async function getHistory(oasis) {
  const url = oasis 
    ? `${API_BASE_URL}/api/readings/history?oasis=${oasis}`
    : `${API_BASE_URL}/api/readings/history`;
  const res = await fetch(url);
  return res.json();
}

// ============================================
// ESP32 CONTROL API CALLS
// ============================================

// Set which oasis the ESP32 should monitor
export async function setCurrentOasis(oasis) {
  const res = await fetch(`${API_BASE_URL}/api/readings/set-oasis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oasis }),
  });
  return res.json();
}

// Get current oasis the ESP32 is monitoring
export async function getCurrentOasis() {
  const res = await fetch(`${API_BASE_URL}/api/readings/current-oasis`);
  return res.json();
}

// ============================================
// BOOKING API CALLS
// ============================================

// Create a new booking (customer submits reservation)
export async function createBooking(bookingData) {
  const token = localStorage.getItem('token');
  
  // Check if bookingData is FormData (includes file upload)
  const isFormData = bookingData instanceof FormData;
  
  const headers = {};
  
  // Only set Content-Type for JSON, FormData sets its own headers
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add token if available (optional for public booking)
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
// CANCELLATION & REFUND API CALLS
// ============================================

// Cancel booking (customer)
export async function cancelBooking(id, reason, isEmergency, proofFile) {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('reason', reason);
  formData.append('isEmergency', isEmergency ? 'true' : 'false');
  if (proofFile) {
    formData.append('proof', proofFile);
  }
  
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Cancellation failed');
  }
  
  return data;
}

// Get refund requests (admin only)
export async function getRefundRequests() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/refund-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Update refund status (admin only)
export async function updateRefundStatus(id, refundStatus, adminNotes) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/refund-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ refundStatus, adminNotes }),
  });
  return res.json();
}

// ============================================
// STAFF MANAGEMENT API CALLS (Admin only)
// ============================================

// Get all staff members
export async function getAllStaff() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Create staff account
export async function createStaff(staffData) {
  const token = localStorage.getItem('token');
  const isFormData = staffData instanceof FormData;
  
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
    method: 'POST',
    headers,
    body: isFormData ? staffData : JSON.stringify(staffData),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create staff');
  }
  
  return data;
}

// Update staff member
export async function updateStaff(id, staffData) {
  const token = localStorage.getItem('token');
  const isFormData = staffData instanceof FormData;
  
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? staffData : JSON.stringify(staffData),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update staff');
  }
  
  return data;
}

// Disable staff account
export async function disableStaff(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}/disable`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Activate staff account
export async function activateStaff(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}/activate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

// Reset staff password
export async function resetStaffPassword(id, newPassword) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}/reset-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ newPassword }),
  });
  return res.json();
}

// Delete staff account
export async function deleteStaff(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}