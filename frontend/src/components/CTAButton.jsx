// src/components/CTAButton.jsx
// ============================================
// CTA BUTTON - Reusable call to action section
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

function CTAButton({ to = "/oasis-1", buttonText = "View Packages", title = "Ready to Book Your Stay?", subtitle = "Choose your preferred oasis and package, then complete your reservation" }) {
  return (
    <section className="cta-section">
      <div className="container">
        <h2 className="cta-title">{title}</h2>
        <p className="cta-text">{subtitle}</p>
        <Link to={to} className="cta-btn">
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

export default CTAButton;