// src/pages/booking/MyBookings.jsx
// ============================================
// MY BOOKINGS - Shows logged-in user's bookings
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./MyBookings.css";

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  // 🔴 CANCEL BUTTON REMOVED - Customers cannot cancel bookings
  // They must contact the resort directly for any cancellation requests

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
                      {/* 🔴 CANCEL BUTTON REMOVED */}
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
                        : "Downpayment"}
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
    </>
  );
};

export default MyBookings;