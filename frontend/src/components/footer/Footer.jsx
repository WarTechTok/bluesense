// src/components/footer/Footer.jsx
// ============================================
// FOOTER - Bottom section shown on all pages
// ============================================

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ── Brand Section ── */}
        <div className="footer-section">
          <h3>Catherine's Oasis</h3>
          <p>Your private escape in Marilao, Bulacan</p>
          <p className="footer-address">1106 Cordero Subdivision, Lambakin, Marilao, Bulacan</p>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/oasis-1">Oasis 1</Link></li>
            <li><Link to="/oasis-2">Oasis 2</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* ── Account ── */}
        <div className="footer-section">
          <h3>Account</h3>
          <ul className="footer-links">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>

        {/* ── Information Section ── */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul className="contact-info">
            <li>
              <a 
                href="https://www.facebook.com/profile.php?id=100082901994008" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none' }}
              >
                Facebook
              </a>
            </li>
            <li>
              <a 
                href="https://www.instagram.com/catherinesoasis_marilao" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none' }}
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://www.tiktok.com/@catherinesoasismarilao" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none' }}
              >
                TikTok
              </a>
            </li>
            <li>GCash · Maya · GoTyme · Cash</li>
            <li>Check-in: 8AM · Check-out: 6PM</li>
          </ul>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Catherine's Oasis. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;