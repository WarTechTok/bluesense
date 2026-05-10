// frontend/src/components/admin/ConfirmationModal.jsx
import React, { useEffect } from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        await onConfirm();
      } catch (error) {
        console.error('Error in confirmation callback:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-text">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button className="modal-action-btn cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="modal-action-btn confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;