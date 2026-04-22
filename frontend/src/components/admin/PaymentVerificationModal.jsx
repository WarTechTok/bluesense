// src/components/admin/PaymentVerificationModal.jsx

import React, { useState } from 'react';
import './PaymentVerificationModal.css';

// Add the backend URL constant
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://bluesense.onrender.com';

const PaymentVerificationModal = ({ isOpen, booking, onClose, onVerify, onReject }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen || !booking) return null;

  // Debug log to check if paymentProof exists
  console.log('📋 Payment Verification Modal opened');
  console.log('📋 Booking data:', booking);
  console.log('📋 Payment Proof:', booking.paymentProof);
  console.log('📋 Backend URL:', BACKEND_URL);

  // Helper function to get full payment proof URL
  const getPaymentProofUrl = (paymentProof) => {
    if (!paymentProof) {
      console.warn('⚠️ No payment proof available - field is empty or null');
      return null;
    }
    
    // If it's already a full URL, return it
    if (paymentProof.startsWith('http')) {
      console.log('✅ Using full URL:', paymentProof);
      return paymentProof;
    }
    
    // If it's a relative path starting with /, construct the full URL
    const cleanedUrl = paymentProof.startsWith('/') ? paymentProof : `/${paymentProof}`;
    
    // For localhost/development, use http
    // For production, use https
    const protocol = BACKEND_URL.includes('localhost') ? 'http' : 'https';
    const baseUrl = BACKEND_URL.replace(/^https?:\/\//, ''); // Remove protocol if exists
    const fullUrl = `${protocol}://${baseUrl}${cleanedUrl}`;
    
    console.log('✅ Constructed URL:', fullUrl);
    console.log('  - Backend URL:', BACKEND_URL);
    console.log('  - Payment Proof from DB:', paymentProof);
    console.log('  - Cleaned Path:', cleanedUrl);
    
    return fullUrl;
  };

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
                <span>{booking.paymentType === 'fullpayment' ? 'Full Payment' : 'Down Payment'}</span>
              </div>
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">
                  ₱{booking.paymentType === 'fullpayment' 
                    ? booking.totalAmount?.toLocaleString() 
                    : booking.downpayment?.toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <label>Payment Status:</label>
                <span className={`status-badge status-${booking.paymentStatus?.toLowerCase()}`}>
                  {booking.paymentStatus}
                </span>
              </div>
              {booking.paymentStatus === 'Partial' && (
                <>
                  <div className="info-item">
                    <label>Remaining Balance:</label>
                    <span className="amount">₱{(booking.totalAmount - booking.downpayment)?.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Amount:</label>
                    <span className="amount">₱{booking.totalAmount?.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Proof - FIXED IMAGE URL */}
          {booking.paymentProof ? (
            <div className="verification-section">
              <h3>Payment Proof</h3>
              <div style={{fontSize: '12px', color: '#64748b', marginBottom: '10px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px'}}>
                <div>📂 Stored Path: {booking.paymentProof}</div>
              </div>
              <div className="proof-container">
                {!imageLoaded && (
                  <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>
                    Loading image...
                  </div>
                )}
                <img 
                  src={getPaymentProofUrl(booking.paymentProof)} 
                  alt="Payment Proof" 
                  className="proof-image"
                  style={{display: imageLoaded ? 'block' : 'none'}}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully');
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    console.error('❌ Failed to load image. Tried URL:', getPaymentProofUrl(booking.paymentProof));
                    e.target.style.display = 'none';
                    e.target.onerror = null;
                  }}
                />
                <p className="proof-hint">Click image to view full size</p>
              </div>
            </div>
          ) : (
            <div className="verification-section">
              <h3>Payment Proof</h3>
              <div className="proof-container">
                <p style={{color: '#ef4444', textAlign: 'center'}}>
                  ⚠️ No payment proof uploaded
                </p>
                <p style={{color: '#64748b', fontSize: '12px', textAlign: 'center'}}>
                  Database shows: {booking.paymentProof === null ? 'NULL' : booking.paymentProof === undefined ? 'UNDEFINED' : 'UNKNOWN'}
                </p>
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
            {isVerifying ? 'Verifying...' : booking.paymentStatus === 'Partial' ? 'Verify Final Payment' : 'Verify & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;