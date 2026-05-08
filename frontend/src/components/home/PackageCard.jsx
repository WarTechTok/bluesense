// src/components/home/PackageCard.jsx
// ============================================
// PACKAGE CARD - With multi-image carousel support
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./PackageCard.css";

function PackageCard({ pkg, oasis }) {
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Build images array: prefer pkg.images[], fall back to single pkg.image
  const images = (() => {
    if (Array.isArray(pkg.images) && pkg.images.length > 0) return pkg.images;
    if (pkg.image) return [pkg.image];
    return [];
  })();

  const hasMultiple = images.length > 1;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
  }, [showModal]);

  const handleBook = () => {
    const token = localStorage.getItem("token");
    const bookingData = { package: pkg, oasis };
    if (!token) {
      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));
      navigate("/login?redirect=/booking");
      return;
    }
    navigate("/booking", { state: bookingData });
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || index === currentSlide) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 350);
    },
    [isTransitioning, currentSlide]
  );

  const prevSlide = (e) => {
    e.stopPropagation();
    goToSlide((currentSlide - 1 + images.length) % images.length);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    goToSlide((currentSlide + 1) % images.length);
  };

  const getStartingPrice = () => {
    if (pkg.name === "Package C") {
      return pkg.pricing?.["50pax"]?.Day?.weekday || 19000;
    }
    if (pkg.pricing?.weekday?.Day) return pkg.pricing.weekday.Day;
    const firstPrice = Object.values(pkg.pricing || {})[0];
    if (typeof firstPrice === "object") {
      return firstPrice.weekday || firstPrice.Day || 0;
    }
    return 0;
  };

  const startingPrice = getStartingPrice();

  return (
    <>
      <div className="package-card">
        {/* ===== IMAGE / CAROUSEL ===== */}
        <div className="package-card-image">
          {images.length > 0 ? (
            <>
              {/* Slides */}
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`carousel-slide ${i === currentSlide ? "carousel-slide--active" : ""}`}
                >
                  <img
                    src={src}
                    alt={`${pkg.name} ${i + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/400x200/e2e8f0/64748b?text=${encodeURIComponent(pkg.name)}`;
                    }}
                  />
                </div>
              ))}

              {/* Photo count badge */}
              {hasMultiple && (
                <div className="carousel-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1.1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  {images.length} photos
                </div>
              )}

              {/* Prev / Next arrows */}
              {hasMultiple && (
                <>
                  <button
                    className="carousel-btn carousel-btn--prev"
                    onClick={prevSlide}
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-btn carousel-btn--next"
                    onClick={nextSlide}
                    aria-label="Next photo"
                  >
                    ›
                  </button>

                  {/* Dot indicators */}
                  <div className="carousel-dots">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`carousel-dot ${i === currentSlide ? "carousel-dot--active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSlide(i);
                        }}
                        aria-label={`Go to photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="package-card-image-placeholder">
              <span>{pkg.name}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="package-card-content">
          <div className="package-card-header">
            <div>
              <h3 className="package-card-name">{pkg.name}</h3>
              <p className="package-card-subtitle">
                {pkg.subtitle || pkg.description}
              </p>
            </div>
            <span className="package-card-capacity">
              {pkg.capacity || "Up to 20 pax"}
            </span>
          </div>

          <div className="package-card-price">
            <div className="price-starting">
              <span className="price-label">Starting from</span>
              <span className="price-value">₱{startingPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="package-card-actions">
            <button
              className="view-details-btn"
              onClick={() => setShowModal(true)}
            >
              View Details
            </button>
            <button className="package-card-btn" onClick={handleBook}>
              Book Now →
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{pkg.name} – Inclusions</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>What's Included:</h4>
                <ul className="modal-inclusions-list">
                  {pkg.inclusions?.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              {pkg.addons?.length > 0 && pkg.addons.some((a) => a.price) && (
                <div className="modal-section">
                  <h4>Add-ons Available:</h4>
                  <ul className="modal-addons-list">
                    {pkg.addons.map(
                      (addon, i) =>
                        addon.price && (
                          <li key={i}>
                            <span>{addon.name}</span>
                            <span className="addon-price">
                              + ₱{addon.price.toLocaleString()}
                            </span>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PackageCard;