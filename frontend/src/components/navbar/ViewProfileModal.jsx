// src/components/navbar/ViewProfileModal.jsx
import React from 'react';

function ViewProfileModal({ isOpen, onClose, userData, getAvatarSrc, onEdit }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="view-modal-avatar">
          {getAvatarSrc() ? (
            <img src={getAvatarSrc()} alt={userData?.name} />
          ) : (
            <span>{userData?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h2 className="view-modal-name">{userData?.name}</h2>
        <p className="view-modal-email">{userData?.email}</p>
        
        {userData?.phone && (
          <div className="view-modal-info">
            <span className="info-label">📞</span>
            <span className="info-value">{userData.phone}</span>
          </div>
        )}
        
        {userData?.address && (
          <div className="view-modal-info">
            <span className="info-label">📍</span>
            <span className="info-value">{userData.address}</span>
          </div>
        )}
        
        {userData?.googleId && (
          <div className="view-modal-google">Connected with Google</div>
        )}
        
        <button className="view-modal-edit-btn" onClick={onEdit}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ViewProfileModal;