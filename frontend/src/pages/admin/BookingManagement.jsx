// src/pages/admin/BookingManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../components/admin/Modal";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaymentVerificationModal from "../../components/admin/PaymentVerificationModal";
import * as adminApi from "../../services/admin/adminApi";
import "./ManagementPages.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedBookingForVerification, setSelectedBookingForVerification] =
    useState(null);
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
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
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
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const showConfirmationModal = (
    title,
    message,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
  ) => {
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
          showConfirmationModal(
            "Success",
            "Booking cancelled successfully!",
            null,
            "OK",
          );
        } catch (error) {
          console.error("Error cancelling booking:", error);
          showConfirmationModal(
            "Error",
            "Error cancelling booking",
            null,
            "OK",
          );
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
          showConfirmationModal(
            "Success",
            "Booking marked as completed!",
            null,
            "OK",
          );
        } catch (error) {
          console.error("Error completing booking:", error);
          showConfirmationModal(
            "Error",
            "Error marking booking as completed",
            null,
            "OK",
          );
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
      const message =
        booking.paymentStatus === "Partial"
          ? "Final payment verified successfully! Full payment completed."
          : "Payment verified successfully! Booking confirmed.";
      showConfirmationModal("Success", message, null, "OK");
    } catch (error) {
      console.error("Error verifying payment:", error);
      showConfirmationModal(
        "Error",
        "Error verifying payment: " + error.message,
        null,
        "OK",
      );
    }
  };

  const handleRejectPayment = async (bookingId) => {
    showConfirmationModal(
      "Reject Payment",
      "Are you sure you want to reject this payment? The customer will need to resubmit.",
      async () => {
        try {
          await adminApi.updatePaymentStatus(bookingId, "Rejected");
          fetchBookings();
          showConfirmationModal(
            "Payment Rejected",
            "Payment has been rejected.",
            null,
            "OK",
          );
        } catch (error) {
          console.error("Error rejecting payment:", error);
          showConfirmationModal(
            "Error",
            "Error rejecting payment: " + error.message,
            null,
            "OK",
          );
        }
      },
      "Yes, Reject",
      "Cancel",
    );
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.customerName ||
        !formData.customerContact ||
        !formData.oasis ||
        !formData.package ||
        !formData.session ||
        !formData.bookingDate ||
        !formData.pax ||
        !formData.downpayment ||
        !formData.paymentMethod
      ) {
        showConfirmationModal(
          "Validation Error",
          "Please fill in all required fields",
          null,
          "OK",
        );
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
      showConfirmationModal(
        "Success",
        "Booking saved successfully!",
        null,
        "OK",
      );
    } catch (error) {
      console.error("Error saving booking:", error);
      showConfirmationModal(
        "Error",
        error.message || "Error saving booking",
        null,
        "OK",
      );
    }
  };

  // eslint-disable-next-line no-unused-vars
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

  const getSessionDisplay = (session) => {
    if (!session) return "N/A";
    const sessionMap = {
      Day: "🌅 Day (6AM - 5PM)",
      Night: "🌙 Night (5PM - 10PM)",
      "22hrs": "⏰ Whole Day (6AM - 4AM)",
    };
    return sessionMap[session] || session;
  };

  const columns = [
    {
      key: "index",
      label: "#",
      render: (value, row, index) => index + 1,
      width: "50px",
    },
    {
      key: "bookingReference",
      label: "Booking #",
      render: (value, row) => value || row._id?.slice(-6).toUpperCase(),
    },
    { key: "customerName", label: "Customer" },
    { key: "oasis", label: "Location" },
    { key: "package", label: "Package" },
    {
      key: "session",
      label: "Session",
      render: (value) => getSessionDisplay(value),
    },
    {
      key: "bookingDate",
      label: "Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value, row) => {
        const balance = getBalance(row);
        if (value === "Partial" && balance > 0) {
          return (
            <span className="status-badge status-partial">
              Partial (₱{balance.toLocaleString()} due)
            </span>
          );
        }
        return (
          <span
            className={`status-badge status-${value?.toLowerCase() || "pending"}`}
          >
            {value || "Pending"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`status-badge status-${value?.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
  ];

  // Consistent button styles - all same size and alignment
  const getActions = (booking) => {
    const actions = [];

    if (
      booking.paymentStatus === "Pending" ||
      booking.paymentStatus === "Partial" ||
      booking.paymentStatus === "Rejected"
    ) {
      actions.push({
        label: "View Payment",
        icon: "📋",
        onClick: () => handleOpenPaymentVerification(booking),
        className: "btn-outline",
      });
    }

    if (booking.status !== "Cancelled" && booking.status !== "Completed") {
      actions.push({
        label: "Cancel",
        icon: "✕",
        onClick: () => handleCancel(booking._id),
        className: "btn-outline-danger",
      });
    }

    if (booking.status === "Confirmed") {
      actions.push({
        label: "Complete",
        icon: "✓",
        onClick: () => handleComplete(booking._id),
        className: "btn-outline-success",
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
        <label>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">
            {bookings.filter((b) => b.status === "Pending").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Confirmed</h3>
          <p className="stat-number">
            {bookings.filter((b) => b.status === "Confirmed").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">
            {bookings.filter((b) => b.status === "Completed").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Cancelled</h3>
          <p className="stat-number">
            {bookings.filter((b) => b.status === "Cancelled").length}
          </p>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th style={{ width: "220px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => {
              const actions = getActions(booking);
              return (
                <tr key={booking._id}>
                  <td>{index + 1}</td>
                  <td>
                    {booking.bookingReference ||
                      booking._id?.slice(-6).toUpperCase()}
                  </td>
                  <td>{booking.customerName}</td>
                  <td>{booking.oasis}</td>
                  <td>{booking.package}</td>
                  <td>{getSessionDisplay(booking.session)}</td>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>
                    {booking.paymentStatus === "Partial" &&
                    getBalance(booking) > 0 ? (
                      <span className="status-badge status-partial">
                        Partial (₱{getBalance(booking).toLocaleString()} due)
                      </span>
                    ) : (
                      <span
                        className={`status-badge status-${booking.paymentStatus?.toLowerCase() || "pending"}`}
                      >
                        {booking.paymentStatus || "Pending"}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${booking.status?.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={action.className}
                        onClick={action.onClick}
                      >
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
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "600px", overflowY: "auto" }}
          >
            <form className="form landscape">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  value={formData.customerContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerContact: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <select
                  value={formData.oasis}
                  onChange={(e) =>
                    setFormData({ ...formData, oasis: e.target.value })
                  }
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Oasis 1">Oasis 1</option>
                  <option value="Oasis 2">Oasis 2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Package *</label>
                <input
                  type="text"
                  value={formData.package}
                  onChange={(e) =>
                    setFormData({ ...formData, package: e.target.value })
                  }
                  placeholder="e.g., Package 1, Package A"
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Slot (Session) *</label>
                <select
                  value={formData.session || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, session: e.target.value })
                  }
                  required
                >
                  <option value="">Select Time Slot</option>
                  <option value="Day">🌅 Day (6AM - 5PM)</option>
                  <option value="Night">🌙 Night (5PM - 10PM)</option>
                  <option value="22hrs">⏰ Whole Day (6AM - 4AM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Booking Date *</label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Pax *</label>
                <input
                  type="number"
                  value={formData.pax}
                  onChange={(e) =>
                    setFormData({ ...formData, pax: e.target.value })
                  }
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Down Payment *</label>
                <input
                  type="number"
                  value={formData.downpayment}
                  onChange={(e) =>
                    setFormData({ ...formData, downpayment: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  required
                >
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="GoTyme">GoTyme</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label>Booking Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingBooking ? "Update" : "Create"} Booking
            </button>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
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
