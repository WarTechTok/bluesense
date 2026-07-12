// frontend/src/pages/Gallery.jsx
// ============================================
// GALLERY PAGE - Dynamic images from API + 5 layout modes
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { getGalleryImages } from '../services/admin/gallery';
import './Gallery.css';

// ── Layout mode config ───────────────────────
const LAYOUT_MODES = [
  { id: 'grid',      label: 'Grid',      icon: 'fas fa-th' },
  { id: 'masonry',   label: 'Masonry',   icon: 'fas fa-columns' },
  { id: 'horizontal',label: 'Wide',      icon: 'fas fa-grip-lines' },
  { id: 'vertical',  label: 'Portrait',  icon: 'fas fa-grip-lines-vertical' },
  { id: 'slideshow', label: 'Slideshow', icon: 'fas fa-play-circle' },
];

// ── Lightbox ─────────────────────────────────
const Lightbox = ({ images, index, onClose }) => {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div className="gallery-lightbox-overlay" onClick={onClose}>
      <button className="gallery-lb-close" onClick={onClose}>✕</button>
      <button className="gallery-lb-nav gallery-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>
        <i className="fas fa-chevron-left" />
      </button>

      <div className="gallery-lb-content" onClick={(e) => e.stopPropagation()}>
        <img src={img.imageUrl} alt={img.title} />
        <div className="gallery-lb-caption">
          <h3>{img.title}</h3>
          {img.description && <p>{img.description}</p>}
          <span className="gallery-lb-counter">{current + 1} / {images.length}</span>
        </div>
      </div>

      <button className="gallery-lb-nav gallery-lb-next" onClick={(e) => { e.stopPropagation(); next(); }}>
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
};

// ── Slideshow ─────────────────────────────────
const Slideshow = ({ images, onImageClick }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent((index + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused, images.length]);

  if (images.length === 0) return null;
  const img = images[current];

  return (
    <div className="gallery-slideshow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="gallery-ss-main" onClick={() => onImageClick(current)}>
        <img src={img.imageUrl} alt={img.title} key={current} />
        <div className="gallery-ss-caption">
          <h3>{img.title}</h3>
          {img.description && <p>{img.description}</p>}
        </div>
        <div className="gallery-ss-progress">
          <div
            className="gallery-ss-progress-bar"
            style={{ animationDuration: paused ? '0s' : '4s', animationPlayState: paused ? 'paused' : 'running' }}
            key={`${current}-${paused}`}
          />
        </div>
      </div>

      <div className="gallery-ss-nav">
        <button className="gallery-ss-arrow" onClick={() => goTo(current - 1)}>
          <i className="fas fa-chevron-left" />
        </button>

        <div className="gallery-ss-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`gallery-ss-dot ${i === current ? 'gallery-ss-dot-active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button className="gallery-ss-arrow" onClick={() => goTo(current + 1)}>
          <i className="fas fa-chevron-right" />
        </button>
      </div>

      <div className="gallery-ss-thumbnails">
        {images.map((img, i) => (
          <button
            key={img._id}
            className={`gallery-ss-thumb ${i === current ? 'gallery-ss-thumb-active' : ''}`}
            onClick={() => goTo(i)}
          >
            <img src={img.imageUrl} alt={img.title} />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Image Item (shared across grid layouts) ───
const GalleryItem = ({ image, className, onClick }) => (
  <div className={`gallery-item ${className || ''}`} onClick={onClick}>
    <img
      src={image.imageUrl}
      alt={image.title}
      loading="lazy"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(image.title)}`;
      }}
    />
    <div className="gallery-overlay">
      <div className="overlay-content">
        <h3>{image.title}</h3>
        {image.description && <p>{image.description}</p>}
      </div>
    </div>
  </div>
);

// ── Main Gallery Component ────────────────────
function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('grid');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getGalleryImages();
        setImages(data);
      } catch (err) {
        console.error('Gallery fetch error:', err);
        setError('Failed to load gallery images.');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  return (
    <div className="gallery-page">
      <Navbar />

      {/* Hero */}
      <section className="gallery-hero">
        <div className="container">
          <h1>Gallery</h1>
          <p>Witness the beauty, elegance, and charm of Catherine's Oasis</p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="gallery-content">
        <div className="container">

          {/* Layout switcher */}
          {!loading && !error && images.length > 0 && (
            <div className="gallery-toolbar">
              <p className="gallery-count">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
              <div className="gallery-layout-switcher">
                {LAYOUT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    className={`gallery-layout-btn ${layout === mode.id ? 'gallery-layout-btn-active' : ''}`}
                    onClick={() => setLayout(mode.id)}
                    title={mode.label}
                  >
                    <i className={mode.icon} />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* States */}
          {loading && (
            <div className="gallery-state">
              <div className="gallery-spinner" />
              <p>Loading gallery…</p>
            </div>
          )}

          {error && (
            <div className="gallery-state gallery-state-error">
              <i className="fas fa-exclamation-circle" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="gallery-state">
              <i className="fas fa-images" />
              <p>No gallery images yet. Check back soon!</p>
            </div>
          )}

          {/* ── Slideshow ── */}
          {!loading && !error && images.length > 0 && layout === 'slideshow' && (
            <Slideshow images={images} onImageClick={openLightbox} />
          )}

          {/* ── Default Grid (3 columns, square) ── */}
          {!loading && !error && images.length > 0 && layout === 'grid' && (
            <div className="gallery-grid">
              {images.map((img, i) => (
                <GalleryItem key={img._id} image={img} onClick={() => openLightbox(i)} />
              ))}
            </div>
          )}

          {/* ── Masonry (Pinterest-style, pure CSS columns) ── */}
          {!loading && !error && images.length > 0 && layout === 'masonry' && (
            <div className="gallery-masonry">
              {images.map((img, i) => (
                <GalleryItem key={img._id} image={img} className="gallery-masonry-item" onClick={() => openLightbox(i)} />
              ))}
            </div>
          )}

          {/* ── Horizontal (wide 16:9, 2 rows) ── */}
          {!loading && !error && images.length > 0 && layout === 'horizontal' && (
            <div className="gallery-horizontal">
              {images.map((img, i) => (
                <GalleryItem key={img._id} image={img} className="gallery-horizontal-item" onClick={() => openLightbox(i)} />
              ))}
            </div>
          )}

          {/* ── Vertical (2 columns, portrait 3:4) ── */}
          {!loading && !error && images.length > 0 && layout === 'vertical' && (
            <div className="gallery-vertical">
              {images.map((img, i) => (
                <GalleryItem key={img._id} image={img} className="gallery-vertical-item" onClick={() => openLightbox(i)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="gallery-cta">
        <div className="container">
          <h2>Ready to Experience It Yourself?</h2>
          <p>Book your stay at Catherine's Oasis today</p>
          <Link to="/booking" className="cta-btn">Book Now</Link>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} />
      )}

      <Footer />
    </div>
  );
}

export default Gallery;