// frontend/src/services/admin/bookings.js
// ============================================
// BOOKINGS API - Booking management endpoints
// ============================================

import { bookingsApiClient, apiClient } from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const getAllBookings = async () => {
  console.log("🔵 getAllBookings STARTED 🔵");
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const res = await bookingsApiClient.get(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const res = await bookingsApiClient.post('/bookings', bookingData);
    return res.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const res = await bookingsApiClient.patch(`/bookings/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const res = await bookingsApiClient.patch(`/bookings/${id}/payment`, { paymentStatus });
    return res.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const verifyPayment = async (id) => {
  try {
    const res = await bookingsApiClient.patch(`/bookings/${id}/verify`);
    return res.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const deletePaymentProof = async (id) => {
  try {
    const res = await bookingsApiClient.patch(`/bookings/${id}/delete-proof`);
    return res.data;
  } catch (error) {
    console.error('Error deleting payment proof:', error);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const res = await bookingsApiClient.delete(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

export const getReservations = async () => {
  try {
    const res = await apiClient.get('/reservations');
    return res.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const res = await apiClient.post('/reservations', reservationData);
    return res.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const updateReservation = async (id, reservationData) => {
  try {
    const res = await apiClient.put(`/reservations/${id}`, reservationData);
    return res.data;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

export const confirmReservation = async (id) => {
  try {
    const res = await apiClient.put(`/reservations/${id}/confirm`);
    return res.data;
  } catch (error) {
    console.error('Error confirming reservation:', error);
    throw error;
  }
};

export const cancelReservation = async (id) => {
  try {
    const res = await apiClient.put(`/reservations/${id}/cancel`);
    return res.data;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

export const deleteReservation = async (id) => {
  try {
    const res = await apiClient.delete(`/reservations/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};