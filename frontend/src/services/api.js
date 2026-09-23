// src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
console.log(`🔗 API Base URL: ${API_BASE_URL}`);

// ============================================
// AUTH
// ============================================

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPassword(token, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.json();
}

// ============================================
// PROFILE
// ============================================

export async function getProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function updateProfile(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

// ============================================
// SENSOR DATA
// ============================================

export async function getLatestReading(oasis) {
  const token = localStorage.getItem('token');
  const url = oasis
    ? `${API_BASE_URL}/api/readings/latest?oasis=${oasis}`
    : `${API_BASE_URL}/api/readings/latest`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch latest reading');
  return res.json();
}

export async function getHistory(oasis) {
  const token = localStorage.getItem('token');
  const url = oasis
    ? `${API_BASE_URL}/api/readings/history?oasis=${oasis}`
    : `${API_BASE_URL}/api/readings/history`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

// ============================================
// BOOKING
// ============================================

// ---- Step 2: Reserve a slot (called on Continue click) ----
// Sends guest info + date/session to POST /api/bookings/reserve.
// Returns { bookingId, reservedUntil } on success.
// Throws with error.status === 409 if slot is already taken.
export async function reserveSlot(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.message || 'Failed to reserve slot');
    error.status = res.status;
    error.data   = json;
    throw error;
  }

  return json; // { success, bookingId, reservedUntil }
}

// ---- Step 4: Confirm booking (called on Confirm Booking click) ----
// Sends payment details + proof to PATCH /api/bookings/:id/confirm.
// Upgrades the Reserved booking to Pending — now visible to admin.
export async function confirmBooking(bookingId, formData) {
  const token = localStorage.getItem('token');

  // formData is a FormData instance (contains file + payment fields)
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm`, {
    method: 'PATCH',
    headers: {
      // No Content-Type — let the browser set multipart/form-data with boundary
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.message || 'Failed to confirm booking');
    error.status = res.status;
    error.data   = json;
    throw error;
  }

  return json; // { success, booking }
}

// ---- Release a Reserved slot (called on in-app Back and beforeunload) ----
// DELETE /api/bookings/reserve/:id
// Idempotent: returns { success: true } even if the booking is already gone.
// Preserves the HTTP status code on the thrown error so callers can inspect it.
export async function releaseSlot(bookingId) {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API_BASE_URL}/api/bookings/reserve/${bookingId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.message || 'Failed to release slot');
    error.status = res.status;
    error.data   = json;
    throw error;
  }

  return json; // { success: true, message }
}

// ---- Legacy full-create (kept for any other callers) ----
export async function createBooking(bookingData) {
  const token = localStorage.getItem('token');
  const isFormData = bookingData instanceof FormData;
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token)       headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers,
    body: isFormData ? bookingData : JSON.stringify(bookingData),
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Booking failed');
    error.status = res.status;
    error.data   = data;
    throw error;
  }
  return data;
}

export async function getAllBookings() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getBookingById(id) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`);
  return res.json();
}

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

export async function deleteBooking(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ============================================
// DASHBOARD
// ============================================

export async function getDashboardStats() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getRecentBookings(limit = 10) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/recent-bookings?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ============================================
// ROOM MANAGEMENT
// ============================================

export async function getRooms() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
    headers: { 'Authorization': `Bearer ${token}` }
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
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}