// frontend/src/components/modals/PendingBookingModal.jsx

import React from 'react';

const PendingBookingModal = ({ isOpen, onClose, onViewBookings }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '450px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          animation: 'modalFadeIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div 
            style={{
              width: '60px',
              height: '60px',
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <i className="fas fa-clock" style={{ color: '#f59e0b', fontSize: '28px' }}></i>
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
            Pending Booking Detected
          </h2>
          
          <p style={{ color: '#475569', marginBottom: '8px', lineHeight: '1.5' }}>
            You have a pending booking that requires payment completion.
          </p>
          
          <p style={{ color: '#475569', marginBottom: '16px', lineHeight: '1.5' }}>
            Please complete your payment first before creating a new booking.
          </p>
          
          <div 
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '8px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <i className="fas fa-info-circle" style={{ color: '#0284c7', width: '18px' }}></i>
              <span style={{ fontSize: '13px', color: '#475569' }}>Pending bookings expire after 7 days</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-credit-card" style={{ color: '#0284c7', width: '18px' }}></i>
              <span style={{ fontSize: '13px', color: '#475569' }}>Complete payment to confirm your reservation</span>
            </div>
          </div>
        </div>
        
        <div 
          style={{
            padding: '16px 24px 24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
            onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
          >
            <i className="fas fa-times"></i> Close
          </button>
          <button
            onClick={onViewBookings}
            style={{
              padding: '10px 20px',
              background: '#0284c7',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#0369a1'}
            onMouseLeave={(e) => e.target.style.background = '#0284c7'}
          >
            <i className="fas fa-calendar-alt"></i> View My Bookings
          </button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PendingBookingModal;