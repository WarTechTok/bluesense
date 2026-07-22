// src/components/navbar/EditProfileModal.jsx
// ============================================
// EDIT PROFILE MODAL - Popup modal for editing user profile
// ============================================

import React, { useState, useEffect, useRef } from 'react';
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
  const [phoneError, setPhoneError] = useState(''); // ← Add specific phone error
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  // Validate Philippine mobile number — returns error string or null
  // Valid inputs:
  //   09XXXXXXXXX  (11 digits, starts with 09)
  //   639XXXXXXXXX (12 digits, starts with 639)
  //   9XXXXXXXXX   (10 digits, starts with 9)
  // Phone is optional — blank is always valid
  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') return null;

    const digits = phone.replace(/\D/g, '');

    // Normalise to a 10-digit local number (9XXXXXXXXX)
    let local = digits;
    if (digits.startsWith('63'))  local = digits.slice(2);  // 63 prefix
    else if (digits.startsWith('0')) local = digits.slice(1); // 0 prefix

    // Must be exactly 10 digits after stripping prefix
    if (local.length !== 10) {
      return 'Phone number must be 10 digits after the country/area code (e.g., 09123456789)';
    }

    // Must start with 9 (all PH mobile networks: Globe 09XX, Smart 09XX, etc.)
    if (!local.startsWith('9')) {
      return 'Philippine mobile numbers must start with 9 (e.g., 09123456789)';
    }

    return null; // ✅ valid
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
      setPhoneError('');
      setAvatarPreview(null);
      setLoading(false);
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setEditForm({ ...editForm, phone: formatted });
    // Clear phone error when user types
    if (phoneError) setPhoneError('');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be smaller than 5 MB.');
      return;
    }

    // Show instant local preview
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const fd = new FormData();
      fd.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');

      // Persist new avatar and propagate to navbar immediately
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...stored, avatar: data.user.avatar, googleAvatar: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
    } catch (err) {
      console.error('Avatar upload error:', err);
      setAvatarPreview(null);
      setError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number if provided
    const phoneValidationError = validatePhoneNumber(editForm.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setPhoneError('');
    
    try {
      // Clean phone number for backend - remove all non-digit characters
      const cleanPhoneForBackend = editForm.phone.replace(/\D/g, '');
      
      // Prepare data for saving
      const saveData = {
        name: editForm.name,
        phone: cleanPhoneForBackend,
        address: editForm.address
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
            {avatarPreview ? (
              <img src={avatarPreview} alt="preview" />
            ) : getAvatarSrc() ? (
              <img src={getAvatarSrc()} alt={userData?.name} />
            ) : (
              <span>{userData?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <button
            type="button"
            className="edit-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? 'Uploading...' : 'Change Photo'}
          </button>
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
            className={phoneError ? 'error-input' : ''}
          />
          <small className="field-hint">Valid formats: 09123456789 · 639123456789 · 9123456789 (optional)</small>
          {phoneError && <div className="field-error">{phoneError}</div>}
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