// src/components/modals/SignupSuccessModal.jsx
// ============================================
// SIGNUP SUCCESS MODAL - Shows verification message
// ============================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupSuccessModal.css';

function SignupSuccessModal({ isOpen, onClose, email, name }) {
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
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrapper">
          <div className="success-icon">
            <i className="fas fa-envelope"></i>
          </div>
        </div>

        <h2 className="success-title">Verify Your Email</h2>
        
        <p className="success-message">
          We've sent a verification link to:
        </p>
        
        <p className="success-email">{email}</p>
        
        <p className="success-instruction">
          Please check your inbox and click the verification link to activate your account.
        </p>

        <div className="important-note">
          <i className="fas fa-info-circle"></i>
          <span>Didn't receive the email? Check your spam folder.</span>
        </div>

        <div className="success-modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleLogin}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupSuccessModal;