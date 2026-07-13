// frontend/src/components/modals/LeaveReviewModal.jsx
// ============================================
// LEAVE REVIEW MODAL
// Star rating + text + photo/video upload + anonymous toggle
// ============================================

import React, { useState } from 'react';
import { submitReview } from '../../services/reviews';
import './LeaveReviewModal.css';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star-btn ${s <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          aria-label={`${s} star${s !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

export default function LeaveReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating]         = useState(0);
  const [text, setText]             = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photos, setPhotos]         = useState([]);   // File[]
  const [photoPreview, setPhotoPreview] = useState([]); // object URL[]
  const [video, setVideo]           = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed.');
      return;
    }
    const newFiles = [...photos, ...files].slice(0, 5);
    setPhotos(newFiles);
    setPhotoPreview(newFiles.map((f) => URL.createObjectURL(f)));
    setError('');
  };

  const removePhoto = (idx) => {
    const newFiles = photos.filter((_, i) => i !== idx);
    setPhotos(newFiles);
    setPhotoPreview(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async () => {
    setError('');
    if (!rating) { setError('Please select a star rating.'); return; }
    if (text.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }
    if (text.trim().length > 500) { setError('Review must not exceed 500 characters.'); return; }

    setSubmitting(true);
    try {
      const res = await submitReview({
        bookingId: booking._id,
        rating,
        text,
        isAnonymous,
        photos,
        video,
      });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = text.length;

  return (
    <div className="lrm-overlay" onClick={onClose}>
      <div className="lrm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lrm-header">
          <h3>Leave a Review</h3>
          <button className="lrm-close" onClick={onClose}>✕</button>
        </div>

        <div className="lrm-body">
          {/* Booking info */}
          <div className="lrm-booking-info">
            <span className="lrm-booking-ref">
              #{booking.bookingReference || booking._id?.slice(-6).toUpperCase()}
            </span>
            <span className="lrm-booking-detail">{booking.oasis} · {booking.package}</span>
          </div>

          {/* Star rating */}
          <div className="lrm-field">
            <label className="lrm-label">Your Rating *</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="lrm-star-label">{STAR_LABELS[rating]}</span>
            )}
          </div>

          {/* Review text */}
          <div className="lrm-field">
            <label className="lrm-label">Your Review *</label>
            <textarea
              className="lrm-textarea"
              placeholder="Share your experience (minimum 10 characters, maximum 500)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <span className={`lrm-charcount ${charCount > 480 ? 'warning' : ''}`}>
              {charCount}/500
            </span>
          </div>

          {/* Photo upload */}
          <div className="lrm-field">
            <label className="lrm-label">Photos (optional, max 5)</label>
            <div className="lrm-media-row">
              {photoPreview.map((src, idx) => (
                <div key={idx} className="lrm-thumb">
                  <img src={src} alt={`Photo ${idx + 1}`} />
                  <button className="lrm-thumb-remove" onClick={() => removePhoto(idx)}>✕</button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="lrm-upload-btn">
                  <span>+ Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handlePhotos}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Video upload */}
          <div className="lrm-field">
            <label className="lrm-label">Video (optional, max 1)</label>
            {videoPreview ? (
              <div className="lrm-video-preview">
                <video src={videoPreview} controls className="lrm-video" />
                <button className="lrm-remove-video" onClick={removeVideo}>Remove Video</button>
              </div>
            ) : (
              <label className="lrm-upload-btn">
                <span>+ Video</span>
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleVideo}
                />
              </label>
            )}
          </div>

          {/* Anonymous toggle */}
          <div className="lrm-field lrm-anon-row">
            <label className="lrm-toggle-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Rate Anonymously</span>
              <span className="lrm-anon-hint">(your name will be hidden on the public page)</span>
            </label>
          </div>

          {error && <div className="lrm-error">{error}</div>}
        </div>

        <div className="lrm-footer">
          <button className="lrm-btn-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="lrm-btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}