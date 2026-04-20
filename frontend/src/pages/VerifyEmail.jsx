// frontend/src/pages/VerifyEmail.jsx
// ============================================
// VERIFY EMAIL PAGE - User clicks link from email
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './VerifyEmail.css';

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token, verifyEmail]);

  return (
    <>
      <Navbar />
      <div className="verify-page">
        <div className="container">
          <div className="verify-card">
            {status === 'verifying' && (
              <>
                <div className="spinner"></div>
                <h2>Verifying your email...</h2>
                <p>Please wait while we verify your account.</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="success-icon">✓</div>
                <h2>Email Verified!</h2>
                <p>{message}</p>
                <Link to="/login" className="btn-primary">Log In Now</Link>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="error-icon">!</div>
                <h2>Verification Failed</h2>
                <p>{message}</p>
                <Link to="/login" className="btn-primary">Back to Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VerifyEmail;