// frontend/src/pages/booking/ReviewStep.jsx
// ============================================
// REVIEW STEP - Review booking details before confirmation
// ============================================

import React, { useState } from 'react';

function ReviewStep({ 
  formData, 
  selectedOasis, 
  selectedPackage, 
  selectedSession, 
  nights, 
  pricePerNight, 
  totalPrice, 
  addonsTotal, 
  downpayment, 
  selectedAddons, 
  errors, 
  handleChange 
}) {
  
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Get session display name
  const getSessionName = (session) => {
    const sessions = {
      'Day': 'Day Session (8AM - 5PM)',
      'Night': 'Night Session (6PM - 6AM)',
      '22hrs': '22-Hour Session (Flexible)'
    };
    return sessions[session] || session;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="review-step">
        <h3 className="section-title">Review Your Booking</h3>
        <p className="section-subtitle">Please check your details before confirming</p>
        
        {/* Booking Details Grid */}
        <div className="review-grid">
          
          {/* Oasis & Package Info */}
          <div className="review-card">
            <h4>Booking Details</h4>
            <div className="review-item">
              <span>Oasis:</span>
              <strong>{selectedOasis}</strong>
            </div>
            <div className="review-item">
              <span>Package:</span>
              <strong>{selectedPackage}</strong>
            </div>
            <div className="review-item">
              <span>Session:</span>
              <strong>{getSessionName(selectedSession)}</strong>
            </div>
            <div className="review-item">
              <span>Date:</span>
              <strong>{formatDate(formData.reservationDate)}</strong>
            </div>
            <div className="review-item">
              <span>Guests:</span>
              <strong>{formData.guestCount} persons</strong>
            </div>
          </div>

          {/* Customer Info */}
          <div className="review-card">
            <h4>Customer Information</h4>
            <div className="review-item">
              <span>Full Name:</span>
              <strong>{formData.fullName || '—'}</strong>
            </div>
            <div className="review-item">
              <span>Email:</span>
              <strong>{formData.email || '—'}</strong>
            </div>
            <div className="review-item">
              <span>Phone:</span>
              <strong>{formData.phone || '—'}</strong>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="review-card">
            <h4>Payment Summary</h4>
            <div className="review-item">
              <span>Package Rate:</span>
              <strong>₱{pricePerNight.toLocaleString()}</strong>
            </div>
            {addonsTotal > 0 && (
              <div className="review-item">
                <span>Add-ons:</span>
                <strong>₱{addonsTotal.toLocaleString()}</strong>
              </div>
            )}
            <div className="review-item total">
              <span>Total Amount:</span>
              <strong>₱{totalPrice.toLocaleString()}</strong>
            </div>
            {formData.paymentType === 'downpayment' && (
              <div className="review-item downpayment">
                <span>Downpayment (30%):</span>
                <strong>₱{downpayment.toLocaleString()}</strong>
              </div>
            )}
            {formData.paymentType === 'fullpayment' && (
              <div className="review-item downpayment">
                <span>Payment Type:</span>
                <strong>Full Payment (No Balance Due)</strong>
              </div>
            )}
          </div>

          {/* Add-ons List */}
          {Object.keys(selectedAddons).length > 0 && (
            <div className="review-card">
              <h4>Selected Add-ons</h4>
              {Object.entries(selectedAddons).map(([name, price]) => (
                <div key={name} className="review-item">
                  <span>{name}:</span>
                  <strong>+ ₱{price.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Special Requests */}
          {formData.specialRequests && (
            <div className="review-card full-width">
              <h4>Special Requests</h4>
              <p className="special-request-text">{formData.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="terms-section">
          <div className="terms-checkbox">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              id="agreeTerms"
            />
            <label htmlFor="agreeTerms">
              I agree to the <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>Terms and Conditions</button>
            </label>
          </div>
          {errors.agreeTerms && (
            <span className="error-message">{errors.agreeTerms}</span>
          )}
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-container terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terms and Conditions</h3>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>✕</button>
            </div>
            <div className="modal-body terms-modal-body">
              <div className="terms-content">
                <h4>1. Booking and Payment</h4>
              {formData.paymentType === 'downpayment' ? (
                <>
                  <p>A downpayment (30%) is required to secure your reservation. The remaining balance must be paid upon arrival.</p>
                  <p>Your downpayment amount: ₱{downpayment.toLocaleString()}</p>
                </>
              ) : (
                <p>Full payment is required upfront. No additional payment is needed upon arrival.</p>
              )}
              
              <h4>2. Cancellation and Refunds</h4>
              {formData.paymentType === 'downpayment' ? (
                <p>Downpayment is non-refundable. Rescheduling is allowed at least 1 week before the booking date.</p>
              ) : (
                <p>Full payment is non-refundable. Rescheduling is allowed at least 1 week before the booking date.</p>
              )}
                
                <h4>3. Check-in / Check-out</h4>
                <p>Check-in: 8:00 AM | Check-out: 6:00 PM for Day session.<br/>
                Night session: 6:00 PM - 6:00 AM<br/>
                22-hour session: Flexible based on your arrival time.</p>
                
                <h4>4. Guest Capacity</h4>
                <p>Please adhere to the maximum capacity of your chosen package. Extra persons beyond capacity will be charged ₱150 per person.</p>
                
                <h4>5. Incidental Fee</h4>
                <p>A refundable incidental fee of ₱1,000 is collected before check-in.</p>
                
                <h4>6. Valid ID</h4>
                <p>Please present 1 valid government-issued ID upon arrival.</p>
                
                <h4>7. Property Rules</h4>
                <p>Smoking is only allowed in designated areas. Please maintain cleanliness and respect the property.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setShowTermsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReviewStep;