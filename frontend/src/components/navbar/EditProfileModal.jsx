// src/components/navbar/EditProfileModal.jsx
// ============================================
// EDIT PROFILE MODAL - Popup modal for editing user profile
// ============================================

import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

function EditProfileModal({ isOpen, onClose, userData, getAvatarSrc, onSave }) {
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Format phone number to Philippine format: +63 (XXX) XXX-XXXX
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Handle Philippine numbers
    if (cleaned.startsWith('63')) {
      const local = cleaned.slice(2);
      if (local.length === 0) return '+63';
      if (local.length <= 3) return `+63 (${local}`;
      if (local.length <= 6) return `+63 (${local.slice(0, 3)}) ${local.slice(3)}`;
      return `+63 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
    }
    
    // Handle 0 prefix (local format)
    if (cleaned.startsWith('0')) {
      const local = cleaned.slice(1);
      if (local.length === 0) return '0';
      if (local.length <= 3) return `0${local}`;
      if (local.length <= 6) return `+63 (${local.slice(0, 3)}) ${local.slice(3)}`;
      return `+63 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
    }
    
    // Handle numbers without country code (assume local)
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Phone is optional
    
    const phoneDigits = phone.replace(/\D/g, '');
    // Must have at least 10 digits
    if (phoneDigits.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    return true;
  };

  // Reset form when modal opens and load latest userData
  useEffect(() => {
    if (isOpen && userData) {
      // Format the phone number if it exists
      const formattedPhone = userData.phone ? formatPhoneNumber(userData.phone) : '';
      setEditForm({
        name: userData.name || '',
        phone: formattedPhone,
        address: userData.address || ''
      });
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setEditForm({ ...editForm, phone: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number if provided
    if (editForm.phone) {
      const validation = validatePhoneNumber(editForm.phone);
      if (validation !== true) {
        setError(validation);
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Clean phone number for backend - remove all non-digit characters
      const cleanPhoneForBackend = editForm.phone.replace(/\D/g, '');
      
      // Prepare data for saving
      const saveData = {
        ...editForm,
        phone: cleanPhoneForBackend
      };
      
      // Call onSave to update backend - this will also update localStorage on success
      await onSave(saveData);
      
      // Show success message
      setSuccess('Profile saved successfully!');
      console.log('Profile saved successfully');
      
      // Close modal after 1 second to show the success message briefly
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-modal">
        <button className="edit-close-btn" onClick={onClose}>×</button>
        <h2 className="edit-title">Edit Profile</h2>

        {error && <div className="edit-error">{error}</div>}
        {success && <div className="edit-success">{success}</div>}

        <div className="edit-avatar-container">
          <div className="edit-avatar">
            {getAvatarSrc() ? (
              <img src={getAvatarSrc()} alt={userData?.name} />
            ) : (
              <span>{userData?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button type="button" className="edit-avatar-btn">Change Photo</button>
        </div>

        <div className="edit-field">
          <label>Full Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
        </div>

        <div className="edit-field">
          <label>Email</label>
          <input
            type="email"
            value={userData?.email}
            disabled
            className="disabled-input"
          />
        </div>

        <div className="edit-field">
          <label>Phone</label>
          <input
            type="tel"
            value={editForm.phone}
            onChange={handlePhoneChange}
            placeholder="Add phone number"
          />
          <small className="field-hint">Format: +63 (XXX) XXX-XXXX (e.g., +63 (909) 123-4567)</small>
        </div>

        <div className="edit-field">
          <label>Address</label>
          <textarea
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            placeholder="Add address"
            rows="2"
          />
        </div>

        <div className="edit-actions">
          <button type="button" className="edit-cancel-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="edit-save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;