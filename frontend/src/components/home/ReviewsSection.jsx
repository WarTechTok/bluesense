// frontend/src/components/home/ReviewsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPublicReviews } from '../../services/reviews';
import './ReviewsSection.css';

const OASIS_OPTIONS = ['All', 'Oasis 1', 'Oasis 2'];
const PACKAGES_BY_OASIS = {
  'Oasis 1': ['All', 'Package 1', 'Package 2', 'Package 3', 'Package 4', 'Package 5', 'Package 5+'],
  'Oasis 2': ['All', 'Package A', 'Package B', 'Package C'],
};

function Stars({ rating, size = 'sm' }) {
  return (
    <span className={`stars stars--${size}`} aria-label={`${rating} out of 5`}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= rating ? 'star star--on' : 'star star--off'}>★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  const [lightbox, setLightbox] = useState(null); // null | index

  const media = [
    ...(review.photos || []).map(p => ({ type: 'image', url: p.url })),
    ...(review.video?.url ? [{ type: 'video', url: review.video.url }] : []),
  ];

  const name = review.isAnonymous ? 'Anonymous Guest' : review.customerName;
  const initials = name.charAt(0).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  useEffect(() => {
    if (lightbox === null) return;
    const handler = e => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => Math.min(i + 1, media.length - 1));
      if (e.key === 'ArrowLeft')  setLightbox(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, media.length]);

  return (
    <div className="rc">
      <div className="rc__top">
        <div className="rc__avatar">{initials}</div>
        <div className="rc__info">
          <span className="rc__name">{name}</span>
          <span className="rc__date">{date}</span>
        </div>
        <span className="rc__oasis">{review.oasis}</span>
      </div>

      <Stars rating={review.rating} size="md" />

      <p className="rc__text">"{review.text}"</p>

      {media.length > 0 && (
        <div className="rc__media">
          {media.map((item, i) => (
            <button key={i} className="rc__thumb" onClick={() => setLightbox(i)}>
              {item.type === 'video'
                ? <div className="rc__thumb-video"><span>▶</span></div>
                : <img src={item.url} alt="" />}
            </button>
          ))}
        </div>
      )}

      <div className="rc__footer">
        <span className="rc__package">{review.package}</span>
      </div>

      {lightbox !== null && (
        <div className="lb" onClick={() => setLightbox(null)}>
          <div className="lb__box" onClick={e => e.stopPropagation()}>
            <button className="lb__close" onClick={() => setLightbox(null)}>✕</button>
            {media[lightbox].type === 'video'
              ? <video src={media[lightbox].url} controls autoPlay className="lb__media" />
              : <img src={media[lightbox].url} alt="" className="lb__media" />}
            {media.length > 1 && <>
              <button className="lb__nav lb__nav--l" onClick={() => setLightbox(i => Math.max(i-1,0))} disabled={lightbox===0}>‹</button>
              <button className="lb__nav lb__nav--r" onClick={() => setLightbox(i => Math.min(i+1,media.length-1))} disabled={lightbox===media.length-1}>›</button>
              <div className="lb__counter">{lightbox+1} / {media.length}</div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewsSection() {
  const [reviews,      setReviews]      = useState([]);
  const [avgRating,    setAvgRating]    = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState({ 5:0,4:0,3:0,2:0,1:0 });
  const [loading,      setLoading]      = useState(true);

  const [filterMedia,   setFilterMedia]   = useState(false);
  const [filterRating,  setFilterRating]  = useState('');
  const [filterOasis,   setFilterOasis]   = useState('All');
  const [filterPackage, setFilterPackage] = useState('All');

  const [page, setPage] = useState(0);
  const PER_PAGE = 3;

  const packageOptions = filterOasis !== 'All' ? PACKAGES_BY_OASIS[filterOasis] || ['All'] : ['All'];
  const hasFilters = filterMedia || filterRating || filterOasis !== 'All' || filterPackage !== 'All';

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setPage(0);
    try {
      const f = {};
      if (filterMedia)              f.media   = true;
      if (filterRating)             f.rating  = filterRating;
      if (filterOasis   !== 'All')  f.oasis   = filterOasis;
      if (filterPackage !== 'All')  f.package = filterPackage;

      const data = await getPublicReviews(f);
      if (data.success) {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setDistribution(data.distribution || { 5:0,4:0,3:0,2:0,1:0 });
      }
    } catch (e) {
      console.error('Reviews fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [filterMedia, filterRating, filterOasis, filterPackage]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setFilterPackage('All'); }, [filterOasis]);

  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const pageReviews = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const clearFilters = () => {
    setFilterMedia(false);
    setFilterRating('');
    setFilterOasis('All');
    setFilterPackage('All');
  };

  return (
    <section className="rs">
      <div className="rs__inner">

        {/* Header */}
        <div className="rs__head">
          <div>
            <p className="rs__label">WHAT OUR GUESTS SAY</p>
            <div className="rs__underline" />
          </div>
        </div>

        {/* Summary */}
        {totalReviews > 0 && (
          <div className="rs__summary">
            <div className="rs__score">
              <span className="rs__avg">{avgRating.toFixed(1)}</span>
              <div>
                <Stars rating={Math.round(avgRating)} size="lg" />
                <p className="rs__count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="rs__bars">
              {[5,4,3,2,1].map(star => {
                const count = distribution[star] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="rs__bar-row">
                    <span className="rs__bar-label">{star}★</span>
                    <div className="rs__bar-track">
                      <div className="rs__bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rs__bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rs__filters">
          <button className={`rs__chip ${filterMedia ? 'rs__chip--on' : ''}`} onClick={() => setFilterMedia(v => !v)}>
            📷 With Media
          </button>
          <select className="rs__select" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
            <option value="">All Stars</option>
            {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Star{s!==1?'s':''}</option>)}
          </select>
          <select className="rs__select" value={filterOasis} onChange={e => setFilterOasis(e.target.value)}>
            {OASIS_OPTIONS.map(o => <option key={o} value={o}>{o === 'All' ? 'All Oasis' : o}</option>)}
          </select>
          {filterOasis !== 'All' && (
            <select className="rs__select" value={filterPackage} onChange={e => setFilterPackage(e.target.value)}>
              {packageOptions.map(p => <option key={p} value={p}>{p === 'All' ? 'All Packages' : p}</option>)}
            </select>
          )}
          {hasFilters && (
            <button className="rs__chip rs__chip--clear" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="rs__state">
            <div className="rs__spinner" />
            <p>Loading reviews…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rs__state">
            <p>No reviews found{hasFilters ? ' for selected filters' : ''}.</p>
            {hasFilters && <button className="rs__chip" onClick={clearFilters}>Clear Filters</button>}
          </div>
        ) : (
          <>
            <div className="rs__grid">
              {pageReviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="rs__pagination">
                <button className="rs__pg-btn" onClick={() => setPage(p => p-1)} disabled={page === 0}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`rs__pg-dot ${page === i ? 'rs__pg-dot--on' : ''}`}
                    onClick={() => setPage(i)}
                  />
                ))}
                <button className="rs__pg-btn" onClick={() => setPage(p => p+1)} disabled={page === totalPages-1}>›</button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}