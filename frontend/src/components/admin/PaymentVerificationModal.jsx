// frontend/src/components/admin/PaymentVerificationModal.jsx
// ============================================
// PAYMENT VERIFICATION MODAL - View payment proof and verify
// ============================================

import React, { useState } from 'react';
import './PaymentVerificationModal.css';

const PaymentVerificationModal = ({ isOpen, booking, onClose, onVerify, onReject }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleVerifyClick = async () => {
    setIsVerifying(true);
    try {
      await onVerify(booking._id);
      setIsVerifying(false);
      onClose();
    } catch (error) {
      setIsVerifying(false);
    }
  };

  const handleRejectClick = async () => {
    setIsRejecting(true);
    try {
      await onReject(booking._id);
      setIsRejecting(false);
      onClose();
    } catch (error) {
      setIsRejecting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Payment Verification</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Customer Information */}
          <div className="verification-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{booking.customerName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{booking.customerEmail}</span>
              </div>
              <div className="info-item">
                <label>Contact:</label>
                <span>{booking.customerContact}</span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="verification-section">
            <h3>Booking Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Venue:</label>
                <span>{booking.oasis}</span>
              </div>
              <div className="info-item">
                <label>Package:</label>
                <span>{booking.package}</span>
              </div>
              <div className="info-item">
                <label>Date:</label>
                <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Guests:</label>
                <span>{booking.pax} persons</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="verification-section">
            <h3>Payment Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Payment Method:</label>
                <span>{booking.paymentMethod}</span>
              </div>
              <div className="info-item">
                <label>Payment Type:</label>
                <span>{booking.paymentType === 'fullpayment' ? 'Full Payment' : 'Down Payment (30%)'}</span>
              </div>
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">₱{(booking.paymentType === 'fullpayment' ? booking.totalAmount : booking.downpayment)?.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Payment Status:</label>
                <span className={`status-badge status-${booking.paymentStatus?.toLowerCase()}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {booking.paymentProof && (
            <div className="verification-section">
              <h3>Payment Proof</h3>
              <div className="proof-container">
                <img 
                  src={booking.paymentProof} 
                  alt="Payment Proof" 
                  className="proof-image"
                />
              </div>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="verification-section">
              <h3>Special Requests</h3>
              <p className="special-requests">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-footer">
          <button 
            className="btn-reject"
            onClick={handleRejectClick}
            disabled={isRejecting || booking.paymentStatus === 'Paid'}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Payment'}
          </button>
          <button 
            className="btn-close"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="btn-verify"
            onClick={handleVerifyClick}
            disabled={isVerifying || booking.paymentStatus === 'Paid'}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;
