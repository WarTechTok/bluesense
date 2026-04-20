// src/pages/booking/MyBookings.jsx
// ============================================
// MY BOOKINGS - Shows logged-in user's bookings
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./MyBookings.css";

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const MyBookings = () => {
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const proofInputRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      navigate("/login?redirect=/my-bookings");
      return;
    }

    if (user.email) {
      fetchBookings(user.email);
    } else {
      setError("User email not found. Please login again.");
      setLoading(false);
    }
  }, [navigate]);

  const fetchBookings = async (customerEmail) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/bookings/customer/${customerEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);

      if (data.length === 0) {
        setError("No bookings found for your account");
      }
    } catch (err) {
      setError(err.message || "Error fetching bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setIsEmergency(false);
    setProofFile(null);
    setProofPreview(null);
    setShowCancelModal(true);
    setShowModal(false);
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    if (isEmergency && !proofFile) {
      alert("Please upload proof for your emergency refund request");
      return;
    }

    setCancelling(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("reason", cancelReason);
      formData.append("isEmergency", isEmergency ? "true" : "false");
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${selectedBooking._id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        // Show success message based on cancellation type
        if (isEmergency) {
          alert(
            "✅ Cancellation Submitted!\n\nYour refund request will be reviewed within 3-5 business days.",
          );
        } else {
          alert(
            "✅ Booking Cancelled!\n\nPlease note that the downpayment is non-refundable.",
          );
        }

        setShowCancelModal(false);
        // Reset form
        setCancelReason("");
        setIsEmergency(false);
        setProofFile(null);
        setProofPreview(null);
        // Refresh bookings
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        fetchBookings(user.email);
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert(
        "Unable to cancel booking. Please check your connection and try again.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getBalance = (booking) => {
    if (!booking) return 0;
    if (booking.paymentType === "fullpayment") return 0;
    return (booking.totalAmount || 0) - (booking.downpayment || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Confirmed":
        return "#10b981";
      case "Cancelled":
        return "#ef4444";
      case "Completed":
        return "#0284c7";
      default:
        return "#64748b";
    }
  };

  const canCancel = (booking) => {
    return booking.status === "Pending" || booking.status === "Confirmed";
  };

  return (
    <>
      <Navbar />
      <div className="my-bookings-page">
        <div className="my-bookings-hero">
          <div className="container">
            <h1>My Bookings</h1>
            <p>View and manage all your reservations</p>
          </div>
        </div>

        <div className="my-bookings-content">
          <div className="container">
            {error && <div className="alert alert-error">{error}</div>}

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your bookings...</p>
              </div>
            )}

            {!loading && bookings.length > 0 && (
              <div className="bookings-grid">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <h3>{booking.oasis}</h3>
                        <p className="package-name">{booking.package}</p>
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(booking.status),
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-card-body">
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">
                          {formatDate(booking.bookingDate)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Guests:</span>
                        <span className="value">{booking.pax} persons</span>
                      </div>
                      <div className="info-row">
                        <span className="label">
                          {booking.paymentType === "fullpayment"
                            ? "Total Amount"
                            : "Down Payment"}
                          :
                        </span>
                        <span className="value">
                          ₱
                          {(booking.paymentType === "fullpayment"
                            ? booking.totalAmount
                            : booking.downpayment
                          )?.toLocaleString()}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Payment Status:</span>
                        <span className="value">
                          {booking.paymentStatus || "Pending"}
                        </span>
                      </div>
                      {getBalance(booking) > 0 && (
                        <div className="info-row balance-row">
                          <span className="label">Balance Due:</span>
                          <span className="value balance-due">
                            {formatCurrency(getBalance(booking))}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="booking-card-footer">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </button>
                      {canCancel(booking) && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancelClick(booking)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && bookings.length === 0 && !error && (
              <div className="empty-state">
                <i className="fas fa-calendar-alt"></i>
                <p>No bookings found.</p>
                <button className="btn-book-now" onClick={() => navigate("/")}>
                  Book Your First Stay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Information */}
              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Full Name</span>
                    <span className="value">
                      {selectedBooking.customerName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email Address</span>
                    <span className="value">
                      {selectedBooking.customerEmail}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact Number</span>
                    <span className="value">
                      {selectedBooking.customerContact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="detail-section">
                <h4>Booking Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Booking Reference</span>
                    <span
                      className="value"
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.1em",
                        color: "#00a8e8",
                      }}
                    >
                      {selectedBooking.bookingReference ||
                        selectedBooking._id?.slice(-6).toUpperCase() ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Venue</span>
                    <span className="value">{selectedBooking.oasis}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Package</span>
                    <span className="value">{selectedBooking.package}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Date</span>
                    <span className="value">
                      {formatDate(selectedBooking.bookingDate)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Number of Guests</span>
                    <span className="value">{selectedBooking.pax} persons</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="detail-section">
                <h4>Payment Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">
                      {selectedBooking.paymentType === "fullpayment"
                        ? "Total Amount"
                        : "Down Payment"}
                    </span>
                    <span className="value">
                      ₱
                      {(selectedBooking.paymentType === "fullpayment"
                        ? selectedBooking.totalAmount
                        : selectedBooking.downpayment
                      )?.toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Method</span>
                    <span className="value">
                      {selectedBooking.paymentMethod || "Cash"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Type</span>
                    <span className="value">
                      {selectedBooking.paymentType === "fullpayment"
                        ? "✓ Full Payment"
                        : "Downpayment (30%)"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Status</span>
                    <span className="value">
                      {selectedBooking.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Status</span>
                    <span
                      className="value"
                      style={{ color: getStatusColor(selectedBooking.status) }}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  {getBalance(selectedBooking) > 0 && (
                    <div className="detail-item">
                      <span className="label">Balance Due</span>
                      <span
                        className="value"
                        style={{ fontWeight: "bold", color: "#f59e0b" }}
                      >
                        {formatCurrency(getBalance(selectedBooking))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="detail-section">
                  <h4>Special Requests</h4>
                  <p className="special-request">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="modal-container cancel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="warning-box">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  <strong>⚠️ Important Notice:</strong> Downpayment is{" "}
                  <strong>NON-REFUNDABLE</strong> for regular cancellations.
                </p>
              </div>

              <div className="cancel-options">
                <label className="cancel-option">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={!isEmergency}
                    onChange={() => setIsEmergency(false)}
                  />
                  <div>
                    <strong>Regular Cancellation</strong>
                    <p>
                      Downpayment is non-refundable. No refund will be issued.
                    </p>
                  </div>
                </label>

                <label className="cancel-option">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={isEmergency}
                    onChange={() => setIsEmergency(true)}
                  />
                  <div>
                    <strong>
                      Emergency Cancellation (with Refund Request)
                    </strong>
                    <p>
                      For emergencies like fire, flood, medical emergencies.
                      Refund will be reviewed.
                    </p>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label>Reason for cancellation:</label>
                <textarea
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={
                    isEmergency
                      ? "Please describe the emergency situation..."
                      : "Please tell us why you're cancelling..."
                  }
                  className="cancel-reason-input"
                />
              </div>

              {/* File Upload for Proof - Only show for Emergency */}
              {isEmergency && (
                <div className="form-group proof-upload">
                  <label>Upload Proof (Required for Refund Request):</label>
                  <p className="proof-help-text">
                    Please upload a photo of the emergency situation (fire,
                    flood, medical certificate, etc.)
                  </p>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={proofInputRef}
                    onChange={handleProofChange}
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    className="proof-file-input-hidden"
                    id="proof-file-input"
                  />

                  {/* Icon button to trigger file upload */}
                  <label
                    htmlFor="proof-file-input"
                    className="proof-upload-btn"
                  >
                    <i className="fas fa-camera"></i>
                    <span>{proofFile ? "Change Photo" : "Upload Photo"}</span>
                  </label>

                  {proofFile && (
                    <div className="proof-file-name">
                      <i className="fas fa-image"></i>
                      <span>{proofFile.name}</span>
                      <button
                        type="button"
                        onClick={removeProof}
                        className="remove-proof-icon"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}

                  {proofPreview && (
                    <div className="proof-preview-mini">
                      <img src={proofPreview} alt="Proof preview" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmCancel}
                disabled={cancelling || (isEmergency && !proofFile)}
              >
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;