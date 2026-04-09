// src/pages/Oasis1.jsx
// ============================================
// OASIS 1 PAGE - Consistent with Home page design
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import PackageCard from '../components/home/PackageCard';
import { OASIS1_PACKAGES } from '../constants/packages';
import './Oasis1.css';

function Oasis1() {
  return (
    <div className="oasis1-page">
      <Navbar />
      
      {/* ===== HERO SECTION ===== */}
      <section className="oasis1-hero">
        <div className="container">
          <h1>Oasis 1</h1>
          <p className="hero-subtitle">Perfect for intimate gatherings and family outings</p>
        </div>
      </section>

      {/* ===== OVERVIEW SECTION ===== */}
      <section className="oasis1-overview-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Welcome to Oasis 1</h2>
          </div>
          <div className="overview-content">
            <p>
              Oasis 1 is our cozy and intimate retreat designed for smaller groups seeking a peaceful escape from the busy world. 
              With carefully curated amenities, lush green surroundings, and personalized service, we ensure every moment of your 
              stay is truly memorable and rejuvenating.
            </p>
            <p>
              Ideal for family reunions, intimate celebrations, romantic getaways, and small corporate gatherings. 
              Our experienced team is dedicated to making your experience exceptional, whether you're looking for relaxation 
              or celebration.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="oasis1-features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Makes Oasis 1 Special</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Natural Surroundings</h3>
              <p>Surrounded by lush gardens and peaceful landscapes</p>
            </div>
            <div className="feature-card">
              <h3>Intimate Setting</h3>
              <p>Perfect size for close-knit gatherings and family time</p>
            </div>
            <div className="feature-card">
              <h3>Customizable Events</h3>
              <p>Flexible spaces for celebrations and special occasions</p>
            </div>
            <div className="feature-card">
              <h3>Premium Service</h3>
              <p>Dedicated staff ensuring personalized attention</p>
            </div>
            <div className="feature-card">
              <h3>Fine Dining</h3>
              <p>Exquisite culinary experiences tailored to your preferences</p>
            </div>
            <div className="feature-card">
              <h3>Recreation Facilities</h3>
              <p>Swimming pools, gardens, and relaxation areas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PACKAGES SECTION ===== */}
      <section className="oasis1-packages-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Packages</h2>
          </div>
          <div className="packages-grid">
            {OASIS1_PACKAGES.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg}
                oasis="Oasis 1"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE SECTION ===== */}
      <section className="oasis1-why-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Oasis 1?</h2>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <h3>Personalized Attention</h3>
              <p>Our smaller venue allows us to provide exceptional, personalized service to each guest</p>
            </div>
            <div className="why-card">
              <h3>Flexible Packages</h3>
              <p>Customizable options to suit your budget and requirements perfectly</p>
            </div>
            <div className="why-card">
              <h3>Scenic Beauty</h3>
              <p>Breathtaking natural surroundings ideal for photos and memorable moments</p>
            </div>
            <div className="why-card">
              <h3>All-Inclusive Options</h3>
              <p>Comprehensive packages that include meals, decorations, and entertainment</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="oasis1-cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Book Your Stay at Oasis 1?</h2>
          <p className="cta-text">Choose your package and complete your reservation</p>
          <Link to="/booking" className="cta-btn" state={{ oasis: 'Oasis 1' }}>Book Now</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Oasis1;