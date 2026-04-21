// frontend/src/pages/booking/GuestInfoStep.jsx
// ============================================
// GUEST INFO STEP - Read-only with confirm button
// ============================================

import React, { useState, useEffect } from 'react';

const GuestInfoStep = ({ formData, errors, handleChange, onConfirm, isConfirmed }) => {
  const [userInfo, setUserInfo] = useState({
    fullName: formData.fullName || '',
    email: formData.email || '',
    phone: formData.phone || ''
  });

  // Listen for profile updates from navbar
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUserInfo({
          fullName: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || ''
        });
        // Also update the parent form data
        handleChange({ target: { name: 'fullName', value: updatedUser.name || '' } });
        handleChange({ target: { name: 'email', value: updatedUser.email || '' } });
        handleChange({ target: { name: 'phone', value: updatedUser.phone || '' } });
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Initial load from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setUserInfo({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [handleChange]);

  // Update when formData changes from parent
  useEffect(() => {
    setUserInfo({
      fullName: formData.fullName || '',
      email: formData.email || '',
      phone: formData.phone || ''
    });
  }, [formData.fullName, formData.email, formData.phone]);

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-user-circle"></i>
        <div>
          <h2>Confirm Your Information</h2>
          <p>Please verify that your details are correct</p>
        </div>
      </div>

      {/* Enhanced Warning message with edit link */}
      <div className="info-note warning">
        <i className="fas fa-exclamation-triangle"></i>
        <div className="warning-content">
          <strong>Need to make changes?</strong>
          <p>Your information is automatically loaded from your profile.</p>
          <a href="/profile" className="edit-profile-link">
            <i className="fas fa-user-edit"></i> Update My Profile
          </a>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Full Name <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon"></i>
            <div className="readonly-display">
              {userInfo.fullName || 'Not provided'}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Email Address <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-envelope input-icon"></i>
            <div className="readonly-display">
              {userInfo.email || 'Not provided'}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Phone Number <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-phone input-icon"></i>
            <div className="readonly-display">
              {userInfo.phone || 'Not provided'}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Number of Guests <span className="required">*</span></label>
          <div className="input-wrapper">
            <i className="fas fa-user-friends input-icon"></i>
            <input 
              type="number" 
              name="guestCount" 
              value={formData.guestCount} 
              onChange={handleChange}
              min="1"
              max="100"
              className={errors?.guestCount ? 'error' : ''}
            />
          </div>
          {errors?.guestCount && <span className="error-message">{errors.guestCount}</span>}
        </div>
      </div>
      
      {/* Confirm Button */}
      <div className="confirm-section">
        <button 
          type="button" 
          className={`confirm-info-btn ${isConfirmed ? 'confirmed' : ''}`}
          onClick={onConfirm}
        >
          {isConfirmed ? (
            <><i className="fas fa-check-circle"></i> Confirmed</>
          ) : (
            <><i className="fas fa-check"></i> Confirm</>
          )}
        </button>
      </div>
    </div>
  );
};

export default GuestInfoStep;