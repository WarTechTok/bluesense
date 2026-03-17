// src/components/navbar/SaveConfirmModal.jsx
import React from 'react';

function SaveConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Save Changes</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to save these changes?</p>
        </div>
        <div className="modal-actions">
          <button className="modal-action-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-action-btn confirm" onClick={onConfirm}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default SaveConfirmModal;