// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SignupSuccessModal from '../components/modals/SignupSuccessModal';
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
    
    if (form.phone && !/^[0-9+\-\s()]{10,}$/.test(form.phone)) {
      errors.push("Valid phone number required");
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...submitData } = form;
      await axios.post(`${API_BASE_URL}/api/auth/register`, submitData);
      
      // Store email and name for the modal
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
              placeholder="Phone number (optional)"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
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

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Success Modal - Shows verification message */}
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