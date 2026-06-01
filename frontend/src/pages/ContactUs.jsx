// src/pages/ContactUs.jsx
// ============================================
// CONTACT US PAGE - With working contact form
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import apiCall from '../services/apiClient';
import './ContactUs.css';

const INITIAL_FORM = {
  subject: '',
  message: '',
};

const INITIAL_ERRORS = {
  subject: '',
  message: '',
};

function ContactUs() {
  const location = {
    address: '1106 Cordero Subdivision, Lambakin, Marilao, 3019 Bulacan',
    lat: 14.7578,
    lng: 120.9483,
  };

  // ── Auth state ─────────────────────────────────────────
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  // ── Form state ─────────────────────────────────────────
  const [form, setForm]               = useState(INITIAL_FORM);
  const [errors, setErrors]           = useState(INITIAL_ERRORS);
  const [status, setStatus]           = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');

  // ── Inline validation ──────────────────────────────────
  const validate = () => {
    const e = { ...INITIAL_ERRORS };
    let valid = true;

    if (!form.subject.trim() || form.subject.trim().length < 3) {
      e.subject = 'Subject must be at least 3 characters.';
      valid = false;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters.';
      valid = false;
    }

    setErrors(e);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    setServerError('');

    try {
      await apiCall('/api/contact/send', {
        method: 'POST',
        body: JSON.stringify({
          name:    user.name  || '',
          email:   user.email || '',
          phone:   user.phone || '',
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setServerError('');
    setErrors(INITIAL_ERRORS);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with us for inquiries and reservations</p>
        </div>
      </section>

      <div className="contact-content">
        <div className="container">

          {/* Two Column Layout */}
          <div className="contact-grid">

            {/* Left — Contact Info */}
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p className="info-subtitle">
                Have questions about our packages or want to make a reservation?
                We'd love to hear from you!
              </p>

              <div className="info-list">
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Location</h3>
                    <p>1106 Cordero Subdivision, Lambakin, Marilao, 3019 Bulacan</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <h3>Phone Number</h3>
                    <p>+63 912 345 6789</p>
                    <p>+63 987 654 3210</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h3>Email Address</h3>
                    <p>info@catherinesoasis.com</p>
                    <p>reservations@catherinesoasis.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Operating Hours</h3>
                    <p>Monday - Sunday: 6:00 AM - 8:00 PM</p>
                    <p>24/7 Customer Support</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="https://www.facebook.com/profile.php?id=100082901994008" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/catherinesoasis_marilao" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://www.tiktok.com/@catherinesoasismarilao" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Map */}
            <div className="contact-map">
              <h2>Our Location</h2>
              <p className="map-subtitle">Find us easily with Google Maps</p>
              <div className="map-container">
                <iframe
                  title="Catherine's Oasis Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
              <div className="address-details">
                <p>
                  <strong>Catherine's Oasis</strong><br />
                  1106 Cordero Subdivision, Lambakin<br />
                  Marilao, 3019 Bulacan<br />
                  Philippines
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-btn"
                >
                  <i className="fas fa-directions"></i> Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* ── Contact Form ─────────────────────────────────── */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <p>We'll get back to you as soon as possible</p>

            {/* ── Not logged in gate ─────────────────────────── */}
            {!user ? (
              <div className="contact-login-gate">
                <div className="login-gate-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h3>Login Required</h3>
                <p>Please login to send us a message.</p>
                <Link to="/login?redirect=/contact" className="login-gate-btn">
                  <i className="fas fa-sign-in-alt"></i>
                  Log In to Continue
                </Link>
              </div>
            ) : status === 'success' ? (
              /* ── Success state ──────────────────────────────── */
              <div className="form-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>
                  Thank you for reaching out. We've received your message and will
                  respond within 24 hours. A confirmation has been sent to your email.
                </p>
                <button className="submit-btn" onClick={handleReset}>
                  Send Another Message
                </button>
              </div>
            ) : (
              /* ── Form ───────────────────────────────────────── */
              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                {/* Server-level error banner */}
                {status === 'error' && serverError && (
                  <div className="form-error-banner">
                    <i className="fas fa-exclamation-circle"></i>
                    {serverError}
                  </div>
                )}

                {/* Sender identity card (read-only) */}
                <div className="sender-card">
                  <div className="sender-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="sender-details">
                    <p className="sender-name">{user.name || '—'}</p>
                    <p className="sender-email">{user.email || '—'}</p>
                    {user.phone && (
                      <p className="sender-phone">{user.phone}</p>
                    )}
                  </div>
                  <span className="sender-badge">
                    <i className="fas fa-check-circle"></i> Sending as you
                  </span>
                </div>

                {/* Subject */}
                <div className={`form-group ${errors.subject ? 'has-error' : ''}`}>
                  <label htmlFor="cf-subject">Subject <span className="required">*</span></label>
                  <input
                    id="cf-subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Inquiry / Reservation / Feedback"
                    disabled={status === 'sending'}
                  />
                  {errors.subject && <span className="field-error">{errors.subject}</span>}
                </div>

                {/* Message */}
                <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                  <label htmlFor="cf-message">Message <span className="required">*</span></label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your inquiry..."
                    disabled={status === 'sending'}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                  <span className="char-count">{form.message.length} characters</span>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${status === 'sending' ? 'sending' : ''}`}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactUs;


const INITIAL_FORM = {
  name:    '',
  email:   '',
  phone:   '',
  subject: '',
  message: '',
};

const INITIAL_ERRORS = {
  name:    '',
  email:   '',
  subject: '',
  message: '',
};

function ContactUs() {
  const location = {
    address: '1106 Cordero Subdivision, Lambakin, Marilao, 3019 Bulacan',
    lat: 14.7578,
    lng: 120.9483,
  };

  // ── Form state ─────────────────────────────────────────
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState(INITIAL_ERRORS);
  const [status, setStatus]       = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');

  // ── Inline validation ──────────────────────────────────
  const validate = () => {
    const e = { ...INITIAL_ERRORS };
    let valid = true;

    if (!form.name.trim() || form.name.trim().length < 2) {
      e.name = 'Please enter your full name.';
      valid = false;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please enter a valid email address.';
      valid = false;
    }
    if (!form.subject.trim() || form.subject.trim().length < 3) {
      e.subject = 'Subject must be at least 3 characters.';
      valid = false;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters.';
      valid = false;
    }

    setErrors(e);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    setServerError('');

    try {
      await apiCall('/api/contact/send', {
        method: 'POST',
        body: JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim(),
          phone:   form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setServerError('');
    setErrors(INITIAL_ERRORS);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with us for inquiries and reservations</p>
        </div>
      </section>

      <div className="contact-content">
        <div className="container">

          {/* Two Column Layout */}
          <div className="contact-grid">

            {/* Left — Contact Info */}
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p className="info-subtitle">
                Have questions about our packages or want to make a reservation?
                We'd love to hear from you!
              </p>

              <div className="info-list">
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Location</h3>
                    <p>1106 Cordero Subdivision, Lambakin, Marilao, 3019 Bulacan</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <h3>Phone Number</h3>
                    <p>+63 912 345 6789</p>
                    <p>+63 987 654 3210</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h3>Email Address</h3>
                    <p>info@catherinesoasis.com</p>
                    <p>reservations@catherinesoasis.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Operating Hours</h3>
                    <p>Monday - Sunday: 6:00 AM - 8:00 PM</p>
                    <p>24/7 Customer Support</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="https://www.facebook.com/profile.php?id=100082901994008" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/catherinesoasis_marilao" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://www.tiktok.com/@catherinesoasismarilao" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Map */}
            <div className="contact-map">
              <h2>Our Location</h2>
              <p className="map-subtitle">Find us easily with Google Maps</p>
              <div className="map-container">
                <iframe
                  title="Catherine's Oasis Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
              <div className="address-details">
                <p>
                  <strong>Catherine's Oasis</strong><br />
                  1106 Cordero Subdivision, Lambakin<br />
                  Marilao, 3019 Bulacan<br />
                  Philippines
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-btn"
                >
                  <i className="fas fa-directions"></i> Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* ── Contact Form ─────────────────────────────────── */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <p>We'll get back to you as soon as possible</p>

            {/* Success state */}
            {status === 'success' ? (
              <div className="form-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>
                  Thank you for reaching out. We've received your message and will
                  respond within 24 hours. A confirmation has been sent to your email.
                </p>
                <button className="submit-btn" onClick={handleReset}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                {/* Server-level error banner */}
                {status === 'error' && serverError && (
                  <div className="form-error-banner">
                    <i className="fas fa-exclamation-circle"></i>
                    {serverError}
                  </div>
                )}

                <div className="form-row">
                  {/* Name */}
                  <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                    <label htmlFor="cf-name">Your Name <span className="required">*</span></label>
                    <input
                      id="cf-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={status === 'sending'}
                      autoComplete="name"
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                    <label htmlFor="cf-email">Email Address <span className="required">*</span></label>
                    <input
                      id="cf-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={status === 'sending'}
                      autoComplete="email"
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  {/* Phone (optional) */}
                  <div className="form-group">
                    <label htmlFor="cf-phone">Phone Number <span className="optional">(optional)</span></label>
                    <input
                      id="cf-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      disabled={status === 'sending'}
                      autoComplete="tel"
                    />
                  </div>

                  {/* Subject */}
                  <div className={`form-group ${errors.subject ? 'has-error' : ''}`}>
                    <label htmlFor="cf-subject">Subject <span className="required">*</span></label>
                    <input
                      id="cf-subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Inquiry / Reservation / Feedback"
                      disabled={status === 'sending'}
                    />
                    {errors.subject && <span className="field-error">{errors.subject}</span>}
                  </div>
                </div>

                {/* Message */}
                <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                  <label htmlFor="cf-message">Message <span className="required">*</span></label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your inquiry..."
                    disabled={status === 'sending'}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                  <span className="char-count">{form.message.length} characters</span>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${status === 'sending' ? 'sending' : ''}`}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactUs;