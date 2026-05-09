// src/pages/admin/BookingManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaymentVerificationModal from "../../components/admin/PaymentVerificationModal";
import AdminBookingForm from "./AdminBookingForm";
import * as adminApi from '../../services/admin';
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedBookingForVerification, setSelectedBookingForVerification] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  // Helper function to get display status based on date
  const getDisplayStatus = useCallback((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If booking date is in the past and status is Confirmed or Pending, show as Completed
    if (bookingDate < today && (booking.status === 'Confirmed' || booking.status === 'Pending')) {
      return 'Completed';
    }
    return booking.status;
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await adminApi.getAllBookings();
      console.log("Bookings data:", data);
      
      // Add displayStatus to each booking
      const bookingsWithDisplayStatus = data.map(booking => ({
        ...booking,
        displayStatus: getDisplayStatus(booking)
      }));
      
      setBookings(bookingsWithDisplayStatus);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showConfirmationModal("Error", "Failed to fetch bookings", null, "OK");
    }
  }, [getDisplayStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    let filtered = [...bookings];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.displayStatus === statusFilter || b.status === statusFilter);
    }
    
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((b) => {
        const bookingRef = (b.bookingReference || b._id?.slice(-6).toUpperCase() || "").toLowerCase();
        const customerName = (b.customerName || "").toLowerCase();
        return bookingRef.includes(term) || customerName.includes(term);
      });
    }
    
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchTerm]);

  const showConfirmationModal = (title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel") => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      confirmText,
      cancelText,
    });
  };

  const handleOpenModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
    } else {
      setEditingBooking(null);
    }
    setShowBookingForm(true);
  };

  const handleCancel = async (id) => {
    showConfirmationModal(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      async () => {
        try {
          await adminApi.updateBookingStatus(id, "Cancelled");
          fetchBookings();
          showConfirmationModal("Success", "Booking cancelled successfully!", null, "OK");
        } catch (error) {
          console.error("Error cancelling booking:", error);
          showConfirmationModal("Error", "Error cancelling booking", null, "OK");
        }
      },
      "Yes, Cancel",
      "No, Go Back",
    );
  };

  const handleComplete = async (id) => {
    showConfirmationModal(
      "Mark as Completed",
      "Has the customer completed their stay?",
      async () => {
        try {
          await adminApi.updateBookingStatus(id, "Completed");
          fetchBookings();
          showConfirmationModal("Success", "Booking marked as completed!", null, "OK");
        } catch (error) {
          console.error("Error completing booking:", error);
          showConfirmationModal("Error", "Error marking booking as completed", null, "OK");
        }
      },
      "Yes, Complete",
      "Cancel",
    );
  };

  const handleOpenPaymentVerification = (booking) => {
    setSelectedBookingForVerification(booking);
    setVerificationModalOpen(true);
  };

  const handleVerifyPayment = async (bookingId) => {
    try {
      const booking = bookings.find((b) => b._id === bookingId);
      await adminApi.verifyPayment(bookingId);
      
      fetchBookings();
      const message = booking.paymentStatus === "Partial"
        ? "Final payment verified successfully!"
        : "Payment verified successfully! Booking confirmed.";
      showConfirmationModal("Success", message, null, "OK");
    } catch (error) {
      console.error("Error verifying payment:", error);
      showConfirmationModal("Error", "Error verifying payment: " + error.message, null, "OK");
    }
  };

  const handleMarkAsFullyPaid = async (id) => {
    showConfirmationModal(
      "Mark as Fully Paid",
      "Has the customer paid the remaining balance?",
      async () => {
        try {
          await adminApi.updatePaymentStatus(id, "Paid");
          fetchBookings();
          showConfirmationModal("Success", "Booking marked as fully paid!", null, "OK");
        } catch (error) {
          console.error("Error marking as fully paid:", error);
          showConfirmationModal("Error", "Error marking as fully paid", null, "OK");
        }
      },
      "Yes, Mark as Paid",
      "Cancel",
    );
  };

  const handleRejectPayment = async (bookingId) => {
    showConfirmationModal(
      "Reject Payment",
      "Are you sure you want to reject this payment?",
      async () => {
        try {
          await adminApi.updatePaymentStatus(bookingId, "Rejected");
          fetchBookings();
          showConfirmationModal("Payment Rejected", "Payment has been rejected.", null, "OK");
        } catch (error) {
          console.error("Error rejecting payment:", error);
          showConfirmationModal("Error", "Error rejecting payment: " + error.message, null, "OK");
        }
      },
      "Yes, Reject",
      "Cancel",
    );
  };

  const handleBookingCreated = () => {
    setShowBookingForm(false);
    setEditingBooking(null);
    fetchBookings();
    showConfirmationModal("Success", editingBooking ? "Booking updated successfully!" : "Booking created successfully!", null, "OK");
  };

  const getBalance = (booking) => {
    if (!booking) return 0;
    if (booking.paymentType === "fullpayment") return 0;
    return (booking.totalAmount || 0) - (booking.downpayment || 0);
  };

  const getSessionDisplay = (session) => {
    if (!session) return "N/A";
    const sessionMap = {
      Day: "Day (8AM - 5PM)",
      Night: "Night (6PM - 6AM)",
      "22hrs": "22-Hour Session (Flexible)",
    };
    return sessionMap[session] || session;
  };

  const getActions = (booking) => {
    const actions = [];
    const displayStatus = booking.displayStatus || booking.status;

    // No actions available for cancelled or completed bookings
    if (booking.status === "Cancelled" || displayStatus === "Completed") {
      return actions;
    }

    if (booking.paymentStatus !== "Paid") {
      actions.push({
        label: "View Payment",
        icon: "📋",
        onClick: () => handleOpenPaymentVerification(booking),
        className: "btn-outline",
      });
    }

    if (booking.status === "Confirmed" && booking.paymentStatus === "Partial") {
      actions.push({
        label: "Mark as Paid",
        icon: "💰",
        onClick: () => handleMarkAsFullyPaid(booking._id),
        className: "btn-outline-success",
      });
    }

    if (booking.status === "Confirmed" && booking.paymentStatus === "Paid") {
      actions.push({
        label: "Mark Completed",
        icon: "✓",
        onClick: () => handleComplete(booking._id),
        className: "btn-outline-success",
      });
    }

    if (booking.status !== "Cancelled" && booking.status !== "Completed" && booking.paymentStatus !== "Paid") {
      actions.push({
        label: "Cancel",
        icon: "✕",
        onClick: () => handleCancel(booking._id),
        className: "btn-outline-danger",
      });
    }

    return actions;
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Booking Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Add Booking
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <label>Search:</label>
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by Booking Reference or Customer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{bookings.filter((b) => b.status === "Pending").length}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmed</h3>
          <p className="stat-number">{bookings.filter((b) => b.status === "Confirmed").length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{bookings.filter((b) => b.status === "Completed" || (b.displayStatus === "Completed" && b.status !== "Completed")).length}</p>
        </div>
        <div className="stat-card">
          <h3>Cancelled</h3>
          <p className="stat-number">{bookings.filter((b) => b.status === "Cancelled").length}</p>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>Booking ID</th>
              <th style={{ width: "150px" }}>Booking Reference</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Package</th>
              <th>Session</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ width: "220px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => {
              const actions = getActions(booking);
              const balance = getBalance(booking);
              const displayStatus = booking.displayStatus || booking.status;
              
              return (
                <tr key={booking._id}>
                  <td>{index + 1}</td>
                  <td>{booking.bookingReference || booking._id?.slice(-6).toUpperCase()}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.oasis}</td>
                  <td>{booking.package}</td>
                  <td>{getSessionDisplay(booking.session)}</td>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>
                    {booking.paymentStatus === "Partial" && balance > 0 ? (
                      <span className="status-badge status-partial">Partial (₱{balance.toLocaleString()} due)</span>
                    ) : (
                      <span className={`status-badge status-${booking.paymentStatus?.toLowerCase() || "pending"}`}>
                        {booking.paymentStatus || "Pending"}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${displayStatus?.toLowerCase()}`}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {actions.map((action, idx) => (
                      <button key={idx} className={action.className} onClick={action.onClick}>
                        <span className="btn-icon">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <AdminBookingForm
              editingBooking={editingBooking}
              onClose={() => setShowBookingForm(false)}
              onBookingCreated={handleBookingCreated}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={verificationModalOpen}
        booking={selectedBookingForVerification}
        onClose={() => {
          setVerificationModalOpen(false);
          setSelectedBookingForVerification(null);
        }}
        onVerify={handleVerifyPayment}
        onReject={handleRejectPayment}
      />
    </div>
  );
};

export default BookingManagement;