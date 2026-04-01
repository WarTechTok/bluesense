import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import PackageCard from '../components/home/PackageCard';
import { OASIS1_PACKAGES } from '../constants/packages';
import './Oasis1.css';

function Oasis1() {
  return (
    <div className="oasis-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="oasis-hero">
        <div className="hero-content">
          <h1>Oasis 1</h1>
          <p className="hero-subtitle">Perfect for intimate gatherings and family outings</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="oasis-content">
        <div className="container">
          
          {/* Overview */}
          <div className="oasis-overview">
            <h2>Welcome to Oasis 1</h2>
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

          {/* Features */}
          <div className="oasis-features">
            <h2>What Makes Oasis 1 Special</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🌳</div>
                <h3>Natural Surroundings</h3>
                <p>Surrounded by lush gardens and peaceful landscapes</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Intimate Setting</h3>
                <p>Perfect size for close-knit gatherings and family time</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎉</div>
                <h3>Customizable Events</h3>
                <p>Flexible spaces for celebrations and special occasions</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3>Premium Service</h3>
                <p>Dedicated staff ensuring personalized attention</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🍽️</div>
                <h3>Fine Dining</h3>
                <p>Exquisite culinary experiences tailored to your preferences</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏊</div>
                <h3>Recreation Facilities</h3>
                <p>Swimming pools, gardens, and relaxation areas</p>
              </div>
            </div>
          </div>

          {/* Available Packages */}
          <div className="oasis-packages">
            <h2>Our Packages</h2>
            <p className="packages-intro">
              Choose the perfect package for your needs and create unforgettable memories at Oasis 1
            </p>
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

          {/* Why Choose Section */}
          <div className="why-choose">
            <h2>Why Choose Oasis 1?</h2>
            <div className="why-choose-content">
              <div className="why-item">
                <h3>✓ Personalized Attention</h3>
                <p>Our smaller venue allows us to provide exceptional, personalized service to each guest</p>
              </div>
              <div className="why-item">
                <h3>✓ Flexible Packages</h3>
                <p>Customizable options to suit your budget and requirements perfectly</p>
              </div>
              <div className="why-item">
                <h3>✓ Scenic Beauty</h3>
                <p>Breathtaking natural surroundings ideal for photos and memorable moments</p>
              </div>
              <div className="why-item">
                <h3>✓ All-Inclusive Options</h3>
                <p>Comprehensive packages that include meals, decorations, and entertainment</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Oasis1;
