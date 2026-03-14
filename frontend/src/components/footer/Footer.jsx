// src/components/footer/Footer.jsx
// ============================================
// FOOTER - Bottom section shown on all pages
// ============================================

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🏊</span>
            <span>Catherine's Oasis</span>
          </div>
          <p className="footer-tagline">
            Your private escape in Marilao, Bulacan
          </p>
          <p className="footer-address">
            📍 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
          </p>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <a href="/#packages">Packages</a>
          <a href="/#about">About</a>
          <Link to="/booking">Book Now</Link>
        </div>

        {/* ── Account ── */}
        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        {/* ── Contact ── */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>📱 Available via Facebook, Instagram, or phone</p>
          <p>💳 GCash · Maya · GoTyme · SeaBank · Cash</p>
          <p>🕗 Check-in: 8:00 AM · Check-out: 6:00 PM</p>
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