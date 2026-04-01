// src/components/home/PackageCard.jsx
// ============================================
// PACKAGE CARD - Displays a single package card
// on the Home page for Oasis 1 and Oasis 2
// ============================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/helpers";
import "./PackageCard.css";

function PackageCard({ pkg, oasis }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const isPackageC = pkg.id === "package-c";

  const handleBook = () => {
    navigate('/booking', { 
      state: { 
        package: pkg,
        oasis: oasis 
      } 
    });
  };

  return (
    <div className="package-card">

      {/* ── Package Image ── */}
      {pkg.image && (
        <div className="package-card-image">
          <img 
            src={pkg.image} 
            alt={pkg.name}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(pkg.name)}`;
            }}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="package-card-header">
        <div>
          <h3 className="package-card-name">{pkg.name}</h3>
          <p className="package-card-subtitle">{pkg.subtitle}</p>
        </div>
        <span className="package-card-capacity">{pkg.capacity}</span>
      </div>

      {/* ── Pricing ── */}
      <div className="package-card-price">
        {isPackageC ? (
          <div className="price-special">
            <div className="price-row">
              <span className="price-label">50 PAX</span>
              <span className="price-value">
                {formatPrice(19000)} – {formatPrice(26000)}
              </span>
            </div>
            <div className="price-row">
              <span className="price-label">100 PAX</span>
              <span className="price-value">
                {formatPrice(20000)} – {formatPrice(30000)}
              </span>
            </div>
          </div>
        ) : (
          <div className="price-grid">
            <div className="price-tier">
              <span className="price-tier-label">Mon–Thu</span>
              <div className="price-amounts">
                {Object.entries(pkg.pricing.weekday).map(([session, price]) => (
                  <span key={session} className="price-item">
                    <span className="session">{session}</span>
                    <span className="amount">{formatPrice(price)}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="price-tier">
              <span className="price-tier-label">Fri–Sun</span>
              <div className="price-amounts">
                {Object.entries(pkg.pricing.weekend).map(([session, price]) => (
                  <span key={session} className="price-item">
                    <span className="session">{session}</span>
                    <span className="amount">{formatPrice(price)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Inclusions Toggle ── */}
      <div className="package-card-inclusions">
        <button
          className="inclusions-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide inclusions ▲" : "View inclusions ▼"}
        </button>
        {expanded && (
          <ul className="inclusions-list">
            {pkg.inclusions.map((item, i) => (
              <li key={i}>✓ {item}</li>
            ))}
            {pkg.addons?.length > 0 && (
              <>
                <li className="addon-label">Add-ons available:</li>
                {pkg.addons.map((addon, i) => (
                  <li key={i} className="addon-item">
                    + {addon.name}
                    {addon.price ? ` — ${formatPrice(addon.price)}` : ""}
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* ── Book Button ── */}
      <button className="package-card-btn" onClick={handleBook}>
        Book This Package
      </button>

    </div>
  );
}

export default PackageCard;