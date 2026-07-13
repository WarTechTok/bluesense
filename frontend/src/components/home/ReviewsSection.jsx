// frontend/src/components/home/ReviewsSection.jsx
// ============================================
// DYNAMIC REVIEWS SECTION
// Carousel slider + filters + average rating display
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicReviews } from '../../services/reviews';
import './ReviewsSection.css';

// ============================================
// HELPERS
// ============================================
const OASIS_OPTIONS = ['All', 'Oasis 1', 'Oasis 2'];

// Packages per oasis (static fallback — mirrors DB structure)
const PACKAGES_BY_OASIS = {
  'Oasis 1': ['All', 'Package 1', 'Package 2', 'Package 3', 'Package 4', 'Package 5', 'Package 5+'],
  'Oasis 2': ['All', 'Package A', 'Package B', 'Package C'],
};

function StarDisplay({ rating, size = 'sm' }) {
  return (
    <span className={`star-display star-display--${size}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star filled' : 'star empty'}>★</span>
      ))}
    </span>
  );
}

function MediaLightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, items.length - 1));
      if (e.key === 'ArrowLeft')  setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items.length, onClose]);

  const item = items[current];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay className="lightbox-media" />
        ) : (
          <img src={item.url} alt="" className="lightbox-media" />
        )}
        {items.length > 1 && (
          <>
            <button className="lightbox-nav lightbox-nav--prev" onClick={() => setCurrent((c) => Math.max(c - 1, 0))} disabled={current === 0}>‹</button>
            <button className="lightbox-nav lightbox-nav--next" onClick={() => setCurrent((c) => Math.min(c + 1, items.length - 1))} disabled={current === items.length - 1}>›</button>
            <div className="lightbox-counter">{current + 1} / {items.length}</div>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const mediaItems = [
    ...(review.photos || []).map((p) => ({ type: 'image', url: p.url })),
    ...(review.video?.url ? [{ type: 'video', url: review.video.url }] : []),
  ];

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const displayName = review.isAnonymous ? 'Anonymous Guest' : review.customerName;
  const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="review-card__meta">
          <span className="review-card__name">{displayName}</span>
          <span className="review-card__date">{dateStr}</span>
        </div>
        <div className="review-card__badge">{review.oasis}</div>
      </div>

      <div className="review-card__stars">
        <StarDisplay rating={review.rating} size="md" />
      </div>

      <p className="review-card__text">"{review.text}"</p>

      {mediaItems.length > 0 && (
        <div className="review-card__media">
          {mediaItems.map((item, idx) => (
            <button
              key={idx}
              className="review-media-thumb"
              onClick={() => openLightbox(idx)}
              aria-label={item.type === 'video' ? 'Play video' : 'View photo'}
            >
              {item.type === 'video' ? (
                <div className="review-media-thumb__video">
                  <span className="play-icon">▶</span>
                </div>
              ) : (
                <img src={item.url} alt={`Review photo ${idx + 1}`} />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="review-card__footer">
        <span className="review-card__package">{review.package}</span>
      </div>

      {lightboxOpen && (
        <MediaLightbox items={mediaItems} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMedia, setFilterMedia] = useState(false);
  const [filterRating, setFilterRating] = useState('');
  const [filterOasis, setFilterOasis] = useState('All');
  const [filterPackage, setFilterPackage] = useState('All');

  // Carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CARDS_PER_VIEW = windowWidth <= 640 ? 1 : windowWidth <= 1024 ? 2 : 3;
  const SLIDE_WIDTH_PCT = 100 / CARDS_PER_VIEW;

  const packageOptions =
    filterOasis !== 'All'
      ? PACKAGES_BY_OASIS[filterOasis] || ['All']
      : ['All'];

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterMedia) filters.media = true;
      if (filterRating) filters.rating = filterRating;
      if (filterOasis !== 'All') filters.oasis = filterOasis;
      if (filterPackage !== 'All') filters.package = filterPackage;

      const data = await getPublicReviews(filters);
      if (data.success) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setDistribution(data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
      setCurrentSlide(0);
    }
  }, [filterMedia, filterRating, filterOasis, filterPackage]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Reset package filter when oasis changes
  useEffect(() => { setFilterPackage('All'); }, [filterOasis]);

  const maxSlide = Math.max(0, reviews.length - CARDS_PER_VIEW);

  const prev = () => setCurrentSlide((s) => Math.max(s - 1, 0));
  const next = () => setCurrentSlide((s) => Math.min(s + 1, maxSlide));

  const clearFilters = () => {
    setFilterMedia(false);
    setFilterRating('');
    setFilterOasis('All');
    setFilterPackage('All');
  };

  const hasActiveFilters = filterMedia || filterRating || filterOasis !== 'All' || filterPackage !== 'All';

  return (
    <section className="reviews-section">
      <div className="container">
        {/* Header - simple like Login page */}
        <div className="section-header">
          <h2 className="section-title">What Our Guests Say</h2>
        </div>

        {/* Summary bar */}
        {totalReviews > 0 && (
          <div className="reviews-summary">
            <div className="reviews-summary__score">
              <span className="reviews-summary__avg">{averageRating.toFixed(1)}</span>
              <div className="reviews-summary__right">
                <StarDisplay rating={Math.round(averageRating)} size="lg" />
                <span className="reviews-summary__count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="reviews-summary__bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="rating-bar-row">
                    <span className="rating-bar-label">{star}★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rating-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters - simple icons like Login page */}
        <div className="reviews-filters">
          <button
            className={`filter-chip ${filterMedia ? 'active' : ''}`}
            onClick={() => setFilterMedia((v) => !v)}
          >
            <i className="fas fa-image"></i> With Media
          </button>

          <select
            className="filter-select"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value=""><i className="fas fa-star"></i> All Stars</option>
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>{s} Star{s !== 1 ? 's' : ''}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterOasis}
            onChange={(e) => setFilterOasis(e.target.value)}
          >
            {OASIS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === 'All' ? 'All Oasis' : o}</option>
            ))}
          </select>

          {filterOasis !== 'All' && (
            <select
              className="filter-select"
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
            >
              {packageOptions.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All Packages' : p}</option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button className="filter-chip filter-chip--clear" onClick={clearFilters}>
              <i className="fas fa-times"></i> Clear
            </button>
          )}
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="reviews-loading">
            <div className="loading-spinner" />
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>No reviews found{hasActiveFilters ? ' for the selected filters' : ''}.</p>
            {hasActiveFilters && (
              <button className="filter-chip" onClick={clearFilters}>Clear Filters</button>
            )}
          </div>
        ) : (
          <div className="reviews-carousel">
            <button
              className="carousel-arrow carousel-arrow--left"
              onClick={prev}
              disabled={currentSlide === 0}
              aria-label="Previous reviews"
            >
              ‹
            </button>

            <div className="carousel-viewport">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentSlide * SLIDE_WIDTH_PCT}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review._id} className="carousel-slide">
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>

            <button
              className="carousel-arrow carousel-arrow--right"
              onClick={next}
              disabled={currentSlide >= maxSlide}
              aria-label="Next reviews"
            >
              ›
            </button>
          </div>
        )}

        {/* Dot indicators */}
        {reviews.length > CARDS_PER_VIEW && (
          <div className="carousel-dots">
            {Array.from({ length: maxSlide + 1 }).map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${currentSlide === i ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}