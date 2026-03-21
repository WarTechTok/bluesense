// src/components/modals/LogoutConfirmModal.jsx
import React, { useEffect } from 'react';
import './Modal.css';

function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

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
        
        <div className="modal-actions">
          <button className="modal-action-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-action-btn confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;