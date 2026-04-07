import React from 'react';

const GuestInfoStep = ({ formData, errors, handleChange }) => {
  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-user-circle"></i>
        <h2>Who's coming?</h2>
        <p>Tell us about the primary guest</p>
      </div>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Full Name <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon"></i>
            <input type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'error' : ''} />
          </div>
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label>Email Address <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-envelope input-icon"></i>
            <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Phone Number <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-phone input-icon"></i>
            <input type="tel" name="phone" placeholder="+63 9XX XXX XXXX" value={formData.phone} onChange={handleChange} className={errors.phone ? 'error' : ''} />
          </div>
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label>Number of Guests <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-user-friends input-icon"></i>
            <select name="guestCount" value={formData.guestCount} onChange={handleChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestInfoStep;