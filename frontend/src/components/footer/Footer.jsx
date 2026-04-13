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

        {/* Brand Section */}
        <div className="footer-section">
          <h3>Catherine's Oasis</h3>
          <p>Your private escape in Marilao, Bulacan</p>
          <p className="footer-address">1106 Cordero Subdivision, Lambakin, Marilao, Bulacan</p>
        </div>

        {/* Quick Links */}
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

        {/* Account */}
        <div className="footer-section">
          <h3>Account</h3>
          <ul className="footer-links">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>

        {/* Information - No card, just text */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul className="contact-info">
            <li>Facebook · Instagram · TikTok</li>
            <li>GCash · Maya · GoTyme · SeaBank</li>
            <li>Check-in: 8AM · Check-out: 6PM</li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Catherine's Oasis. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;