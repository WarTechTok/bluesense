// src/pages/booking/MyBookings.jsx
// ============================================
// MY BOOKINGS - Shows logged-in user's bookings
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import LeaveReviewModal from "../../components/modals/LeaveReviewModal";
import { checkReviewed } from "../../services/reviews";
import "./MyBookings.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget]       = useState(null);
  const [reviewedIds, setReviewedIds]         = useState({});
  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();

      const processedBookings = data.map((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (
          bookingDate < today &&
          (booking.status === "Confirmed" || booking.status === "Pending")
        ) {
          return { ...booking, displayStatus: "Completed" };
        }
        return { ...booking, displayStatus: booking.status };
      });

      setBookings(processedBookings);

      const completedBookings = processedBookings.filter(
        (b) => b.displayStatus === "Completed"
      );
      const reviewChecks = await Promise.all(
        completedBookings.map((b) =>
          checkReviewed(b._id)
            .then((r) => [b._id, r.reviewed])
            .catch(() => [b._id, false])
        )
      );
      setReviewedIds(Object.fromEntries(reviewChecks));

      if (processedBookings.length === 0) {
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

  const getBookingReference = (booking) => {
    if (!booking) return "N/A";
    return (
      booking.bookingReference ||
      booking.referenceNumber ||
      booking._id?.slice(-6).toUpperCase() ||
      booking.id?.slice(-6).toUpperCase() ||
      "N/A"
    );
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
      case "Pending":   return "#f59e0b";
      case "Confirmed": return "#10b981";
      case "Cancelled": return "#ef4444";
      case "Completed": return "#0284c7";
      default:          return "#64748b";
    }
  };

  // ─── Lightbox helpers ──────────────────────────────────────────────────────
  const openLightbox = (url) => setLightboxUrl(url);
  const closeLightbox = () => setLightboxUrl(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeLightbox(); };
    if (lightboxUrl) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  // ─── Render ───────────────────────────────────────────────────────────────
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
                        style={{ backgroundColor: getStatusColor(booking.displayStatus) }}
                      >
                        {booking.displayStatus}
                      </span>
                    </div>

                    <div className="booking-card-body">
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Booking Ref:</span>
                        <span className="value">{getBookingReference(booking)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Guests:</span>
                        <span className="value">{booking.pax} persons</span>
                      </div>
                      <div className="info-row">
                        <span className="label">
                          {booking.paymentType === "fullpayment" ? "Total Amount" : "Down Payment"}:
                        </span>
                        <span className="value">
                          {formatCurrency(
                            booking.paymentType === "fullpayment"
                              ? booking.totalAmount
                              : booking.downpayment
                          )}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Payment Status:</span>
                        <span className="value">{booking.paymentStatus || "Pending"}</span>
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
                      <button className="btn-view" onClick={() => handleViewDetails(booking)}>
                        View Details
                      </button>
                      {booking.displayStatus === "Completed" &&
                        (reviewedIds[booking._id] ? (
                          <span className="btn-reviewed">✓ Reviewed</span>
                        ) : (
                          <button
                            className="btn-leave-review"
                            onClick={() => {
                              setReviewTarget(booking);
                              setShowReviewModal(true);
                            }}
                          >
                            Leave a Review
                          </button>
                        ))}
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

      {/* ── Booking Details Modal ──────────────────────────────────────────── */}
      {showModal && selectedBooking && (
        <div className="modal-overlay my-bookings-modal" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">

              {/* Customer Information */}
              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Full Name</span>
                    <span className="value">{selectedBooking.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email Address</span>
                    <span className="value">{selectedBooking.customerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact Number</span>
                    <span className="value">{selectedBooking.customerContact || "N/A"}</span>
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
                      style={{ fontWeight: "bold", fontSize: "1.1em", color: "#00a8e8" }}
                    >
                      {getBookingReference(selectedBooking)}
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
                    <span className="value">{formatDate(selectedBooking.bookingDate)}</span>
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
                    <span className="label">Total Amount</span>
                    <span className="value">{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  {selectedBooking.paymentType !== "fullpayment" && (
                    <div className="detail-item">
                      <span className="label">Down Payment</span>
                      <span className="value">{formatCurrency(selectedBooking.downpayment)}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Payment Method</span>
                    <span className="value">{selectedBooking.paymentMethod || "Cash"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Type</span>
                    <span className="value">
                      {selectedBooking.paymentType === "fullpayment" ? "Full Payment" : "Down Payment"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Status</span>
                    <span className="value">{selectedBooking.paymentStatus || "Pending"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Status</span>
                    <span
                      className="value"
                      style={{ color: getStatusColor(selectedBooking.displayStatus || selectedBooking.status) }}
                    >
                      {selectedBooking.displayStatus || selectedBooking.status}
                    </span>
                  </div>
                  {getBalance(selectedBooking) > 0 && (
                    <div className="detail-item">
                      <span className="label">Balance Due</span>
                      <span className="value" style={{ fontWeight: "bold", color: "#f59e0b" }}>
                        {formatCurrency(getBalance(selectedBooking))}
                      </span>
                    </div>
                  )}

                  {/* ── Proof of Payment ─────────────────────────────────── */}
                  <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span className="label">Proof of Payment</span>
                    {selectedBooking.paymentProof ? (
                      <div style={{ marginTop: "6px" }}>
                        {/* Thumbnail — click to enlarge */}
                        <img
                          src={selectedBooking.paymentProof}
                          alt="Proof of Payment"
                          onClick={() => openLightbox(selectedBooking.paymentProof)}
                          style={{
                            width: "110px",
                            height: "110px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "2px solid #e2e8f0",
                            cursor: "zoom-in",
                            display: "block",
                            transition: "transform 0.15s, box-shadow 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.04)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "5px",
                            fontSize: "0.7rem",
                            color: "#0284c7",
                            cursor: "pointer",
                          }}
                          onClick={() => openLightbox(selectedBooking.paymentProof)}
                        >
                          Click to enlarge
                        </span>
                      </div>
                    ) : (
                      <span className="value" style={{ color: "#94a3b8", fontStyle: "italic" }}>
                        No proof uploaded
                      </span>
                    )}
                  </div>
                  {/* ── End Proof of Payment ─────────────────────────────── */}
                </div>
              </div>

              {/* Special Requests */}
              <div className="detail-section">
                <h4>Special Requests</h4>
                <p className="special-request">
                  {selectedBooking.specialRequests && selectedBooking.specialRequests.trim()
                    ? selectedBooking.specialRequests
                    : "None"}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              {selectedBooking && selectedBooking.displayStatus === "Completed" &&
                (reviewedIds[selectedBooking._id] ? (
                  <span className="btn-reviewed">✓ Reviewed</span>
                ) : (
                  <button
                    className="btn-leave-review"
                    onClick={() => {
                      setReviewTarget(selectedBooking);
                      handleCloseModal();
                      setShowReviewModal(true);
                    }}
                  >
                    Leave a Review
                  </button>
                ))}
              <button className="btn-close-modal" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              fontSize: "1.4rem",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Full image — stop propagation so clicking image doesn't close */}
          <img
            src={lightboxUrl}
            alt="Proof of Payment (enlarged)"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "82vh",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />

          {/* Open in new tab */}
          <a
            href={lightboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "#93c5fd",
              fontSize: "0.82rem",
              textDecoration: "underline",
            }}
          >
            Open full image in new tab ↗
          </a>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", margin: 0 }}>
            Click anywhere outside the image or press Esc to close
          </p>
        </div>
      )}

      {/* Leave Review Modal */}
      {showReviewModal && reviewTarget && (
        <LeaveReviewModal
          booking={reviewTarget}
          onClose={() => { setShowReviewModal(false); setReviewTarget(null); }}
          onSuccess={() => {
            setReviewedIds((prev) => ({ ...prev, [reviewTarget._id]: true }));
            setShowReviewModal(false);
            setReviewTarget(null);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default MyBookings;