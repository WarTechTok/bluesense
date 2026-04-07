import React from 'react';

const ReviewStep = ({ formData, nights, pricePerNight, totalPrice, priceType, getPaymentMethodName, errors, handleChange }) => {
  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-clipboard-list"></i>
        <h2>Review Your Booking</h2>
        <p>Double-check your details before confirming</p>
      </div>
      <div className="review-grid">
        <div className="review-section">
          <h3><i className="fas fa-user"></i> Guest Information</h3>
          <div className="review-details">
            <div className="review-item"><span>Full Name</span><strong>{formData.fullName}</strong></div>
            <div className="review-item"><span>Email</span><strong>{formData.email}</strong></div>
            <div className="review-item"><span>Phone</span><strong>{formData.phone}</strong></div>
            <div className="review-item"><span>Guests</span><strong>{formData.guestCount} people</strong></div>
          </div>
        </div>
        <div className="review-section">
          <h3><i className="fas fa-calendar"></i> Stay Details</h3>
          <div className="review-details">
            <div className="review-item"><span>Check-in</span><strong>{formData.reservationDate ? new Date(formData.reservationDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</strong></div>
            <div className="review-item"><span>Check-out</span><strong>{formData.checkoutDate ? new Date(formData.checkoutDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</strong></div>
            <div className="review-item"><span>Duration</span><strong>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong></div>
            <div className="review-item"><span>Rate Type</span><strong className={`rate-badge-small ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>{priceType}</strong></div>
          </div>
        </div>
        <div className="review-section">
          <h3><i className="fas fa-receipt"></i> Payment Summary</h3>
          <div className="review-details">
            <div className="review-item"><span>Rate per night</span><strong>₱{pricePerNight.toLocaleString()}</strong></div>
            <div className="review-item"><span>Total ({nights} nights)</span><strong>₱{totalPrice.toLocaleString()}</strong></div>
            <div className="review-item"><span>Payment Method</span><strong>{getPaymentMethodName(formData.paymentMethod)}</strong></div>
          </div>
        </div>
        {formData.specialRequests && (
          <div className="review-section">
            <h3><i className="fas fa-comment"></i> Special Requests</h3>
            <div className="review-details"><p className="special-requests">{formData.specialRequests}</p></div>
          </div>
        )}
      </div>
      <div className="terms-card">
        <h3><i className="fas fa-file-contract"></i> Terms & Conditions</h3>
        <div className="terms-content">
          <ul>
            <li><i className="fas fa-exchange-alt"></i> <strong>Non-refundable but can be rebooked</strong> (only 1 rebook attempt allowed, applicable for weekdays only)</li>
            <li><i className="fas fa-envelope"></i> Booking confirmation will be sent within 24 hours</li>
            <li><i className="fas fa-clock"></i> Please arrive 15 minutes before your check-in time</li>
            <li><i className="fas fa-calendar-minus"></i> Cancellation must be made at least 7 days before reservation date</li>
            <li><i className="fas fa-credit-card"></i> Payment must be completed before arrival for e-wallet payments</li>
          </ul>
        </div>
        <div className="terms-checkbox">
          <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
          <label htmlFor="agreeTerms">I have read and agree to the terms and conditions above <span className="required">*</span></label>
        </div>
        {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
      </div>
    </div>
  );
};

export default ReviewStep;