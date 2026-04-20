// src/components/modals/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css';

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function ProfileModal({ isOpen, onClose, user, onUpdate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [tempAvatarFile, setTempAvatarFile] = useState(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowImageConfirm(false);
      setTempAvatarFile(null);
      setTempAvatarPreview(null);
      setMessage({ text: '', type: '' });
    }
  }, [isOpen]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatarPreview(reader.result);
        setTempAvatarFile(file);
        setShowImageConfirm(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmAvatarChange = () => setShowImageConfirm(false);
  const cancelAvatarChange = () => {
    setShowImageConfirm(false);
    setTempAvatarFile(null);
    setTempAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      
      if (tempAvatarFile) {
        formDataToSend.append('avatar', tempAvatarFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onUpdate) onUpdate(updatedUser);

      setTempAvatarFile(null);
      setTempAvatarPreview(null);
      setIsEditing(false);
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔴 FIXED: Correct avatar function
  const getCurrentAvatar = () => {
    if (tempAvatarPreview) return tempAvatarPreview;
    
    // Check for avatar in user data
    if (user.avatar) {
      // If it's a Google URL (starts with http), use it directly
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      // If it's a local path, add the backend URL
      return `${API_BASE_URL}${user.avatar}`;
    }
    
    // Fallback for backward compatibility
    if (user.googleAvatar) {
      return user.googleAvatar;
    }
    
    return null;
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEditing ? 'Edit profile' : 'Profile'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            {message.text && (
              <div className={`message-banner ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Avatar Section */}
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {getCurrentAvatar() ? (
                  <img 
                    src={getCurrentAvatar()} 
                    alt={user.name} 
                    className="avatar-image"
                    onError={(e) => {
                      console.log('Avatar failed to load, using fallback');
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="avatar-icon">${user.name?.charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="avatar-icon">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              {isEditing && (
                <div className="avatar-upload">
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    Change photo
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="modern-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email} className="modern-input" disabled />
                </div>

                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="modern-input"
                    placeholder="Add phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Address (optional)</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="modern-input"
                    rows="2"
                    placeholder="Add address"
                  />
                </div>

                <div className="edit-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <>
                <div className="profile-info">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{user.name}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <div className="info-value-with-badge">
                      <span>{user.email}</span>
                      {user.googleId && <span className="google-indicator">Google</span>}
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="info-item">
                      <span className="info-label">Address</span>
                      <span className="info-value">{user.address}</span>
                    </div>
                  )}
                </div>

                <div className="profile-actions">
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                  <button className="logout-btn-modern" onClick={onLogout}>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Change Confirmation Modal */}
      {showImageConfirm && (
        <div className="modal-overlay" onClick={cancelAvatarChange}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change profile photo</h3>
              <button className="modal-close" onClick={cancelAvatarChange}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-avatar-preview">
                <img src={tempAvatarPreview} alt="Preview" className="preview-image" />
              </div>
              <p className="confirm-text">Use this photo as your profile picture?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-action-btn cancel" onClick={cancelAvatarChange}>
                Cancel
              </button>
              <button className="modal-action-btn confirm" onClick={confirmAvatarChange}>
                Use photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileModal;