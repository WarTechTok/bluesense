// frontend/src/pages/ForgotPassword.jsx
// ============================================
// FORGOT PASSWORD PAGE - request reset link
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      setSent(true);
      setMessage('Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
          <h2 style={styles.title}>Forgot password?</h2>
          <p style={styles.subtitle}>Enter your email to reset your password</p>
        </div>

        {/* Success Message */}
        {message && <div style={styles.success}>{message}</div>}

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        {!sent ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />

            <button 
              type="submit" 
              disabled={loading}
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div style={styles.sentContainer}>
            <p style={styles.sentText}>
              📧 We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={styles.sentNote}>
              Didn't receive it? Check your spam folder or{' '}
              <button 
                onClick={() => setSent(false)} 
                style={styles.resendButton}
              >
                try again
              </button>
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div style={styles.footer}>
          <p style={styles.text}>
            Remember your password?{' '}
            <Link to="/login" style={styles.link}>
              Back to login
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
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
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
  success: {
    background: '#f0fff4',
    color: '#2e7d32',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #c8e6c9'
  },
  sentContainer: {
    textAlign: 'center',
    padding: '20px 0'
  },
  sentText: {
    color: '#333',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '10px'
  },
  sentNote: {
    color: '#666',
    fontSize: '14px'
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
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

export default ForgotPassword;