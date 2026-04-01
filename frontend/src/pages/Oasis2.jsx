import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import PackageCard from '../components/home/PackageCard';
import { OASIS2_PACKAGES } from '../constants/packages';
import './Oasis2.css';

function Oasis2() {
  return (
    <div className="oasis-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="oasis-hero">
        <div className="hero-content">
          <h1>Oasis 2</h1>
          <p className="hero-subtitle">Spacious grounds ideal for larger events and celebrations</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="oasis-content">
        <div className="container">
          
          {/* Overview */}
          <div className="oasis-overview">
            <h2>Welcome to Oasis 2</h2>
            <p>
              Oasis 2 is our premier destination featuring expansive gardens, spacious event halls, and world-class facilities. 
              Designed to accommodate larger gatherings, our state-of-the-art venue offers the perfect backdrop for grand celebrations, 
              corporate events, destination weddings, and major milestones.
            </p>
            <p>
              With dedicated event planning support, flexible layouts, and comprehensive amenities, Oasis 2 transforms your vision 
              into reality. Our expert team is committed to delivering excellence and ensuring your event is nothing short of extraordinary.
            </p>
          </div>

          {/* Features */}
          <div className="oasis-features">
            <h2>What Makes Oasis 2 Exceptional</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏛️</div>
                <h3>Grand Spaces</h3>
                <p>Expansive halls and gardens accommodating hundreds of guests</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎪</div>
                <h3>Versatile Layouts</h3>
                <p>Flexible configurations for banquets, conferences, and celebrations</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3>Premium Amenities</h3>
                <p>State-of-the-art facilities and cutting-edge technology</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👔</div>
                <h3>Event Planning</h3>
                <p>Professional coordinators handling every detail of your event</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🍽️</div>
                <h3>Gourmet Catering</h3>
                <p>World-class chefs preparing culinary masterpieces</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>Complete Services</h3>
                <p>Entertainment, décor, lighting, and photography coordination</p>
              </div>
            </div>
          </div>

          {/* Available Packages */}
          <div className="oasis-packages">
            <h2>Our Packages</h2>
            <p className="packages-intro">
              Select from our curated packages designed to meet the needs of large-scale events and celebrations
            </p>
            <div className="packages-grid">
              {OASIS2_PACKAGES.map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  pkg={pkg}
                  oasis="Oasis 2"
                />
              ))}
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="why-choose">
            <h2>Why Choose Oasis 2?</h2>
            <div className="why-choose-content">
              <div className="why-item">
                <h3>✓ Capacity & Scale</h3>
                <p>Handle events of any size from 100 to 1000+ guests with ease</p>
              </div>
              <div className="why-item">
                <h3>✓ Expert Event Management</h3>
                <p>Professional team managing every aspect of your celebration</p>
              </div>
              <div className="why-item">
                <h3>✓ Luxurious Setting</h3>
                <p>Premium facilities and elegant surroundings for an unforgettable experience</p>
              </div>
              <div className="why-item">
                <h3>✓ Comprehensive Solutions</h3>
                <p>End-to-end event management including décor, catering, and entertainment</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Oasis2;
