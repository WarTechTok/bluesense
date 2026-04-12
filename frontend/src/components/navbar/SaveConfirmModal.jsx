// src/components/navbar/SaveConfirmModal.jsx
// ============================================
// SAVE CONFIRM MODAL - Confirm before saving profile changes
// ============================================

import React, { useEffect } from 'react';
import '../modals/Modal.css';

function SaveConfirmModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Changes</h3>
          <button className="modal-close" onClick={handleCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-text">Are you sure you want to save these changes?</p>
        </div>
        
        <div className="modal-actions">
          <button className="modal-action-btn cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="modal-action-btn confirm" onClick={handleConfirm}>
            Yes, Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveConfirmModal;