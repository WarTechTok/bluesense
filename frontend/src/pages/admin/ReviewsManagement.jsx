// frontend/src/pages/admin/ReviewsManagement.jsx
// ============================================
// ADMIN: Reviews Management
// View, moderate (approve/hide), delete reviews
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviewsAdmin, updateReviewStatus, deleteReview } from '../../services/reviews';
import './ReviewsManagement.css';

function StarDisplay({ rating }) {
  return (
    <span className="rm-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

function MediaPreview({ photos, video }) {
  const [lightbox, setLightbox] = useState(null); // { url, type }

  const allMedia = [
    ...(photos || []).map((p) => ({ url: p.url, type: 'image' })),
    ...(video?.url ? [{ url: video.url, type: 'video' }] : []),
  ];

  if (allMedia.length === 0) return <span className="rm-no-media">—</span>;

  return (
    <>
      <div className="rm-media-row">
        {allMedia.map((m, i) => (
          <button key={i} className="rm-media-thumb" onClick={() => setLightbox(m)}>
            {m.type === 'video' ? (
              <span className="rm-video-icon">▶</span>
            ) : (
              <img src={m.url} alt="" />
            )}
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="rm-lightbox" onClick={() => setLightbox(null)}>
          <div className="rm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="rm-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay className="rm-lightbox-media" />
            ) : (
              <img src={lightbox.url} alt="" className="rm-lightbox-media" />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReviewsAdmin();
      if (data.success) setReviews(data.reviews || []);
    } catch (e) {
      showToast('Failed to load reviews.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';
    setActionLoading(review._id + '-status');
    try {
      const res = await updateReviewStatus(review._id, newStatus);
      if (res.success) {
        setReviews((prev) => prev.map((r) => r._id === review._id ? { ...r, status: newStatus } : r));
        showToast(`Review ${newStatus}.`);
      } else {
        showToast(res.message || 'Failed.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id + '-delete');
    try {
      const res = await deleteReview(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        showToast('Review deleted.');
      } else {
        showToast(res.message || 'Failed.', 'error');
      }
    } finally {
      setActionLoading(null);
      setConfirmDelete(null);
    }
  };

  // Derived filtered list
  const filtered = reviews.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterRating && r.rating !== parseInt(filterRating)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.customerName?.toLowerCase().includes(q) &&
        !r.customerEmail?.toLowerCase().includes(q) &&
        !r.text?.toLowerCase().includes(q) &&
        !r.booking?.bookingReference?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    hidden: reviews.filter((r) => r.status === 'hidden').length,
    avgRating: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—',
  };

  return (
    <div className="rm-page">
      {/* Toast */}
      {toast && (
        <div className={`rm-toast rm-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="rm-header">
        <div>
          <h1 className="rm-title">Reviews Management</h1>
          <p className="rm-subtitle">Moderate and manage customer reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="rm-stats">
        <div className="rm-stat-card">
          <span className="rm-stat-value">{stats.total}</span>
          <span className="rm-stat-label">Total Reviews</span>
        </div>
        <div className="rm-stat-card rm-stat-card--green">
          <span className="rm-stat-value">{stats.approved}</span>
          <span className="rm-stat-label">Approved</span>
        </div>
        <div className="rm-stat-card rm-stat-card--red">
          <span className="rm-stat-value">{stats.hidden}</span>
          <span className="rm-stat-label">Hidden</span>
        </div>
        <div className="rm-stat-card rm-stat-card--yellow">
          <span className="rm-stat-value">{stats.avgRating}</span>
          <span className="rm-stat-label">Avg Rating</span>
        </div>
      </div>

      {/* Filters */}
      <div className="rm-toolbar">
        <input
          className="rm-search"
          type="text"
          placeholder="Search by name, email, or review text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rm-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
        <select className="rm-filter-select" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} Stars</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rm-loading">
          <div className="rm-spinner" />
          <p>Loading reviews…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rm-empty">No reviews found.</div>
      ) : (
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Booking</th>
                <th>Oasis / Package</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Media</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review._id}>
                  <td>
                    <div className="rm-customer">
                      <span className="rm-customer-name">
                        {review.isAnonymous ? '(Anonymous)' : review.customerName}
                      </span>
                      <span className="rm-customer-email">{review.customerEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rm-ref">
                      {review.booking?.bookingReference || review.booking?._id?.slice(-6).toUpperCase() || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="rm-oasis-pkg">
                      <span className="rm-oasis">{review.oasis}</span>
                      <span className="rm-pkg">{review.package}</span>
                    </div>
                  </td>
                  <td><StarDisplay rating={review.rating} /></td>
                  <td>
                    <p className="rm-text-preview">{review.text}</p>
                  </td>
                  <td>
                    <MediaPreview photos={review.photos} video={review.video} />
                  </td>
                  <td>
                    <span className="rm-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <span className={`rm-status-badge rm-status-badge--${review.status}`}>
                      {review.status}
                    </span>
                  </td>
                  <td>
                    <div className="rm-actions">
                      <button
                        className={`rm-btn rm-btn--toggle ${review.status === 'approved' ? 'rm-btn--hide' : 'rm-btn--approve'}`}
                        onClick={() => handleToggleStatus(review)}
                        disabled={actionLoading === review._id + '-status'}
                        title={review.status === 'approved' ? 'Hide review' : 'Approve review'}
                      >
                        {actionLoading === review._id + '-status'
                          ? '…'
                          : review.status === 'approved' ? 'Hide' : 'Approve'}
                      </button>
                      <button
                        className="rm-btn rm-btn--delete"
                        onClick={() => setConfirmDelete(review)}
                        title="Delete review"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="rm-confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="rm-confirm-box" onClick={(e) => e.stopPropagation()}>
            <h4>Delete Review?</h4>
            <p>
              This will permanently delete the review from{' '}
              <strong>{confirmDelete.isAnonymous ? 'Anonymous' : confirmDelete.customerName}</strong>.
              This cannot be undone.
            </p>
            <div className="rm-confirm-actions">
              <button className="rm-btn rm-btn--cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="rm-btn rm-btn--delete"
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={actionLoading === confirmDelete._id + '-delete'}
              >
                {actionLoading === confirmDelete._id + '-delete' ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}