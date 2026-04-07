import React from 'react';

const BookingSummary = ({ packageData, oasis, formData, nights, pricePerNight, totalPrice, priceType }) => {
  return (
    <div className="booking-summary-card">
      <div className="summary-header">
        <i className="fas fa-leaf"></i>
        <h3>Booking Summary</h3>
      </div>
      <div className="summary-details">
        <div className="summary-row">
          <span className="summary-label">Package</span>
          <span className="summary-value">{packageData.name || 'Selected Package'}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Location</span>
          <span className="summary-value">{oasis || "Catherine's Oasis"}</span>
        </div>
        {formData.reservationDate && (
          <>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span className="summary-label">Check-in</span>
              <span className="summary-value">{new Date(formData.reservationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {formData.checkoutDate && (
              <div className="summary-row">
                <span className="summary-label">Check-out</span>
                <span className="summary-value">{new Date(formData.checkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            {nights > 0 && (
              <div className="summary-row">
                <span className="summary-label">Duration</span>
                <span className="summary-value">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Rate Type</span>
              <span className={`rate-badge ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>{priceType}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Guests</span>
              <span className="summary-value">{formData.guestCount} {formData.guestCount === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row price-breakdown">
              <span className="summary-label">Rate per night</span>
              <span className="summary-value">₱{pricePerNight.toLocaleString()}</span>
            </div>
            {nights > 0 && (
              <div className="summary-row price-breakdown">
                <span className="summary-label">Total ({nights} nights)</span>
                <span className="summary-value">₱{totalPrice.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span className="summary-label">Total Due</span>
              <span className="total-amount">₱{totalPrice.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
      {!formData.reservationDate && (
        <div className="summary-empty">
          <i className="far fa-calendar-plus"></i>
          <p>Select your dates to see pricing</p>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;