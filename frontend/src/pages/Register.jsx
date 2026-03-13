// frontend/src/pages/Register.jsx
// ============================================
// REGISTER PAGE - with normal eye icons
// ============================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
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
      await axios.post('http://localhost:8080/api/auth/register', submitData);
      alert('✅ Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoText}>🌊</span>
          </div>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Join BlueSense pool monitoring</p>
        </div>

        {/* Error Messages */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div style={styles.validationErrors}>
            {validationErrors.map((err, index) => (
              <div key={index} style={styles.validationErrorItem}>
                <span style={styles.errorDot}>•</span>
                <span style={styles.errorMessage}>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name Field */}
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
            style={styles.input}
          />

          {/* Email Field */}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
            style={styles.input}
          />

          {/* Password Field with Eye Icon */}
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password Field with Eye Icon */}
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              required
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? (
                <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Phone Field */}
          <input
            type="tel"
            placeholder="Phone number (optional)"
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
            style={styles.input}
          />

          {/* Address Field */}
          <textarea
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm({...form, address: e.target.value})}
            rows="2"
            style={styles.textarea}
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Login Link */}
        <div style={styles.footer}>
          <p style={styles.text}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    width: '60px',
    height: '60px',
    background: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '30px'
  },
  logoText: {
    color: 'white'
  },
  title: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: '600'
  },
  subtitle: {
    margin: '0',
    color: '#666',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '60px'
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%'
  },
  passwordInput: {
    width: '100%',
    padding: '12px 14px',
    paddingRight: '45px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  eyeIcon: {
    width: '15px',
    height: '15px',
    color: '#666'
  },
  validationErrors: {
    marginBottom: '20px',
    padding: '12px 16px',
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '8px'
  },
  validationErrorItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '6px',
    fontSize: '13px',
    color: '#c53030',
    lineHeight: '1.4'
  },
  errorDot: {
    fontSize: '16px'
  },
  errorMessage: {
    flex: 1
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '8px'
  },
  buttonDisabled: {
    background: '#a0aec0',
    cursor: 'not-allowed'
  },
  error: {
    background: '#fff5f5',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #feb2b2'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px'
  },
  text: {
    margin: '0',
    color: '#666',
    fontSize: '14px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500'
  }
};

export default Register;