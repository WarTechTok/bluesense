// src/components/modals/SignupSuccessModal.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';

function SignupSuccessModal({ isOpen, onClose, email }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Account Created!</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="confirm-text">
            Welcome to Catherine's Oasis! Your account has been successfully created.
          </p>
          <p className="confirm-text" style={{ fontSize: '14px', marginTop: '8px' }}>
            A welcome email has been sent to <strong>{email}</strong>.
          </p>
        </div>
        
        <div className="modal-actions">
          <button className="modal-action-btn confirm" onClick={handleLogin}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupSuccessModal;