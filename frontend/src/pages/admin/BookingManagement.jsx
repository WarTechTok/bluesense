// src/pages/admin/BookingManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../components/admin/Modal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaymentVerificationModal from "../../components/admin/PaymentVerificationModal";
import * as adminApi from '../../services/admin';
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    customerEmail: "",
    oasis: "",
    package: "",
    session: "",
    bookingDate: "",
    pax: "1",
    downpayment: "",
    paymentMethod: "GCash",
    paymentStatus: "Pending",
    status: "Pending",
  });

  const fetchBookings = useCallback(async () => {
    try {
      const data = await adminApi.getAllBookings();
      console.log("Bookings data:", data);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showConfirmationModal("Error", "Failed to fetch bookings", null, "OK");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    let filtered = [...bookings];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
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
      setFormData(booking);
    } else {
      setEditingBooking(null);
      setFormData({
        customerName: "",
        customerContact: "",
        customerEmail: "",
        oasis: "",
        package: "",
        session: "",
        bookingDate: "",
        pax: "1",
        downpayment: "",
        paymentMethod: "GCash",
        paymentStatus: "Pending",
        status: "Pending",
      });
    }
    setIsModalOpen(true);
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

  const handleSubmit = async () => {
    try {
      if (!formData.customerName || !formData.customerContact || !formData.oasis || !formData.package || !formData.session || !formData.bookingDate || !formData.pax || !formData.downpayment || !formData.paymentMethod) {
        showConfirmationModal("Validation Error", "Please fill in all required fields", null, "OK");
        return;
      }

      const bookingPayload = {
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        customerEmail: formData.customerEmail,
        oasis: formData.oasis,
        package: formData.package,
        session: formData.session,
        bookingDate: formData.bookingDate,
        pax: parseInt(formData.pax),
        downpayment: parseFloat(formData.downpayment),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus || "Pending",
        status: formData.status || "Pending",
      };

      if (editingBooking) {
        bookingPayload._id = editingBooking._id;
        await adminApi.createBooking(bookingPayload);
      } else {
        await adminApi.createBooking(bookingPayload);
      }
      setIsModalOpen(false);
      fetchBookings();
      showConfirmationModal("Success", "Booking saved successfully!", null, "OK");
    } catch (error) {
      console.error("Error saving booking:", error);
      showConfirmationModal("Error", error.message || "Error saving booking", null, "OK");
    }
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
          <p className="stat-number">{bookings.filter((b) => b.status === "Completed").length}</p>
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
                    <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                      {booking.status}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h3>{editingBooking ? "✎ Edit Booking" : "➕ Add New Booking"}</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: "600px", overflowY: "auto" }}>
            <form className="form landscape">
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Contact Number *</label>
                <input type="tel" value={formData.customerContact} onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <select value={formData.oasis} onChange={(e) => setFormData({ ...formData, oasis: e.target.value })} required>
                  <option value="">Select Location</option>
                  <option value="Oasis 1">Oasis 1</option>
                  <option value="Oasis 2">Oasis 2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Package *</label>
                <input type="text" value={formData.package} onChange={(e) => setFormData({ ...formData, package: e.target.value })} placeholder="e.g., Package 1, Package A" required />
              </div>
              <div className="form-group">
                <label>Time Slot (Session) *</label>
                <select value={formData.session || ""} onChange={(e) => setFormData({ ...formData, session: e.target.value })} required>
                  <option value="">Select Time Slot</option>
                  <option value="Day">Day (6AM - 5PM)</option>
                  <option value="Night">Night (5PM - 10PM)</option>
                  <option value="22hrs">Whole Day (6AM - 4AM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Booking Date *</label>
                <input type="date" value={formData.bookingDate} onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Number of Pax *</label>
                <input type="number" value={formData.pax} onChange={(e) => setFormData({ ...formData, pax: e.target.value })} min="1" required />
              </div>
              <div className="form-group">
                <label>Down Payment *</label>
                <input type="number" value={formData.downpayment} onChange={(e) => setFormData({ ...formData, downpayment: e.target.value })} min="0" step="0.01" required />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} required>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="GoTyme">GoTyme</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label>Booking Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>{editingBooking ? "Update" : "Create"} Booking</button>
          </div>
        </Modal>
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