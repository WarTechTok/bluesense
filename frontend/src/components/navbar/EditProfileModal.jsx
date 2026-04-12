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

  // Reset form when modal opens and load latest userData
  useEffect(() => {
    if (isOpen && userData) {
      setEditForm({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
      setError('');
      setLoading(false);
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await onSave(editForm);
      // onSave will close the modal, so no need to setLoading(false) here
    } catch (err) {
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
          />
        </div>

        <div className="edit-field">
          <label>Phone</label>
          <input
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            placeholder="Add phone number"
          />
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