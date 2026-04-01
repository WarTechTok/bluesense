import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './Gallery.css';

function Gallery() {
  const galleryImages = [
    { 
      id: 1,
      url: '/images/hero/oasis1.jpg', 
      title: 'Oasis 1 - Relaxation Area', 
      category: 'oasis1',
      description: 'Perfect relaxation space in Oasis 1'
    },
    { 
      id: 2,
      url: '/images/hero/oasis2.jpg', 
      title: 'Oasis 2 - Event Space', 
      category: 'oasis2',
      description: 'Spacious event hall in Oasis 2'
    },
    { 
      id: 3,
      url: '/images/hero/welcome.jpg', 
      title: 'Welcome Area', 
      category: 'other',
      description: 'Grand entrance to Catherine\'s Oasis'
    },
    { 
      id: 4,
      url: '/images/hero/oasis1.jpg', 
      title: 'Swimming Pool', 
      category: 'oasis1',
      description: 'Olympic-sized swimming pool'
    },
    { 
      id: 5,
      url: '/images/hero/oasis2.jpg', 
      title: 'Garden View', 
      category: 'oasis2',
      description: 'Lush gardens and outdoor seating'
    },
    { 
      id: 6,
      url: '/images/hero/welcome.jpg', 
      title: 'Dining Area', 
      category: 'other',
      description: 'Fine dining restaurant'
    },
    { 
      id: 7,
      url: '/images/hero/oasis1.jpg', 
      title: 'Spa & Wellness', 
      category: 'oasis1',
      description: 'Luxury spa facilities'
    },
    { 
      id: 8,
      url: '/images/hero/oasis2.jpg', 
      title: 'Conference Hall', 
      category: 'oasis2',
      description: 'State-of-the-art conference room'
    },
    { 
      id: 9,
      url: '/images/hero/welcome.jpg', 
      title: 'Luxury Rooms', 
      category: 'other',
      description: 'Premium accommodation'
    }
  ];

  return (
    <div className="gallery-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="hero-content">
          <h1>Gallery</h1>
          <p className="hero-subtitle">Witness the beauty, elegance, and charm of Catherine's Oasis</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-content">
        <div className="container">
          <p className="gallery-intro">
            Experience the stunning facilities and natural beauty of Catherine's Oasis through our curated collection of images.
          </p>

          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <div key={image.id} className="gallery-item">
                <div className="gallery-image-wrapper">
                  <img 
                    src={image.url} 
                    alt={image.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(image.title)}`;
                    }}
                  />
                  <div className="gallery-overlay">
                    <div className="overlay-content">
                      <h3 className="gallery-title">{image.title}</h3>
                      <p className="gallery-description">{image.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gallery-cta">
        <div className="container">
          <h2>Ready to Experience It Yourself?</h2>
          <p>Book your stay at Catherine's Oasis today and create unforgettable memories</p>
          <a href="/" className="cta-btn">Browse Packages</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Gallery;
