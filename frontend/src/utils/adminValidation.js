/**
 * ============================================
 * ADMIN VALIDATION UTILITIES
 * ============================================
 * Centralized validation functions for admin dashboard forms
 * Ensures data integrity across all management pages
 */

/**
 * Validate Inventory Item
 * @param {Object} formData - { item, quantity, unit, lowStockAlert }
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateInventoryItem = (formData) => {
  // Item Name validation
  if (!formData.item || formData.item.trim() === '') {
    return { isValid: false, error: '❌ Item Name is required' };
  }
  if (formData.item.trim().length < 2) {
    return { isValid: false, error: '❌ Item Name must be at least 2 characters' };
  }

  // Quantity validation
  if (formData.quantity === '' || formData.quantity === null) {
    return { isValid: false, error: '❌ Quantity is required' };
  }
  const quantity = parseInt(formData.quantity);
  if (isNaN(quantity)) {
    return { isValid: false, error: '❌ Quantity must be a valid number' };
  }
  if (quantity < 0) {
    return { isValid: false, error: '❌ Quantity cannot be negative' };
  }

  // Unit validation
  if (!formData.unit || formData.unit.trim() === '') {
    return { isValid: false, error: '❌ Unit is required' };
  }

  // Low Stock Alert validation
  if (formData.lowStockAlert === '' || formData.lowStockAlert === null) {
    return { isValid: false, error: '❌ Low Stock Alert is required' };
  }
  const lowStockAlert = parseInt(formData.lowStockAlert);
  if (isNaN(lowStockAlert)) {
    return { isValid: false, error: '❌ Low Stock Alert must be a valid number' };
  }
  if (lowStockAlert < 0) {
    return { isValid: false, error: '❌ Low Stock Alert cannot be negative' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate Inventory Usage
 * @param {Object} usageData - { quantityUsed, usedBy }
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateInventoryUsage = (usageData) => {
  // Quantity Used validation
  if (usageData.quantityUsed === '' || usageData.quantityUsed === null) {
    return { isValid: false, error: '❌ Quantity Used is required' };
  }
  const quantityUsed = parseInt(usageData.quantityUsed);
  if (isNaN(quantityUsed)) {
    return { isValid: false, error: '❌ Quantity Used must be a valid number' };
  }
  if (quantityUsed <= 0) {
    return { isValid: false, error: '❌ Quantity Used must be greater than 0' };
  }

  // Used By validation
  if (!usageData.usedBy || usageData.usedBy.trim() === '') {
    return { isValid: false, error: '❌ Used By field is required' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate Room
 * @param {Object} formData - { name, capacity, price, description, status }
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateRoom = (formData) => {
  // Name validation
  if (!formData.name || formData.name.trim() === '') {
    return { isValid: false, error: '❌ Room Name is required' };
  }
  if (formData.name.trim().length < 2) {
    return { isValid: false, error: '❌ Room Name must be at least 2 characters' };
  }

  // Capacity validation
  if (formData.capacity === '' || formData.capacity === null) {
    return { isValid: false, error: '❌ Capacity is required' };
  }
  const capacity = parseInt(formData.capacity);
  if (isNaN(capacity)) {
    return { isValid: false, error: '❌ Capacity must be a valid number' };
  }
  if (capacity <= 0) {
    return { isValid: false, error: '❌ Capacity must be greater than 0' };
  }

  // Price validation
  if (formData.price === '' || formData.price === null) {
    return { isValid: false, error: '❌ Price per Night is required' };
  }
  const price = parseFloat(formData.price);
  if (isNaN(price)) {
    return { isValid: false, error: '❌ Price must be a valid number' };
  }
  if (price < 0) {
    return { isValid: false, error: '❌ Price cannot be negative' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate Reservation
 * @param {Object} formData - { guestName, guestEmail, checkIn, checkOut, bookingDetails }
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateReservation = (formData) => {
  // Guest Name validation
  if (!formData.guestName || formData.guestName.trim() === '') {
    return { isValid: false, error: '❌ Guest Name is required' };
  }
  if (formData.guestName.trim().length < 2) {
    return { isValid: false, error: '❌ Guest Name must be at least 2 characters' };
  }

  // Guest Email validation
  if (!formData.guestEmail || formData.guestEmail.trim() === '') {
    return { isValid: false, error: '❌ Guest Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.guestEmail)) {
    return { isValid: false, error: '❌ Guest Email must be valid' };
  }

  // Check-In validation
  if (!formData.checkIn) {
    return { isValid: false, error: '❌ Check-In date is required' };
  }

  // Check-Out validation
  if (!formData.checkOut) {
    return { isValid: false, error: '❌ Check-Out date is required' };
  }

  // Check-In and Check-Out comparison
  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);
  if (checkOutDate <= checkInDate) {
    return { isValid: false, error: '❌ Check-Out date must be after Check-In date' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate Staff Member
 * @param {Object} formData - { name, email, role, password }
 * @param {boolean} isEditing - Whether this is an edit operation
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateStaffMember = (formData, isEditing = false) => {
  // Name validation
  if (!formData.name || formData.name.trim() === '') {
    return { isValid: false, error: '❌ Name is required' };
  }
  if (formData.name.trim().length < 2) {
    return { isValid: false, error: '❌ Name must be at least 2 characters' };
  }

  // Email validation
  if (!formData.email || formData.email.trim() === '') {
    return { isValid: false, error: '❌ Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return { isValid: false, error: '❌ Email must be valid' };
  }

  // Role validation
  if (!formData.role || formData.role.trim() === '') {
    return { isValid: false, error: '❌ Role is required' };
  }

  // Password validation (only for new staff)
  if (!isEditing) {
    if (!formData.password || formData.password === '') {
      return { isValid: false, error: '❌ Password is required' };
    }
    if (formData.password.length < 6) {
      return { isValid: false, error: '❌ Password must be at least 6 characters' };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate Password Reset
 * @param {string} newPassword - New password to set
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePasswordReset = (newPassword) => {
  if (!newPassword || newPassword === '') {
    return { isValid: false, error: '❌ New Password is required' };
  }
  if (newPassword.length < 6) {
    return { isValid: false, error: '❌ Password must be at least 6 characters' };
  }
  return { isValid: true, error: null };
};

/**
 * Show validation alert to user
 * @param {string} message - Error message to display
 */
export const showValidationError = (message) => {
  alert(message);
};

/**
 * Show success alert to user
 * @param {string} message - Success message to display
 */
export const showSuccessMessage = (message) => {
  alert(message);
};
