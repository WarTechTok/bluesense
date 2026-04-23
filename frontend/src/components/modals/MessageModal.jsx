// src/components/modals/MessageModal.jsx
// ============================================
// GENERIC MESSAGE MODAL - For success/error messages
// ============================================

import React, { useEffect } from 'react';
import './MessageModal.css';

function MessageModal({ isOpen, onClose, type = 'success', title, message }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'info':
        return <i className="fas fa-info-circle"></i>;
      default:
        return <i className="fas fa-check-circle"></i>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="message-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`message-icon-wrapper ${type}`}>
          <div className={`message-icon ${type}`}>
            {getIcon()}
          </div>
        </div>

        <h2 className="message-title">{title}</h2>
        
        <p className="message-text">{message}</p>

        <div className="message-modal-actions">
          <button className="btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;
