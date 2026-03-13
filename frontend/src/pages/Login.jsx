// frontend/src/pages/Login.jsx
// ============================================
// LOGIN PAGE - matching Register style
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  // Timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      
      if (err.response?.status === 429 && data.waitTime) {
        setCooldown(data.waitTime);
        setError(data.message);
        setAttemptsLeft(null);
      } else if (data.attemptsLeft !== undefined) {
        setAttemptsLeft(data.attemptsLeft);
        setError(data.message);
      } else {
        setError(data?.message || 'Login failed');
      }
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
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your BlueSense account</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div style={styles.error}>
            {error}
            {cooldown > 0 && <div style={styles.timer}>{cooldown}s</div>}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Field */}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
            disabled={cooldown > 0}
            style={cooldown > 0 ? {...styles.input, ...styles.inputDisabled} : styles.input}
          />

          {/* Password Field with Eye Icon */}
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
              disabled={cooldown > 0}
              style={cooldown > 0 ? {...styles.passwordInput, ...styles.inputDisabled} : styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={cooldown > 0}
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

          {/* Forgot Password Link */}
          <div style={styles.forgotContainer}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || cooldown > 0}
            style={loading || cooldown > 0 ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? 'Signing in...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Sign in'}
          </button>
        </form>

        {/* Register Link */}
        <div style={styles.footer}>
          <p style={styles.text}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create account
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo credentials:</p>
          <p style={styles.demoText}>admin@bluesense.com / admin123</p>
          <p style={styles.demoText}>staff@test.com / staff123</p>
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
  inputDisabled: {
    background: '#f5f5f5',
    color: '#999',
    cursor: 'not-allowed'
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
  forgotContainer: {
    textAlign: 'right',
    marginTop: '4px'
  },
  forgotLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500'
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
  timer: {
    fontSize: '12px',
    marginTop: '4px',
    color: '#c53030'
  },
  attempts: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #bbdefb'
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
  },
  demoBox: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px'
  },
  demoTitle: {
    margin: '0 0 8px 0',
    fontWeight: '600',
    color: '#555'
  },
  demoText: {
    margin: '5px 0',
    color: '#777',
    fontFamily: 'monospace'
  }
};

export default Login;