// frontend/src/pages/Profile.jsx
// ============================================
// PROFILE PAGE - Edit user information
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Format phone number to Philippine format: +639XXXXXXXXX
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Handle numbers starting with 63 (already has country code)
    if (cleaned.startsWith('63')) {
      const number = cleaned.slice(2);
      // Ensure we have exactly 10 digits after 63 (total 12 digits)
      if (number.length >= 10) {
        return `+63${number.slice(0, 10)}`;
      }
      return `+63${number}`;
    }
    
    // Handle numbers starting with 0 (local format)
    if (cleaned.startsWith('0')) {
      const number = cleaned.slice(1);
      if (number.length >= 10) {
        return `+63${number.slice(0, 10)}`;
      }
      return `+63${number}`;
    }
    
    // Handle numbers without prefix (assume 9XXXXXXXXX format)
    if (cleaned.length > 0) {
      if (cleaned.length >= 10) {
        return `+63${cleaned.slice(0, 10)}`;
      }
      return `+63${cleaned}`;
    }
    
    return '';
  };

  // Load user data on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Format the phone number if it exists
    const formattedPhone = user.phone ? formatPhoneNumber(user.phone) : '';
    setFormData(prev => ({
      ...prev,
      fullName: user.name || '',
      email: user.email || '',
      phone: formattedPhone
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply phone formatting if phone field
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else {
      // Validate Philippine phone number format (+639XXXXXXXXX)
      const phoneDigits = formData.phone.replace(/\D/g, '');
      // Must be exactly 12 digits for +63 format (63 + 10 digits)
      if (phoneDigits.length !== 12) {
        newErrors.phone = 'Please enter a valid Philippine phone number (e.g., +639123456789)';
      } else if (!phoneDigits.startsWith('63')) {
        newErrors.phone = 'Phone number must start with +63';
      } else {
        const localNumber = phoneDigits.slice(2);
        // Check if the number starts with 9 (mobile number) or 2 (landline)
        if (!localNumber.match(/^(9|2)\d{9}$/)) {
          newErrors.phone = 'Please enter a valid Philippine mobile number (starts with 9) or landline (starts with 2)';
        }
      }
    }

    // Password validation (only if user is changing password)
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      // Clean phone number for backend - keep the +63 format but remove any spaces/dashes
      // Backend expects numbers in international format
      const cleanPhoneForBackend = formData.phone.replace(/\s|-|\(|\)/g, '');
      
      // Split into profile update and password change
      const profileUpdateData = {
        name: formData.fullName,
        phone: cleanPhoneForBackend  // Send clean phone to backend
      };

      // Update profile (name, phone)
      console.log('Updating profile with:', profileUpdateData);
      const profileResponse = await fetch(`http://localhost:8080/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileUpdateData)
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        console.error('Profile update failed:', profileData);
        setMessage({ type: 'error', text: profileData.message || 'Failed to update profile' });
        setIsSaving(false);
        return;
      }
      
      console.log('Profile updated successfully');

      // Handle password change separately if provided
      if (formData.currentPassword && formData.newPassword) {
        console.log('Attempting password change...');
        const passwordResponse = await fetch(`http://localhost:8080/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });

        const passwordData = await passwordResponse.json();
        if (!passwordResponse.ok) {
          setMessage({ type: 'error', text: passwordData.message || 'Failed to change password' });
          setIsSaving(false);
          return;
        }
      }

      // Update localStorage immediately with new user data (BEFORE the redirect)
      const updatedUser = {
        ...user,
        name: formData.fullName,
        phone: cleanPhoneForBackend,  // Store clean phone in localStorage (+639XXXXXXXXX format)
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('localStorage updated:', updatedUser);

      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 2000);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-header">
            <h1>
              <i className="fas fa-user-circle"></i>
              Edit Profile
            </h1>
            <p>Update your personal information</p>
          </div>

          {message && (
            <div className={`message-alert ${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>

              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <div className="input-wrapper">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'error' : ''}
                  />
                </div>
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <div className="input-wrapper">
                  <i className="fas fa-phone"></i>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number (e.g., 09123456789 or +639123456789)"
                    className={errors.phone ? 'error' : ''}
                  />
                </div>
                <small className="input-hint">Format: +639XXXXXXXXX or 09XXXXXXXXX</small>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-section">
              <h2>Change Password <span className="optional">(Optional)</span></h2>
              <p className="section-hint">Leave blank to keep your current password</p>

              <div className="form-group">
                <label>Current Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    className={errors.currentPassword ? 'error' : ''}
                  />
                </div>
                {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password (min 6 characters)"
                    className={errors.newPassword ? 'error' : ''}
                  />
                </div>
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;