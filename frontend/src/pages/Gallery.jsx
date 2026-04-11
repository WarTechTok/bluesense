// src/pages/Gallery.jsx
// ============================================
// GALLERY PAGE - Simple grid matching Home page design
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './Gallery.css';

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    { id: 1, url: '/images/gallery/pool.jpg', title: 'Swimming Pool', description: 'Bubble jacuzzi and fountain' },
    { id: 2, url: '/images/gallery/cottage.jpg', title: 'Cozy Cottages', description: 'Gazebo and kubo cottages' },
    { id: 3, url: '/images/gallery/family-room.jpg', title: 'Family Room', description: 'Air-conditioned with Netflix' },
    { id: 4, url: '/images/gallery/events.jpg', title: 'Event Spaces', description: 'Perfect for celebrations' },
    { id: 5, url: '/images/gallery/garden.jpg', title: 'Lush Gardens', description: 'Beautiful landscapes' },
    { id: 6, url: '/images/gallery/superior-room.jpg', title: 'Superior Room', description: 'Comfortable accommodation' }
  ];

  const openLightbox = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="gallery-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <h1>Gallery</h1>
          <p>Witness the beauty, elegance, and charm of Catherine's Oasis</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-content">
        <div className="container">
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <div 
                key={image.id} 
                className="gallery-item"
                onClick={() => openLightbox(image)}
              >
                <img 
                  src={image.url} 
                  alt={image.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/400x400/f8fafc/64748b?text=${encodeURIComponent(image.title)}`;
                  }}
                />
                <div className="gallery-overlay">
                  <div className="overlay-content">
                    <h3>{image.title}</h3>
                    <p>{image.description}</p>
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
          <p>Book your stay at Catherine's Oasis today</p>
          <Link to="/booking" className="cta-btn">Book Now</Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <img src={selectedImage.url} alt={selectedImage.title} />
            <div className="lightbox-caption">
              <h3>{selectedImage.title}</h3>
              <p>{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Gallery;