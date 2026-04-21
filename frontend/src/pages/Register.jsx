// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SignupSuccessModal from '../components/modals/SignupSuccessModal';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import './Register.css';

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredName, setRegisteredName] = useState('');

  // Philippine phone number validation
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Phone is optional
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Philippine mobile numbers:
    // - 11 digits starting with 09 (e.g., 09123456789)
    // - 13 digits starting with 639 (e.g., 639123456789)
    // - 10 digits starting with 9 (e.g., 9123456789)
    
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
      return true;
    }
    if (cleaned.length === 13 && cleaned.startsWith('639')) {
      return true;
    }
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      return true;
    }
    return false;
  };

  // Format phone number as user types (optional)
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      // Format as +63 XXX XXX XXXX
      if (cleaned.startsWith('63')) {
        const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
        }
      }
      // Format as 09XX XXX XXXX
      if (cleaned.startsWith('09')) {
        const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
        if (match) {
          return `${match[1]} ${match[2]} ${match[3]}`;
        }
      }
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setForm({...form, phone: formatted});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = [];
    
    if (!form.name.trim()) {
      errors.push("Full name is required");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.push("Valid email is required");
    }
    
    if (form.password.length < 8 || form.password.length > 16) {
      errors.push("Password must be 8-16 characters");
    }
    if (!/[A-Z]/.test(form.password)) {
      errors.push("Password needs an uppercase letter");
    }
    if (!/[a-z]/.test(form.password)) {
      errors.push("Password needs a lowercase letter");
    }
    if (!/[0-9]/.test(form.password)) {
      errors.push("Password needs a number");
    }
    if (!/[!@#$%^&*]/.test(form.password)) {
      errors.push("Password needs a special character (!@#$%^&*)");
    }
    
    if (form.password !== form.confirmPassword) {
      errors.push("Passwords don't match");
    }
    
    // Phone validation (optional but must be valid if provided)
    if (form.phone && !validatePhoneNumber(form.phone)) {
      errors.push("Please enter a valid Philippine mobile number (e.g., 09123456789 or 639123456789)");
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setLoading(true);
    setError('');
    
    try {
      // Clean phone number before sending to backend (remove spaces)
      const cleanPhone = form.phone ? form.phone.replace(/\s/g, '') : '';
      const { confirmPassword, ...submitData } = form;
      
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        ...submitData,
        phone: cleanPhone
      });
      
      setRegisteredEmail(form.email);
      setRegisteredName(form.name);
      setShowSuccessModal(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="register-logo-link">
          <img src="/images/logo/Logo-NoBackground.png" alt="Catherine's Oasis" className="register-logo" />
        </Link>

        <div className="register-header">
          <h1 className="register-title">Create account</h1>
          <p className="register-subtitle">Join Catherine's Oasis</p>
        </div>

        {error && <div className="register-error">{error}</div>}

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            {validationErrors.map((err, index) => (
              <div key={index} className="validation-error-item">
                <span className="error-dot">•</span>
                <span className="error-message">{err}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
              className="register-input"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
              className="register-input"
            />
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                className="register-input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
              >
                {showPassword ? (
                  <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                required
                className="register-input password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-button"
              >
                {showConfirmPassword ? (
                  <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="password-note">
            Password must be 8-16 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
          </p>

          <div className="form-group">
            <input
              type="tel"
              placeholder="Phone number (optional) - e.g., 09123456789"
              value={form.phone}
              onChange={handlePhoneChange}
              className="register-input"
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Address (optional)"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              rows="2"
              className="register-textarea"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`register-submit-btn ${loading ? 'disabled' : ''}`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="register-divider">
          <span className="divider-line"></span>
          <span className="divider-text">or</span>
          <span className="divider-line"></span>
        </div>

        <GoogleLoginButton buttonText="Sign up with Google" />

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <SignupSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        email={registeredEmail}
        name={registeredName}
      />
    </div> 
  );
}

export default Register;