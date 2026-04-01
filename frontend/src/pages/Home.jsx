// src/pages/Home.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import PackageCard from '../components/home/PackageCard';
import { OASIS1_PACKAGES, OASIS2_PACKAGES, BOOKING_RULES } from '../constants/packages';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Home.css';

function Home() {
  // Hero carousel images
  const heroImages = [
    {
      url: '/images/hero/welcome.jpg',
      title: 'Welcome to Catherine\'s Oasis',
      subtitle: 'Your premier destination for relaxation and unforgettable memories',
      buttonText: 'Explore Packages',
      buttonLink: '#oasis1'
    },
    {
      url: '/images/hero/oasis1.jpg',
      title: 'Oasis 1',
      subtitle: 'Perfect for intimate gatherings and family outings',
      buttonText: 'View Oasis 1 Packages',
      buttonLink: '#oasis1'
    },
    {
      url: '/images/hero/oasis2.jpg',
      title: 'Oasis 2',
      subtitle: 'Spacious grounds ideal for larger events and celebrations',
      buttonText: 'View Oasis 2 Packages',
      buttonLink: '#oasis2'
    }
  ];

  return (
    <div className="home">
      <Navbar />
      
      {/* ===== HERO CAROUSEL ===== */}
      <section className="hero-carousel">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={1000}
          className="hero-swiper"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="hero-slide">
                <img 
                  src={image.url} 
                  alt={image.title} 
                  className="hero-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(image.title)}`;
                  }}
                />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <h1 className="hero-title">{image.title}</h1>
                  <p className="hero-subtitle">{image.subtitle}</p>
                  <a href={image.buttonLink} className="hero-btn">{image.buttonText}</a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Oasis 1 Section */}
      <section id="oasis1" className="oasis-section">
        <div className="container">
          <div className="oasis-section-header">
            <h2 className="oasis-section-title">Oasis 1</h2>
            <p className="oasis-section-subtitle">Perfect for intimate gatherings and family outings</p>
          </div>
          
          <div className="oasis-header">
            <p className="oasis-details">
              Oasis 1 is our cozy retreat designed for smaller groups seeking a peaceful escape. 
              With comfortable amenities and personalized service, we ensure every moment is memorable. 
              Ideal for family reunions, intimate celebrations, and romantic getaways.
            </p>
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

      {/* Oasis 2 Section */}
      <section id="oasis2" className="oasis-section oasis-2-bg">
        <div className="container">
          <div className="oasis-section-header">
            <h2 className="oasis-section-title">Oasis 2</h2>
            <p className="oasis-section-subtitle">Spacious grounds ideal for larger events and celebrations</p>
          </div>
          
          <div className="oasis-header">
            <p className="oasis-details">
              Oasis 2 boasts expansive gardens and spacious facilities perfect for large gatherings. 
              Whether you're planning a grand celebration, corporate event, or wedding, our dedicated 
              team will make it unforgettable. Experience luxury and comfort on a larger scale.
            </p>
          </div>
          
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
      </section>

      {/* Booking Rules Section */}
      <section className="rules-section">
        <div className="container">
          <h2 className="rules-title">Booking Information</h2>
          <div className="rules-grid">
            {BOOKING_RULES.map((rule, index) => (
              <div key={index} className="rule-card">
                <div className="rule-icon">{rule.icon}</div>
                <h3 className="rule-title">{rule.title}</h3>
                <p className="rule-desc">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Book Your Stay?</h2>
          <p className="cta-text">
            Choose your preferred oasis and package, then complete your reservation
          </p>
          <a href="#oasis1" className="cta-btn">View Packages</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;