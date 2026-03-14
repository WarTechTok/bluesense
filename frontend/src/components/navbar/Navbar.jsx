// src/components/navbar/Navbar.jsx
// ============================================
// NAVBAR - Main navigation bar for all pages
// ============================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🏊</span>
          <span className="navbar-logo-text">Catherine's Oasis</span>
        </Link>

        {/* Nav Links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="/#packages" onClick={() => setMenuOpen(false)}>Packages</a>
          <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {token ? (
            <>
              <Link to="/dashboard" className="btn-outline">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/booking" className="btn-primary">Book Now</Link>
            </>
          )}
        </div>

        {/* Hamburger for mobile */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  );
}

export default Navbar;