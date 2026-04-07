import React from 'react';

const DateStep = ({ formData, errors, handleChange, today, nights, priceType }) => {
  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-calendar-week"></i>
        <h2>When are you staying?</h2>
        <p>Select your check-in and check-out dates</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Check-in Date <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-calendar-check input-icon"></i>
            <input type="date" name="reservationDate" value={formData.reservationDate} onChange={handleChange} min={today} className={errors.reservationDate ? 'error' : ''} />
          </div>
          {errors.reservationDate && <span className="error-message">{errors.reservationDate}</span>}
        </div>
        <div className="form-group">
          <label>Check-out Date <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-calendar-times input-icon"></i>
            <input type="date" name="checkoutDate" value={formData.checkoutDate} onChange={handleChange} min={formData.reservationDate || today} className={errors.checkoutDate ? 'error' : ''} />
          </div>
          {errors.checkoutDate && <span className="error-message">{errors.checkoutDate}</span>}
        </div>
        <div className="form-group full-width">
          <label>Special Requests</label>
          <div className="input-wrapper">
            <i className="fas fa-pen input-icon"></i>
            <textarea name="specialRequests" placeholder="Any special requirements or preferences?" rows="4" value={formData.specialRequests} onChange={handleChange}></textarea>
          </div>
        </div>
        {nights > 0 && (
          <div className="date-info-card">
            <i className="fas fa-moon"></i>
            <div><strong>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong><span>Stay duration</span></div>
            <div className="rate-info"><span className={`rate-tag ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>{priceType}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateStep;