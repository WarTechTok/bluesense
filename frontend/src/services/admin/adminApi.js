// ============================================
// ADMIN API SERVICE
// ============================================
// Centralized Axios client for all admin API calls
// Base URL: http://localhost:8080/api/admin
// Auto-injects JWT token from localStorage in all requests
// Organized by module: Dashboard, Rooms, Reservations, Inventory, Staff, Sales, Reports
// Error handling: console.error + throw for component handling

import axios from 'axios';

// ============================================
// API BASE CONFIGURATION
// ============================================
// API_BASE_URL: Backend admin API endpoint
// Interceptor: Auto-injects 'Authorization: Bearer {token}' header
// getAuthToken(): Retrieves JWT from localStorage
const API_BASE_URL = 'http://localhost:8080/api/admin';

// ============================================
// GET AUTH TOKEN FROM STORAGE
// ============================================
// Retrieves JWT token stored during login
// Used by Axios interceptor to authorize requests
const getAuthToken = () => localStorage.getItem('token');

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================
// Creates Axios client with base URL and default headers
// Request interceptor: Adds JWT token to Authorization header
// Applies to all API calls in this service
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR - ADD JWT TOKEN
// ============================================
// Runs before every API request
// Retrieves token from localStorage
// Adds 'Authorization: Bearer {token}' header if token exists

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Handle FormData - don't set Content-Type, let the browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// ============================================
// RESPONSE ERROR INTERCEPTOR
// ============================================
// Logs API errors with details for debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from API:', error.message);
    } else {
      // Error in request setup
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// DASHBOARD API ENDPOINTS
// ============================================
// GET /dashboard/stats - Dashboard statistics
// GET /dashboard/daily-chart - Daily sales chart data
// GET /dashboard/monthly-chart - Monthly sales chart data

// ============================================
// GET DASHBOARD STATS
// ============================================
// Returns: {totalReservations, availableRooms, maintainanceRooms, activeStaff, monthlyRevenue, lowStockItems}
export const getDashboardStats = async () => {
  try {
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ============================================
// GET DAILY CHART DATA
// ============================================
// Returns: Array of daily sales data formatted for Chart.js line chart
export const getDailyChartData = async () => {
  try {
    const res = await apiClient.get('/dashboard/daily-chart');
    return res.data;
  } catch (error) {
    console.error('Error fetching daily chart data:', error);
    throw error;
  }
};

// ============================================
// GET MONTHLY CHART DATA
// ============================================
// Returns: Array of monthly sales data formatted for Chart.js bar chart
export const getMonthlyChartData = async () => {
  try {
    const res = await apiClient.get('/dashboard/monthly-chart');
    return res.data;
  } catch (error) {
    console.error('Error fetching monthly chart data:', error);
    throw error;
  }
};

// ============================================
// ROOM MANAGEMENT API ENDPOINTS
// ============================================
// GET /rooms - Get all rooms
// GET /rooms/:id - Get room by ID
// POST /rooms - Create new room (Admin only)
// PUT /rooms/:id - Update room (Admin only)
// DELETE /rooms/:id - Delete room (Admin only)

// ============================================
// GET ALL ROOMS
// ============================================
// Returns: Array of all room objects with prices and status
export const getAllRooms = async () => {
  try {
    const res = await apiClient.get('/rooms');
    return res.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// ============================================
// GET ROOM BY ID
// ============================================
// Params: id - Room MongoDB _id
// Returns: Single room object with detailed information
export const getRoomById = async (id) => {
  try {
    const res = await apiClient.get(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};

// ============================================
// CREATE ROOM
// ============================================
// Params: roomData - {name, capacity, pricePerNight, status}
// Returns: Newly created room object with MongoDB _id
// Requires: Admin role
export const createRoom = async (roomData) => {
  try {
    const res = await apiClient.post('/rooms', roomData);
    return res.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// ============================================
// UPDATE ROOM
// ============================================
// Params: id - Room MongoDB _id, roomData - fields to update
// Returns: Updated room object
// Requires: Admin role
export const updateRoom = async (id, roomData) => {
  try {
    const res = await apiClient.put(`/rooms/${id}`, roomData);
    return res.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// ============================================
// DELETE ROOM
// ============================================
// Params: id - Room MongoDB _id
// Returns: Deleted room object
// Requires: Admin role
export const deleteRoom = async (id) => {
  try {
    const res = await apiClient.delete(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// ============================================
// STAFF ASSIGNMENT API ENDPOINTS
// ============================================
// PUT /rooms/:id/assign-staff - Assign staff to room
// DELETE /rooms/:id/remove-staff/:staffId - Remove staff from room
// GET /rooms/:id/staff - Get all staff assigned to room

// ============================================
// ASSIGN STAFF TO ROOM
// ============================================
// Params: id - Room MongoDB _id, staffData - {staffId, notes?}
// Action: Adds staff member to room's assignedStaff array
// Returns: Updated room object with assigned staff
// Requires: Admin role
export const assignStaffToRoom = async (id, staffData) => {
  try {
    const res = await apiClient.put(`/rooms/${id}/assign-staff`, staffData);
    return res.data;
  } catch (error) {
    console.error('Error assigning staff to room:', error);
    throw error;
  }
};

// ============================================
// REMOVE STAFF FROM ROOM
// ============================================
// Params: id - Room MongoDB _id, staffId - Staff member to remove
// Action: Removes staff member from room's assignedStaff array
// Returns: Updated room object
// Requires: Admin role
export const removeStaffFromRoom = async (id, staffId) => {
  try {
    const res = await apiClient.delete(`/rooms/${id}/remove-staff/${staffId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing staff from room:', error);
    throw error;
  }
};

// ============================================
// GET ROOM STAFF
// ============================================
// Params: id - Room MongoDB _id
// Returns: Array of assigned staff with full details
// Accessible: Authenticated users
export const getRoomStaff = async (id) => {
  try {
    const res = await apiClient.get(`/rooms/${id}/staff`);
    return res.data;
  } catch (error) {
    console.error('Error fetching room staff:', error);
    throw error;
  }
};

// ============================================
// BOOKING MANAGEMENT API ENDPOINTS
// ============================================
// GET /bookings - Get all bookings (staff/admin only)
// GET /bookings/:id - Get booking by ID
// POST /bookings - Create new booking
// PATCH /bookings/:id/status - Update booking status
// PATCH /bookings/:id/payment - Update payment status
// DELETE /bookings/:id - Delete booking (admin only)

// ============================================
// GET ALL BOOKINGS
// ============================================
// Returns: Array of all booking objects with confirmation details
// Requires: Staff role
export const getAllBookings = async () => {
  try {
    const res = await apiClient.get('/bookings');
    return res.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// ============================================
// GET BOOKING BY ID
// ============================================
// Params: id - Booking MongoDB _id
// Returns: Single booking object with details
export const getBookingById = async (id) => {
  try {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// ============================================
// CREATE BOOKING
// ============================================
// Params: bookingData - booking information
// Returns: Newly created booking object
export const createBooking = async (bookingData) => {
  try {
    const res = await apiClient.post('/bookings', bookingData);
    return res.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// ============================================
// UPDATE BOOKING STATUS
// ============================================
// Params: id - Booking MongoDB _id, status - new status
// Returns: Updated booking object
// Requires: Staff role
export const updateBookingStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/bookings/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// ============================================
// UPDATE PAYMENT STATUS
// ============================================
// Params: id - Booking MongoDB _id, paymentStatus - new payment status
// Returns: Updated booking object
// Requires: Staff role
export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const res = await apiClient.patch(`/bookings/${id}/payment`, { paymentStatus });
    return res.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// ============================================
// VERIFY PAYMENT AND CONFIRM BOOKING
// ============================================
// Params: id - Booking MongoDB _id
// Returns: Updated booking object with status Confirmed and paymentStatus Paid
// Requires: Staff role
// Actions: Updates payment status to Paid, booking status to Confirmed, sends email to customer
export const verifyPayment = async (id) => {
  try {
    const res = await apiClient.patch(`/bookings/${id}/verify`);
    return res.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// ============================================
// DELETE BOOKING
// ============================================
// Params: id - Booking MongoDB _id
// Returns: Deleted booking object
// Requires: Staff role
export const deleteBooking = async (id) => {
  try {
    const res = await apiClient.delete(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// ============================================
// RESERVATION MANAGEMENT API ENDPOINTS
// ============================================
// GET /reservations - Get all reservations
// PUT /reservations/:id/confirm - Confirm booking & create sale
// PUT /reservations/:id/cancel - Cancel booking
// DELETE /reservations/:id - Delete booking

// ============================================
// GET ALL RESERVATIONS
// ============================================
// Returns: Array of all reservation objects with guest info
export const getAllReservations = async () => {
  try {
    const res = await apiClient.get('/reservations');
    return res.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

// ============================================
// CREATE RESERVATION
// ============================================
// Params: reservationData - {room, guestName, guestEmail, checkIn, checkOut, bookingDetails}
// Returns: Newly created reservation object with Pending status
// Requires: Admin role
export const createReservation = async (reservationData) => {
  try {
    const res = await apiClient.post('/reservations', reservationData);
    return res.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// ============================================
// UPDATE RESERVATION
// ============================================
// Params: id - Reservation MongoDB _id, reservationData - fields to update
// Returns: Updated reservation object
// Requires: Admin role
export const updateReservation = async (id, reservationData) => {
  try {
    const res = await apiClient.put(`/reservations/${id}`, reservationData);
    return res.data;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
};

// ============================================
// CONFIRM RESERVATION
// ============================================
// Params: id - Reservation MongoDB _id
// Action: Changes status to 'Confirmed' and creates Sale record
// Returns: Updated reservation object
// Requires: Admin role
export const confirmReservation = async (id) => {
  try {
    const res = await apiClient.put(`/reservations/${id}/confirm`);
    return res.data;
  } catch (error) {
    console.error('Error confirming reservation:', error);
    throw error;
  }
};

// ============================================
// CANCEL RESERVATION
// ============================================
// Params: id - Reservation MongoDB _id
// Action: Changes status to 'Cancelled'
// Returns: Updated reservation object
// Requires: Admin role
export const cancelReservation = async (id) => {
  try {
    const res = await apiClient.put(`/reservations/${id}/cancel`);
    return res.data;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// ============================================
// DELETE RESERVATION
// ============================================
// Params: id - Reservation MongoDB _id
// Returns: Deleted reservation object
// Requires: Admin role
export const deleteReservation = async (id) => {
  try {
    const res = await apiClient.delete(`/reservations/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
};

// ============================================
// INVENTORY MANAGEMENT API ENDPOINTS
// ============================================
// GET /inventory - Get all inventory items
// POST /inventory - Create new inventory item (Admin only)
// PUT /inventory/:id - Update item quantity (Admin only)
// PUT /inventory/:id/usage - Record item usage (Staff)
// GET /inventory/alerts/low-stock - Get items below minimum
// DELETE /inventory/:id - Delete item (Admin only)

// ============================================
// GET ALL INVENTORY
// ============================================
// Returns: Array of all inventory items with quantities
export const getAllInventory = async () => {
  try {
    const res = await apiClient.get('/inventory');
    return res.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

// ============================================
// CREATE INVENTORY ITEM
// ============================================
// Params: itemData - {itemName, quantity, minimumLevel, unit, cost}
// Returns: Newly created inventory item
// Requires: Admin role
export const createInventoryItem = async (itemData) => {
  try {
    const res = await apiClient.post('/inventory', itemData);
    return res.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

// ============================================
// UPDATE INVENTORY QUANTITY
// ============================================
// Params: id - Item MongoDB _id, quantity - new quantity value
// Returns: Updated inventory item
// Requires: Admin role
export const updateInventoryQuantity = async (id, quantity) => {
  try {
    const res = await apiClient.put(`/inventory/${id}`, { quantity });
    return res.data;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// ============================================
// RECORD INVENTORY USAGE
// ============================================
// Params: id - Item MongoDB _id, usageData - {quantity, usedBy, date, notes}
// Action: Logs usage with staff attribution for tracking
// Returns: Updated inventory item with usage record
// Accessible: Authenticated users (Staff/Admin)
export const recordInventoryUsage = async (id, usageData) => {
  try {
    const res = await apiClient.put(`/inventory/${id}/usage`, usageData);
    return res.data;
  } catch (error) {
    console.error('Error recording inventory usage:', error);
    throw error;
  }
};

// ============================================
// GET LOW STOCK ITEMS
// ============================================
// Returns: Array of items with quantity <= minimumLevel
// Used: Dashboard alerts and inventory management
export const getLowStockItems = async () => {
  try {
    const res = await apiClient.get('/inventory/alerts/low-stock');
    return res.data;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

// ============================================
// DELETE INVENTORY ITEM
// ============================================
// Params: id - Item MongoDB _id
// Returns: Deleted inventory item
// Requires: Admin role
export const deleteInventoryItem = async (id) => {
  try {
    const res = await apiClient.delete(`/inventory/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

// ============================================
// STAFF MANAGEMENT API ENDPOINTS
// ============================================
// GET /staff - Get all staff (Admin only)
// POST /staff - Create staff account (Admin only)
// PUT /staff/:id - Update staff info (Admin only)
// PUT /staff/:id/disable - Deactivate account (Admin only)
// PUT /staff/:id/activate - Activate account (Admin only)
// PUT /staff/:id/reset-password - Reset password (Admin only)
// DELETE /staff/:id - Delete staff (Admin only)

// ============================================
// GET ALL STAFF
// ============================================
// Returns: Array of all staff accounts with status
// Requires: Admin role
export const getAllStaff = async () => {
  try {
    const res = await apiClient.get('/staff');
    return res.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

// ============================================
// CREATE STAFF ACCOUNT
// ============================================
// Params: staffData - {name, email, password}
// Action: Password auto-hashed with bcryptjs before DB save
// Returns: Newly created staff account
// Requires: Admin role
export const createStaffAccount = async (staffData) => {
  try {
    const res = await apiClient.post('/staff', staffData);
    return res.data;
  } catch (error) {
    console.error('Error creating staff account:', error);
    throw error;
  }
};

// ============================================
// UPDATE STAFF INFORMATION
// ============================================
// Params: id - Staff MongoDB _id, staffData - fields to update
// Returns: Updated staff object
// Requires: Admin role
export const updateStaff = async (id, staffData) => {
  try {
    const res = await apiClient.put(`/staff/${id}`, staffData);
    return res.data;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

// ============================================
// DISABLE STAFF ACCOUNT
// ============================================
// Params: id - Staff MongoDB _id
// Action: Sets status to 'Disabled', prevents login
// Returns: Updated staff object
// Requires: Admin role
export const disableStaffAccount = async (id) => {
  try {
    const res = await apiClient.put(`/staff/${id}/disable`);
    return res.data;
  } catch (error) {
    console.error('Error disabling staff account:', error);
    throw error;
  }
};

// ============================================
// ACTIVATE STAFF ACCOUNT
// ============================================
// Params: id - Staff MongoDB _id
// Action: Sets status to 'Active', allows login
// Returns: Updated staff object
// Requires: Admin role
export const activateStaffAccount = async (id) => {
  try {
    const res = await apiClient.put(`/staff/${id}/activate`);
    return res.data;
  } catch (error) {
    console.error('Error activating staff account:', error);
    throw error;
  }
};

// ============================================
// RESET PASSWORD
// ============================================
// Params: id - Staff MongoDB _id, newPassword - new password string
// Action: Hashes password with bcryptjs and updates account
// Returns: Updated staff object
// Requires: Admin role
export const resetPassword = async (id, newPassword) => {
  try {
    const res = await apiClient.put(`/staff/${id}/reset-password`, { newPassword });
    return res.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// ============================================
// DELETE STAFF
// ============================================
// Params: id - Staff MongoDB _id
// Returns: Deleted staff object
// Requires: Admin role
export const deleteStaff = async (id) => {
  try {
    const res = await apiClient.delete(`/staff/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

// ============================================
// SALES TRACKING API ENDPOINTS
// ============================================
// GET /sales - Get all sales transactions
// GET /sales/daily - Today's revenue (Admin only)
// GET /sales/weekly - This week's revenue (Admin only)
// GET /sales/monthly - This month's revenue (Admin only)
// Auto-created when reservations are confirmed

// ============================================
// GET ALL SALES
// ============================================
// Returns: Array of all sales transactions linked to reservations
export const getAllSales = async () => {
  try {
    const res = await apiClient.get('/sales');
    return res.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

// ============================================
// GET DAILY SALES
// ============================================
// Params: date - Specific date string (optional)
// Returns: Today's total revenue and transaction count
// Requires: Admin role
export const getDailySales = async (date) => {
  try {
    const res = await apiClient.get('/sales/daily', { params: { date } });
    return res.data;
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    throw error;
  }
};

// ============================================
// GET WEEKLY SALES
// ============================================
// Returns: This week's revenue aggregation by day
// Requires: Admin role
export const getWeeklySales = async () => {
  try {
    const res = await apiClient.get('/sales/weekly');
    return res.data;
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    throw error;
  }
};

// ============================================
// GET MONTHLY SALES
// ============================================
// Params: month - Month number (0-11, where 0=January), year - Year number
// Returns: Monthly revenue with transaction details
// Requires: Admin role
export const getMonthlySales = async (month, year) => {
  try {
    const res = await apiClient.get('/sales/monthly', { params: { month, year } });
    return res.data;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }
};

// ============================================
// REPORTS GENERATION API ENDPOINTS
// ============================================
// GET /reports/reservation - Bookings report (Admin only)
// GET /reports/sales - Revenue report (Admin only)
// GET /reports/inventory-usage - Supply consumption (Authenticated)
// GET /reports/staff-activity - Staff performance (Admin only)
// GET /reports/export - Export report as JSON (Admin only)
// Supports: Date range filtering and multiple export formats

// ============================================
// GET RESERVATION REPORT
// ============================================
// Params: startDate, endDate - Date range for report
// Returns: Reservations with occupancy metrics
// Requires: Admin role
export const getReservationReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/reservation', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching reservation report:', error);
    throw error;
  }
};

// ============================================
// GET SALES REPORT
// ============================================
// Params: startDate, endDate - Date range for report
// Returns: Revenue analysis with transaction breakdown
// Requires: Admin role
export const getSalesReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/sales', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

// ============================================
// GET INVENTORY USAGE REPORT
// ============================================
// Params: startDate, endDate - Date range for report
// Returns: Supply consumption with staff attribution
// Accessible: Authenticated users (Staff can see usage logs)
export const getInventoryUsageReport = async (startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/inventory-usage', { params: { startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error fetching inventory usage report:', error);
    throw error;
  }
};

// ============================================
// GET STAFF ACTIVITY REPORT
// ============================================
// Returns: Staff performance metrics and activity logs
// Requires: Admin role
export const getStaffActivityReport = async () => {
  try {
    const res = await apiClient.get('/reports/staff-activity');
    return res.data;
  } catch (error) {
    console.error('Error fetching staff activity report:', error);
    throw error;
  }
};

// ============================================
// EXPORT REPORT AS JSON
// ============================================
// Params: reportType - 'reservation'|'sales'|'inventory'|'staff'
//         startDate, endDate - Date range for report
// Action: Generates downloadable JSON export
// Returns: Report data as JSON
// Requires: Admin role
export const exportReportAsJSON = async (reportType, startDate, endDate) => {
  try {
    const res = await apiClient.get('/reports/export', { params: { reportType, startDate, endDate } });
    return res.data;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

// ============================================
// DEBUG - VERIFY ADMIN TOKEN
// ============================================
export const debugVerifyAdminToken = async () => {
  try {
    const res = await apiClient.get('/staff/debug/verify-token');
    return res.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};
