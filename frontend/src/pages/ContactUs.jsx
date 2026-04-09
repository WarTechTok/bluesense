// src/pages/ContactUs.jsx
// ============================================
// CONTACT US PAGE - With Google Maps
// ============================================

import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './ContactUs.css';

function ContactUs() {
  // Location coordinates for Cordero Subdivision, Marilao, Bulacan
  const location = {
    address: '1106 Cordero Subdivision, Lambakin, Marilao, 3019 Bulacan',
    lat: 14.7578,
    lng: 120.9483
  };

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
            
            {/* Left Column - Contact Info */}
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
                    <p>Monday - Sunday: 8:00 AM - 10:00 PM</p>
                    <p>24/7 Customer Support</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links - Brand Colors */}
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a 
                    href="https://www.facebook.com/profile.php?id=100082901994008" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a 
                    href="https://www.instagram.com/catherinesoasis_marilao" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@catherinesoasismarilao" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon tiktok"
                  >
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
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

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <p>We'll get back to you as soon as possible</p>
            
            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter your email" />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" placeholder="Inquiry / Reservation" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Tell us about your inquiry..."></textarea>
              </div>
              
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactUs;