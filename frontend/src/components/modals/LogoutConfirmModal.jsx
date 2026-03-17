// src/components/modals/LogoutConfirmModal.jsx
import React from 'react';
import './Modal.css';

function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Sign out</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-text">Are you sure you want to sign out?</p>
        </div>
        
        {/* 🔴 FIXED: Full width buttons at bottom */}
        <div className="modal-actions">
          <button 
            className="modal-action-btn cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="modal-action-btn confirm" 
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;