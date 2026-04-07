// src/components/modals/BookingSuccessModal.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';

function BookingSuccessModal({ isOpen, onClose, bookingDetails }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleViewBookings = () => {
    onClose();
    navigate('/my-bookings');
  };

  const handleBackToHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">
          <span className="checkmark">✓</span>
        </div>
        
        <h2 className="success-title">Booking Confirmed!</h2>
        
        <p className="success-message">
          Your reservation at <strong>{bookingDetails?.oasis || 'Catherine\'s Oasis'}</strong> has been successfully submitted.
        </p>
        
        <div className="booking-details">
          <div className="detail-row">
            <span>Booking ID:</span>
            <strong>{bookingDetails?.bookingId || '#' + Math.random().toString(36).substr(2, 8).toUpperCase()}</strong>
          </div>
          <div className="detail-row">
            <span>Check-in:</span>
            <strong>{bookingDetails?.checkIn || '—'}</strong>
          </div>
          <div className="detail-row">
            <span>Check-out:</span>
            <strong>{bookingDetails?.checkOut || '—'}</strong>
          </div>
          <div className="detail-row">
            <span>Guests:</span>
            <strong>{bookingDetails?.guests || '—'} persons</strong>
          </div>
        </div>
        
        <div className="success-note">
          <span>📧</span>
          <p>A confirmation email has been sent to your email address. We'll contact you within 24 hours.</p>
        </div>
        
        <div className="success-actions">
          <button className="btn-secondary" onClick={handleBackToHome}>
            Back to Home
          </button>
          <button className="btn-primary" onClick={handleViewBookings}>
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccessModal;