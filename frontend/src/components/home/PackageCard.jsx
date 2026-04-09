// src/components/home/PackageCard.jsx
// ============================================
// PACKAGE CARD - Displays package with image
// ============================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PackageCard.css";

function PackageCard({ pkg, oasis }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
  }, [showModal]);

  const handleBook = () => {
    const token = localStorage.getItem('token');
    const bookingData = { package: pkg, oasis: oasis };
    
    if (!token) {
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      navigate('/login?redirect=/booking');
      return;
    }
    
    navigate('/booking', { state: bookingData });
  };

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Get starting price for display
  const getStartingPrice = () => {
    // Handle Package C special pricing
    if (pkg.name === 'Package C') {
      // Get the 50pax weekday Day rate
      return pkg.pricing?.['50pax']?.Day?.weekday || 19000;
    }
    
    // Regular packages - get the weekday Day rate
    if (pkg.pricing?.weekday?.Day) {
      return pkg.pricing.weekday.Day;
    }
    
    // Fallback to first available price
    const firstPrice = Object.values(pkg.pricing || {})[0];
    if (typeof firstPrice === 'object') {
      return firstPrice.weekday || firstPrice.Day || 0;
    }
    
    return 0;
  };

  const startingPrice = getStartingPrice();

  return (
    <>
      <div className="package-card">
        {/* Package Image Banner */}
        <div className="package-card-image">
          {pkg.image ? (
            <img 
              src={pkg.image} 
              alt={pkg.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/400x200/e2e8f0/64748b?text=${encodeURIComponent(pkg.name)}`;
              }}
            />
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
              <p className="package-card-subtitle">{pkg.subtitle || pkg.description}</p>
            </div>
            <span className="package-card-capacity">{pkg.capacity || 'Up to 20 pax'}</span>
          </div>

          {/* Pricing */}
          <div className="package-card-price">
            <div className="price-starting">
              <span className="price-label">Starting from</span>
              <span className="price-value">₱{startingPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
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

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{pkg.name} - Inclusions</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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

              {pkg.addons?.length > 0 && pkg.addons.some(a => a.price) && (
                <div className="modal-section">
                  <h4>Add-ons Available:</h4>
                  <ul className="modal-addons-list">
                    {pkg.addons.map((addon, i) => (
                      addon.price && (
                        <li key={i}>
                          <span>{addon.name}</span>
                          <span className="addon-price">+ ₱{addon.price.toLocaleString()}</span>
                        </li>
                      )
                    ))}
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