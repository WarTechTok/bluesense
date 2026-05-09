// frontend/src/pages/admin/AdminBookingForm.jsx
// ============================================
// ADMIN/RECEPTIONIST BOOKING FORM - Multi-step like Booking.jsx
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { fetchAllPackages } from "../../constants/packages";
import * as adminApi from '../../services/admin';
import {
  getPriceFromPackage,
  getExtraGuestCharge,
  getDownpaymentAmount,
  getMaxCapacityFromPackage,
  getMinCapacityFromPackage,
} from "../../config/packageData";
import "./AdminBookingForm.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function AdminBookingForm({ onClose, onBookingCreated, editingBooking }) {
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [addOns, setAddOns] = useState([]);
  const [loadingAddOns, setLoadingAddOns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOasis, setSelectedOasis] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [sessionData, setSessionData] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState({});

  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    customerEmail: "",
    guestCount: 1,
    reservationDate: "",
    specialRequests: "",
    paymentMethod: "GCash",
    paymentStatus: "Partial",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});

  // Fetch packages based on selected oasis
  const fetchPackagesForOasis = useCallback(async (oasis) => {
    if (!oasis) {
      setPackages([]);
      return;
    }

    setLoadingPackages(true);
    try {
      const data = await fetchAllPackages();
      const filteredPackages = oasis === "Oasis 1"
        ? (data.Oasis1Packages || [])
        : (data.Oasis2Packages || []);
      setPackages(filteredPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  // Reset form state for new booking
  const resetFormState = useCallback(() => {
    setSelectedOasis("");
    setSelectedPackage(null);
    setSelectedSession("");
    setSelectedAddOns({});
    setFormData({
      customerName: "",
      customerContact: "",
      customerEmail: "",
      guestCount: 1,
      reservationDate: "",
      specialRequests: "",
      paymentMethod: "GCash",
      paymentStatus: "Partial",
      status: "Pending",
    });
    setErrors({});
    setStep(1);
  }, []);

  // Fetch sessions and add-ons on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch sessions
        const sessionResponse = await fetch(`${API_BASE_URL}/api/admin/sessions`);
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          setSessionData(data);
        }

        // Fetch add-ons from correct endpoint
        setLoadingAddOns(true);
        const addonsResponse = await fetch(`${API_BASE_URL}/api/admin/addons/active`);
        if (addonsResponse.ok) {
          const data = await addonsResponse.json();
          setAddOns(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingAddOns(false);
      }
    };
    loadData();
  }, []);

  // Reset form when not editing (new booking)
  useEffect(() => {
    if (!editingBooking) {
      resetFormState();
    }
  }, [editingBooking, resetFormState]);

  // Initialize with editing booking if provided
  useEffect(() => {
    if (editingBooking) {
      setSelectedOasis(editingBooking.oasis);
      setSelectedSession(editingBooking.session);
      setFormData({
        customerName: editingBooking.customerName || "",
        customerContact: editingBooking.customerContact || "",
        customerEmail: editingBooking.customerEmail || "",
        guestCount: editingBooking.pax || 1,
        reservationDate: editingBooking.bookingDate || "",
        specialRequests: editingBooking.specialRequests || "",
        paymentMethod: editingBooking.paymentMethod || "GCash",
        paymentStatus: editingBooking.paymentStatus === "Fully Paid" ? "Fully Paid" : "Partial",
        status: editingBooking.status || "Pending",
      });
      setStep(1);
      fetchPackagesForOasis(editingBooking.oasis);
    }
  }, [editingBooking, fetchPackagesForOasis]);

  // Get current package data
  const currentPackage = selectedPackage ? {
    ...selectedPackage,
    sessions: selectedPackage.sessions?.length > 0
      ? selectedPackage.sessions
      : selectedPackage.availableSessions || [],
  } : null;

  const getSessionDisplay = (session) => {
    if (!session) return session;
    const sessionMap = {
      Day: "Day (8AM - 5PM)",
      Night: "Night (6PM - 6AM)",
      "22hrs": "22-Hour Session (Flexible)",
    };
    return sessionMap[session] || session;
  };

  const getMaxCapacityForPackage = () => getMaxCapacityFromPackage(currentPackage);
  const getMinCapacityForPackage = () => getMinCapacityFromPackage(currentPackage);

  const calculatePrice = () => {
    if (!selectedSession || !formData.reservationDate || !currentPackage) return 0;
    return getPriceFromPackage(
      currentPackage,
      selectedSession,
      formData.reservationDate,
      formData.guestCount
    );
  };

  const calculateExtraGuestCharges = () =>
    getExtraGuestCharge(currentPackage, formData.guestCount);

  const calculateAddonsTotal = () =>
    Object.values(selectedAddOns).reduce((sum, price) => sum + price, 0);

  const getTotalPrice = () => {
    const base = calculatePrice();
    const extraGuest = calculateExtraGuestCharges();
    const addons = calculateAddonsTotal();
    return base + extraGuest + addons;
  };

  const handleAddonToggle = (addon) => {
    const newSelected = { ...selectedAddOns };
    if (newSelected[addon.name]) {
      delete newSelected[addon.name];
    } else {
      newSelected[addon.name] = addon.price;
    }
    setSelectedAddOns(newSelected);
  };

  const getDownpayment = () =>
    getDownpaymentAmount(selectedSession, sessionData);

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.customerName?.trim()) newErrors.customerName = "Customer name is required";
      if (!formData.customerContact?.trim()) newErrors.customerContact = "Contact number is required";
      if (!formData.customerEmail?.trim()) newErrors.customerEmail = "Email is required";
      if (!selectedOasis) newErrors.oasis = "Location is required";
      if (!selectedPackage) newErrors.package = "Package is required";
    }

    if (stepNum === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = "Reservation date is required";
      if (!selectedSession) newErrors.session = "Session is required";
      if (formData.guestCount < 1) newErrors.guestCount = "Guest count must be at least 1";
      const minCap = getMinCapacityForPackage();
      if (minCap > 0 && formData.guestCount < minCap) {
        newErrors.guestCount = `Minimum ${minCap} guests required for this package`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const totalPrice = getTotalPrice();
      const downpayment = getDownpayment();

      // Always auto-confirm regardless of payment status
      const bookingStatus = "Confirmed";

      const bookingPayload = {
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        customerEmail: formData.customerEmail,
        oasis: selectedOasis,
        package: selectedPackage.name,
        session: selectedSession,
        bookingDate: formData.reservationDate,
        pax: parseInt(formData.guestCount),
        totalPrice: totalPrice,
        downpayment: downpayment,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        status: bookingStatus,
        specialRequests: formData.specialRequests,
        addons: Object.keys(selectedAddOns).length > 0 ? selectedAddOns : {},
      };

      if (editingBooking) {
        await adminApi.updateBooking(editingBooking._id, bookingPayload);
      } else {
        await adminApi.createBooking(bookingPayload);
      }

      onBookingCreated();
    } catch (error) {
      console.error("Error saving booking:", error);
      alert(error.message || "Error saving booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = getTotalPrice();
  const downpayment = getDownpayment();

  return (
    <div className="admin-booking-modal">
      {/* Modal Header */}
      <div className="booking-modal-header">
        <div>
          <h2>{editingBooking ? "Edit Booking" : "Create New Booking"}</h2>
          <p className="modal-subtitle">Step {step} of 4</p>
        </div>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <span>1</span>
          <p>Customer Info</p>
        </div>
        <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <span>2</span>
          <p>Date & Session</p>
        </div>
        <div className={`step ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
          <span>3</span>
          <p>Payment</p>
        </div>
        <div className={`step ${step === 4 ? 'active' : ''}`}>
          <span>4</span>
          <p>Review</p>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="form-content">
        {/* Step 1: Customer Info */}
        {step === 1 && (
          <div className="form-step">
            <h3>Customer Information</h3>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className={errors.customerName ? 'error' : ''}
              />
              {errors.customerName && <span className="error-text">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                value={formData.customerContact}
                onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                className={errors.customerContact ? 'error' : ''}
              />
              {errors.customerContact && <span className="error-text">{errors.customerContact}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className={errors.customerEmail ? 'error' : ''}
              />
              {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
            </div>

            <div className="form-group">
              <label>Location *</label>
              <select
                value={selectedOasis}
                onChange={(e) => {
                  setSelectedOasis(e.target.value);
                  setSelectedPackage(null);
                  setSelectedSession("");
                  fetchPackagesForOasis(e.target.value);
                }}
                className={errors.oasis ? 'error' : ''}
              >
                <option value="">Select Location</option>
                <option value="Oasis 1">Oasis 1</option>
                <option value="Oasis 2">Oasis 2</option>
              </select>
              {errors.oasis && <span className="error-text">{errors.oasis}</span>}
            </div>

            <div className="form-group">
              <label>Package *</label>
              <select
                value={selectedPackage?.id || ""}
                onChange={(e) => {
                  const pkg = packages.find(p => (p.id || p.name) === e.target.value);
                  setSelectedPackage(pkg || null);
                  setSelectedSession("");
                }}
                disabled={!selectedOasis || loadingPackages}
                className={errors.package ? 'error' : ''}
              >
                <option value="">
                  {loadingPackages ? "Loading packages..." : "Select Package"}
                </option>
                {packages.map((pkg) => (
                  <option key={pkg.id || pkg.name} value={pkg.id || pkg.name}>
                    {pkg.name} {pkg.capacity ? `(${pkg.capacity})` : ""}
                  </option>
                ))}
              </select>
              {errors.package && <span className="error-text">{errors.package}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Date & Session */}
        {step === 2 && (
          <div className="form-step">
            <h3>Booking Details</h3>
            <div className="form-group">
              <label>Reservation Date *</label>
              <input
                type="date"
                value={formData.reservationDate}
                onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                className={errors.reservationDate ? 'error' : ''}
              />
              {errors.reservationDate && <span className="error-text">{errors.reservationDate}</span>}
            </div>

            <div className="form-group">
              <label>Session *</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                disabled={!currentPackage}
                className={errors.session ? 'error' : ''}
              >
                <option value="">Select Session</option>
                {currentPackage?.sessions?.map((session) => (
                  <option key={session} value={session}>
                    {getSessionDisplay(session)}
                  </option>
                ))}
              </select>
              {errors.session && <span className="error-text">{errors.session}</span>}
            </div>

            <div className="form-group">
              <label>Number of Guests *</label>
              <div className="pax-input-container">
                <button
                  type="button"
                  className="pax-btn pax-minus"
                  onClick={() => setFormData({ ...formData, guestCount: Math.max(1, formData.guestCount - 1) })}
                  disabled={formData.guestCount <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={formData.guestCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '0') {
                      setFormData({ ...formData, guestCount: '' });
                    } else {
                      setFormData({ ...formData, guestCount: Math.max(1, parseInt(val) || 1) });
                    }
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setFormData({ ...formData, guestCount: 1 });
                    }
                  }}
                  className={`pax-input ${errors.guestCount ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="pax-btn pax-plus"
                  onClick={() => setFormData({ ...formData, guestCount: formData.guestCount + 1 })}
                >
                  +
                </button>
              </div>
              {errors.guestCount && <span className="error-text">{errors.guestCount}</span>}
              {currentPackage && (
                <small>Capacity: {getMinCapacityForPackage() > 0 ? `${getMinCapacityForPackage()}-` : ""}${getMaxCapacityForPackage()} pax</small>
              )}
            </div>

            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Any special requests?"
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="form-step">
            <h3>Payment Information</h3>
            <div className="price-summary">
              <div className="price-row">
                <span>Base Price:</span>
                <span>₱{calculatePrice().toLocaleString()}</span>
              </div>
              {calculateExtraGuestCharges() > 0 && (
                <div className="price-row">
                  <span>Extra Guests (₱150 each):</span>
                  <span>₱{calculateExtraGuestCharges().toLocaleString()}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total:</span>
                <span>₱{totalPrice.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Down Payment:</span>
                <span className="highlight">₱{downpayment.toLocaleString()}</span>
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="addons-section">
              <h4>Add-ons (Optional)</h4>
              {loadingAddOns ? (
                <p className="loading-text">Loading add-ons...</p>
              ) : addOns.length > 0 ? (
                <div className="addons-grid">
                  {addOns.map((addon) => (
                    <label key={addon._id} className="addon-option">
                      <input
                        type="checkbox"
                        checked={!!selectedAddOns[addon.name]}
                        onChange={() => handleAddonToggle(addon)}
                      />
                      <div className="addon-info">
                        <span className="addon-name">{addon.name}</span>
                        <span className="addon-price">+ ₱{addon.price.toLocaleString()}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="no-addons-text">No add-ons available</p>
              )}
              {Object.keys(selectedAddOns).length > 0 && (
                <div className="selected-addons-summary">
                  <small>
                    <strong>Selected Add-ons Total:</strong> ₱{calculateAddonsTotal().toLocaleString()}
                  </small>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="GCash">GCash</option>
                <option value="Maya">Maya</option>
                <option value="GoTyme">GoTyme</option>
                <option value="SeaBank">SeaBank</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              >
                <option value="Partial">Partial</option>
                <option value="Fully Paid">Fully Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Booking Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="form-step">
            <h3>Review Booking</h3>
            <div className="review-section">
              <div className="review-block">
                <h4>Customer Information</h4>
                <div className="review-item">
                  <span className="label">Name:</span>
                  <span className="value">{formData.customerName}</span>
                </div>
                <div className="review-item">
                  <span className="label">Contact:</span>
                  <span className="value">{formData.customerContact}</span>
                </div>
                <div className="review-item">
                  <span className="label">Email:</span>
                  <span className="value">{formData.customerEmail}</span>
                </div>
              </div>

              <div className="review-block">
                <h4>Booking Details</h4>
                <div className="review-item">
                  <span className="label">Location:</span>
                  <span className="value">{selectedOasis}</span>
                </div>
                <div className="review-item">
                  <span className="label">Package:</span>
                  <span className="value">{selectedPackage?.name}</span>
                </div>
                <div className="review-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(formData.reservationDate).toLocaleDateString()}</span>
                </div>
                <div className="review-item">
                  <span className="label">Session:</span>
                  <span className="value">{getSessionDisplay(selectedSession)}</span>
                </div>
                <div className="review-item">
                  <span className="label">Guests:</span>
                  <span className="value">{formData.guestCount} pax</span>
                </div>
                {formData.specialRequests && (
                  <div className="review-item">
                    <span className="label">Special Requests:</span>
                    <span className="value">{formData.specialRequests}</span>
                  </div>
                )}
              </div>

              {Object.keys(selectedAddOns).length > 0 && (
                <div className="review-block">
                  <h4>Selected Add-ons</h4>
                  {Object.entries(selectedAddOns).map(([name, price]) => (
                    <div key={name} className="review-item">
                      <span className="label">{name}:</span>
                      <span className="value">+ ₱{price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="review-block">
                <h4>Payment & Status</h4>
                <div className="review-item">
                  <span className="label">Total Amount:</span>
                  <span className="value">₱{totalPrice.toLocaleString()}</span>
                </div>
                {calculateAddonsTotal() > 0 && (
                  <div className="review-item">
                    <span className="label">Add-ons Total:</span>
                    <span className="value">₱{calculateAddonsTotal().toLocaleString()}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="label">Down Payment:</span>
                  <span className="value">₱{downpayment.toLocaleString()}</span>
                </div>
                <div className="review-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">{formData.paymentMethod}</span>
                </div>
                <div className="review-item">
                  <span className="label">Payment Status:</span>
                  <span className={`value payment-status-${formData.paymentStatus.toLowerCase()}`}>
                    {formData.paymentStatus}
                  </span>
                </div>
                <div className="review-item status-auto-update">
                  <span className="label">Booking Status:</span>
                  <span className={`value booking-status-confirmed`}>
                    🟢 Confirmed
                  </span>
                  <small className="auto-update-note">(Auto-confirmed due to payment)</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer - Navigation Buttons */}
      <div className="booking-modal-footer">
        <button
          className="btn-secondary"
          onClick={step === 1 ? onClose : handlePrevStep}
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 4 && (
          <button
            className="btn-primary"
            onClick={handleNextStep}
          >
            Next
          </button>
        )}
        {step === 4 && (
          <button
            className="btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : editingBooking ? "Update Booking" : "Create Booking"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminBookingForm;
