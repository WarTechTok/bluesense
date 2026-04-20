// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setSent(true);
      setMessage('Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        {/* Logo */}
        <Link to="/" className="forgot-logo-link">
          <img src="/images/logo/Logo-NoBackground.png" alt="Catherine's Oasis" className="forgot-logo" />
        </Link>

        {/* Header */}
        <div className="forgot-header">
          <h1 className="forgot-title">Forgot password?</h1>
          <p className="forgot-subtitle">Enter your email to reset your password</p>
        </div>

        {/* Success Message */}
        {message && <div className="forgot-success">{message}</div>}

        {/* Error Message */}
        {error && <div className="forgot-error">{error}</div>}

        {/* Form */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="forgot-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`forgot-submit-btn ${loading ? 'disabled' : ''}`}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div className="sent-container">
            <p className="sent-text">
              📧 We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="sent-note">
              Didn't receive it? Check your spam folder or{' '}
              <button 
                onClick={() => setSent(false)} 
                className="resend-button"
              >
                try again
              </button>
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div className="forgot-footer">
          <p>
            Remember your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;