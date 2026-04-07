// frontend/src/pages/booking/BookingSummary.jsx
import React from 'react';

const BookingSummary = ({ 
  selectedOasis, 
  selectedPackage, 
  selectedSession, 
  packageData, 
  formData, 
  nights, 
  pricePerNight, 
  totalPrice,
  addonsTotal,
  downpayment
}) => {
  return (
    <div className="booking-summary">
      <div className="summary-header">
        <i className="fas fa-leaf"></i>
        <h3>Booking Summary</h3>
        <p>Your reservation details</p>
      </div>
      <div className="summary-content">
        <div className="summary-item">
          <span className="label">Location</span>
          <span className="value">{selectedOasis || '—'}</span>
        </div>
        
        {selectedPackage && (
          <div className="summary-item">
            <span className="label">Package</span>
            <span className="value">{selectedPackage}</span>
          </div>
        )}
        
        {selectedSession && (
          <div className="summary-item">
            <span className="label">Session</span>
            <span className="value">{selectedSession}</span>
          </div>
        )}
        
        {formData.reservationDate && (
          <>
            <div className="summary-item">
              <span className="label">Date</span>
              <span className="value">
                {new Date(formData.reservationDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="label">Guests</span>
              <span className="value">{formData.guestCount} {formData.guestCount === 1 ? 'person' : 'persons'}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-item">
              <span className="label">Package Rate</span>
              <span className="value">₱{pricePerNight.toLocaleString()}</span>
            </div>
            
            {addonsTotal > 0 && (
              <div className="summary-item">
                <span className="label">Add-ons</span>
                <span className="value">₱{addonsTotal.toLocaleString()}</span>
              </div>
            )}
            
            <div className="summary-total">
              <span className="label">Total Amount</span>
              <span className="value">₱{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="summary-downpayment">
              <span className="label">Downpayment Required</span>
              <span className="downpayment-amount">₱{downpayment.toLocaleString()}</span>
            </div>
            
            <div className="summary-note">
              <i className="fas fa-info-circle"></i>
              <span>Pay the downpayment to confirm your booking</span>
            </div>
          </>
        )}
        
        {!formData.reservationDate && (
          <div className="summary-empty">
            <i className="far fa-calendar-plus"></i>
            <p>Select your package and date to see pricing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;