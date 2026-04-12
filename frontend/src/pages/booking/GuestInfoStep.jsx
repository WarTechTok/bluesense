// frontend/src/pages/booking/GuestInfoStep.jsx
// ============================================
// GUEST INFO STEP - Read-only with confirm button
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestInfoStep = ({ formData, errors, handleChange, onConfirm, isConfirmed }) => {
  const navigate = useNavigate();
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

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-user-circle"></i>
        <div>
          <h2>Confirm Your Information</h2>
          <p>Please verify that your details are correct</p>
        </div>
      </div>

      {/* Warning message */}
      <div className="info-note warning">
        <i className="fas fa-info-circle"></i>
        <p>If your information is incorrect, please update your profile first.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Full Name</label>
          <div className="input-wrapper read-only">
            <i className="fas fa-user input-icon"></i>
            <input 
              type="text" 
              value={userInfo.fullName} 
              readOnly
              disabled
              className="readonly-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper read-only">
            <i className="fas fa-envelope input-icon"></i>
            <input 
              type="email" 
              value={userInfo.email} 
              readOnly
              disabled
              className="readonly-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <div className="input-wrapper read-only">
            <i className="fas fa-phone input-icon"></i>
            <input 
              type="tel" 
              value={userInfo.phone || 'Not provided'} 
              readOnly
              disabled
              className="readonly-input"
            />
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
              className={errors.guestCount ? 'error' : ''}
            />
          </div>
          {errors.guestCount && <span className="error-message">{errors.guestCount}</span>}
        </div>
      </div>
      
      {/* Edit Profile Button */}
      <button 
        type="button" 
        className="edit-profile-btn"
        onClick={handleEditProfile}
      >
        <i className="fas fa-edit"></i> Update Profile
      </button>
      
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