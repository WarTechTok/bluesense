// src/components/modals/BookingSuccessModal.jsx
// ============================================
// BOOKING SUCCESS MODAL - Shows after successful booking
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';

function BookingSuccessModal({ isOpen, onClose, bookingDetails }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewBookings = () => {
    onClose();
    navigate('/my-bookings');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Success Icon */}
        <div className="success-icon-wrapper">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>

        {/* Title */}
        <h2 className="success-title">Booking Confirmed!</h2>
        <p className="success-message">
          Your reservation has been successfully submitted.
        </p>

        {/* Booking Details */}
        {bookingDetails && (
          <div className="booking-details-card">
            <div className="booking-details-header">
              <i className="fas fa-receipt"></i>
              <span>Booking Reference</span>
            </div>
            <div className="booking-id">{bookingDetails.bookingId}</div>
            
            <div className="booking-details-grid">
              <div className="detail-item">
                <span className="detail-label">Oasis:</span>
                <span className="detail-value">{bookingDetails.oasis}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Package:</span>
                <span className="detail-value">{bookingDetails.package}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Session:</span>
                <span className="detail-value">{bookingDetails.session}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check-in:</span>
                <span className="detail-value">{bookingDetails.checkIn}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Guests:</span>
                <span className="detail-value">{bookingDetails.guests} persons</span>
              </div>
              {bookingDetails.paymentType === 'downpayment' && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₱{bookingDetails.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Downpayment:</span>
                    <span className="detail-value">₱{bookingDetails.downpayment?.toLocaleString()}</span>
                  </div>
                </>
              )}
              {bookingDetails.paymentType === 'fullpayment' && (
                <div className="detail-item">
                  <span className="detail-label">Total Amount Paid:</span>
                  <span className="detail-value">₱{bookingDetails.totalAmount?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="important-notes">
          <p className="notes-title">
            <i className="fas fa-info-circle"></i>
            Important Reminders:
          </p>
          <ul>
            <li>Please present your booking reference upon arrival</li>
            {bookingDetails.paymentType === 'downpayment' && (
              <>
                <li>Downpayment is non-refundable</li>
                <li>Balance must be paid upon check-in</li>
              </>
            )}
            {bookingDetails.paymentType === 'fullpayment' && (
              <li>Full payment is non-refundable</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="success-modal-actions">
          <button className="btn-secondary" onClick={handleGoHome}>
            <i className="fas fa-home"></i>
            Go to Home
          </button>
          <button className="btn-primary" onClick={handleViewBookings}>
            <i className="fas fa-bookmark"></i>
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccessModal;