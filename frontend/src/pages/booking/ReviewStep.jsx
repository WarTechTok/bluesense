import React from 'react';

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
  const getPaymentMethodName = (method) => {
    const methods = { cash: 'Cash Payment', gcash: 'GCash', gotyme: 'GoTyme Bank' };
    return methods[method] || 'Unknown';
  };

  const ReviewSection = ({ title, icon, items }) => (
    <div className="review-section">
      <h4><i className={icon}></i> {title}</h4>
      {items.map((item, idx) => (
        <div key={idx} className="review-row">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-clipboard-list"></i>
        <h2>Review Your Booking</h2>
        <p>Double-check your details before confirming</p>
      </div>
      
      <div className="review-sections-grid">
        <ReviewSection
          title="Package Details"
          icon="fas fa-info-circle"
          items={[
            { label: 'Location', value: selectedOasis },
            { label: 'Package', value: selectedPackage },
            { label: 'Session', value: selectedSession },
            { label: 'Date', value: formData.reservationDate ? new Date(formData.reservationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' }
          ]}
        />

        <ReviewSection
          title="Guest Information"
          icon="fas fa-user"
          items={[
            { label: 'Full Name', value: formData.fullName },
            { label: 'Email', value: formData.email },
            { label: 'Phone', value: formData.phone },
            { label: 'Guests', value: `${formData.guestCount} people` }
          ]}
        />

        <ReviewSection
          title="Payment Details"
          icon="fas fa-receipt"
          items={[
            { label: 'Package Rate', value: `₱${pricePerNight.toLocaleString()}` },
            ...(addonsTotal > 0 ? [{ label: 'Add-ons', value: `₱${addonsTotal.toLocaleString()}` }] : []),
            { label: 'Total Amount', value: `₱${totalPrice.toLocaleString()}` },
            { label: 'Downpayment', value: `₱${downpayment.toLocaleString()}` },
            { label: 'Payment Method', value: getPaymentMethodName(formData.paymentMethod) }
          ]}
        />

        {Object.keys(selectedAddons).length > 0 && (
          <ReviewSection
            title="Selected Add-ons"
            icon="fas fa-gift"
            items={Object.entries(selectedAddons).map(([name, price]) => ({
              label: name,
              value: `₱${price.toLocaleString()}`
            }))}
          />
        )}
      </div>

      {formData.specialRequests && (
        <div className="special-requests-box">
          <h4><i className="fas fa-comment"></i> Special Requests</h4>
          <p>{formData.specialRequests}</p>
        </div>
      )}

      <div className="terms-section">
        <h4><i className="fas fa-file-contract"></i> Terms & Conditions</h4>
        <div className="terms-content">
          <ul>
            <li><i className="fas fa-exchange-alt"></i> Non-refundable but can be rebooked (only 1 rebook attempt, weekdays only)</li>
            <li><i className="fas fa-envelope"></i> Booking confirmation sent within 24 hours</li>
            <li><i className="fas fa-clock"></i> Arrive 15 minutes before check-in time</li>
            <li><i className="fas fa-calendar-minus"></i> Cancellation must be made 7 days before reservation</li>
            <li><i className="fas fa-credit-card"></i> Payment completed before arrival for e-wallet payments</li>
          </ul>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
          <label htmlFor="agreeTerms">I have read and agree to the terms and conditions <span className="required">*</span></label>
        </div>
        {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
      </div>
    </div>
  );
}

export default ReviewStep;