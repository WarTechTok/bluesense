// frontend/src/pages/admin/CustomerReviews.jsx
// ============================================
// ADMIN: Customer Reviews (View Only)
// View all reviews - no delete, no approve/hide
// Filters: rating, oasis, package
// Search: customer name or review text
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviewsAdmin } from '../../services/reviews';
import './CustomerReviews.css';

// ─── Star display ───────────────────────────────────────────────────────────
function StarDisplay({ rating }) {
  return (
    <span className="cr-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

// ─── Media thumbnails + lightbox ────────────────────────────────────────────
function MediaPreview({ photos, video }) {
  const [lightbox, setLightbox] = useState(null); // { url, type }

  const allMedia = [
    ...(photos || []).map((p) => ({ url: p.url, type: 'image' })),
    ...(video?.url ? [{ url: video.url, type: 'video' }] : []),
  ];

  if (allMedia.length === 0) return <span className="cr-no-media">—</span>;

  return (
    <>
      <div className="cr-media-row">
        {allMedia.map((m, i) => (
          <button
            key={i}
            className="cr-media-thumb"
            onClick={() => setLightbox(m)}
            aria-label={m.type === 'video' ? 'Play video' : 'View photo'}
          >
            {m.type === 'video' ? (
              <span className="cr-video-icon">▶</span>
            ) : (
              <img src={m.url} alt="" />
            )}
          </button>
        ))}
      </div>

      {lightbox && (
        <div className="cr-lightbox" onClick={() => setLightbox(null)}>
          <div className="cr-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="cr-lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ✕
            </button>
            {lightbox.type === 'video' ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="cr-lightbox-media"
              />
            ) : (
              <img src={lightbox.url} alt="" className="cr-lightbox-media" />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function CustomerReviews() {
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Filters
  const [search, setSearch]           = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterOasis, setFilterOasis]   = useState('');
  const [filterPackage, setFilterPackage] = useState('');

  // ── Load reviews ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReviewsAdmin();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError(data.message || 'Failed to load reviews.');
      }
    } catch {
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ─────────────────────────────────────────────────────────

  // Unique package list from loaded reviews (for filter dropdown)
  const packageOptions = [...new Set(reviews.map((r) => r.package).filter(Boolean))].sort();

  // Apply filters
  const filtered = reviews.filter((r) => {
    if (filterRating && r.rating !== parseInt(filterRating)) return false;
    if (filterOasis  && r.oasis !== filterOasis)              return false;
    if (filterPackage && r.package !== filterPackage)         return false;
    if (search) {
      const q = search.toLowerCase();
      const name = r.isAnonymous ? 'anonymous' : (r.customerName || '').toLowerCase();
      const text = (r.text || '').toLowerCase();
      if (!name.includes(q) && !text.includes(q)) return false;
    }
    return true;
  });

  // Summary stats
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const clearFilters = () => {
    setSearch('');
    setFilterRating('');
    setFilterOasis('');
    setFilterPackage('');
  };

  const hasFilters = search || filterRating || filterOasis || filterPackage;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cr-page">

      {/* ── Header ── */}
      <div className="cr-header">
        <div>
          <h1 className="cr-title">Customer Reviews</h1>
          <p className="cr-subtitle">View and browse all guest reviews</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="cr-stats">
        <div className="cr-stat-card">
          <span className="cr-stat-value">{reviews.length}</span>
          <span className="cr-stat-label">Total Reviews</span>
        </div>
        <div className="cr-stat-card cr-stat-card--yellow">
          <span className="cr-stat-value">{avgRating}</span>
          <span className="cr-stat-label">Avg Rating</span>
        </div>
        <div className="cr-stat-card cr-stat-card--blue">
          <span className="cr-stat-value">
            {reviews.filter((r) => r.isAnonymous).length}
          </span>
          <span className="cr-stat-label">Anonymous</span>
        </div>
        <div className="cr-stat-card cr-stat-card--purple">
          <span className="cr-stat-value">
            {reviews.filter((r) => (r.photos?.length > 0) || r.video?.url).length}
          </span>
          <span className="cr-stat-label">With Media</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="cr-toolbar">
        <div className="cr-search-wrap">
          <i className="fas fa-search cr-search-icon" />
          <input
            className="cr-search"
            type="text"
            placeholder="Search by customer name or review text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="cr-filter-select"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>{s} Stars</option>
          ))}
        </select>

        <select
          className="cr-filter-select"
          value={filterOasis}
          onChange={(e) => setFilterOasis(e.target.value)}
        >
          <option value="">All Oasis</option>
          <option value="Oasis 1">Oasis 1</option>
          <option value="Oasis 2">Oasis 2</option>
        </select>

        <select
          className="cr-filter-select"
          value={filterPackage}
          onChange={(e) => setFilterPackage(e.target.value)}
        >
          <option value="">All Packages</option>
          {packageOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {hasFilters && (
          <button className="cr-clear-btn" onClick={clearFilters}>
            <i className="fas fa-times" /> Clear
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      {!loading && !error && (
        <p className="cr-result-count">
          {filtered.length === reviews.length
            ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
            : `${filtered.length} of ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── States: loading / error / empty / table ── */}
      {loading ? (
        <div className="cr-loading">
          <div className="cr-spinner" />
          <p>Loading reviews…</p>
        </div>
      ) : error ? (
        <div className="cr-error">
          <i className="fas fa-exclamation-circle" />
          <p>{error}</p>
          <button className="cr-retry-btn" onClick={load}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cr-empty">
          <i className="fas fa-star cr-empty-icon" />
          <p>{hasFilters ? 'No reviews match your filters.' : 'No reviews yet.'}</p>
          {hasFilters && (
            <button className="cr-clear-btn" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="cr-table-wrap">
          <table className="cr-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Photos / Video</th>
                <th>Date</th>
                <th>Oasis</th>
                <th>Package</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review._id}>

                  {/* Customer */}
                  <td>
                    <div className="cr-customer">
                      {review.isAnonymous ? (
                        <span className="cr-customer-name cr-anon">Anonymous</span>
                      ) : (
                        <span className="cr-customer-name">{review.customerName}</span>
                      )}
                      {!review.isAnonymous && review.customerEmail && (
                        <span className="cr-customer-email">{review.customerEmail}</span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td>
                    <StarDisplay rating={review.rating} />
                  </td>

                  {/* Review text */}
                  <td>
                    <p className="cr-text-preview">{review.text}</p>
                  </td>

                  {/* Media */}
                  <td>
                    <MediaPreview photos={review.photos} video={review.video} />
                  </td>

                  {/* Date */}
                  <td>
                    <span className="cr-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Oasis */}
                  <td>
                    <span className="cr-oasis-badge">{review.oasis}</span>
                  </td>

                  {/* Package */}
                  <td>
                    <span className="cr-pkg">{review.package}</span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}