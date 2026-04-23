// frontend/src/components/modals/DoubleBookingModal.jsx
import React from 'react';
import './Modal.css';

const DoubleBookingModal = ({ isOpen, onClose, onSelectAnotherDate }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#f59e0b' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            Booking Conflict
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}>
            <i className="fas fa-calendar-times"></i>
          </div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            This date and session was just booked by another customer.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '0' }}>
            Please select another date or session to continue with your booking.
          </p>
        </div>
        
        <div className="modal-actions">
          <button className="modal-action-btn confirm" onClick={onSelectAnotherDate}>
            <i className="fas fa-calendar-alt"></i> Choose Another Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoubleBookingModal;