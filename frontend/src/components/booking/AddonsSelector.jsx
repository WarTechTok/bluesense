// frontend/src/components/booking/AddonsSelector.jsx
// ============================================
// ADD-ONS SELECTOR - Filtered by selected session
// ============================================

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ── Session filtering (mirrors backend logic, used as a safety net) ──────────
// Returns true if the addon should be shown for the given session.
//   'All'   → always visible
//   'Day'   → only when session is Day
//   'Night' → only when session is Night
//   '22hrs' → only when session is 22hrs
const addonMatchesSession = (addon, session) => {
  const assigned = addon.availableForSessions || [];

  // No session context yet → show everything (shouldn't normally happen)
  if (!session) return true;

  // 'All' trumps everything
  if (assigned.includes('All')) return true;

  // Must match the exact session
  return assigned.includes(session);
};

function AddonsSelector({ packageData, selectedSession, onAddonsChange }) {
  const [selectedAddons, setSelectedAddons] = useState({});
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch (and re-filter) whenever the session changes
  useEffect(() => {
    const loadAddons = async () => {
      setLoading(true);
      try {
        // Pass the session to the backend so it does the primary filtering
        const url = selectedSession
          ? `${API_BASE_URL}/api/admin/addons/active?session=${encodeURIComponent(selectedSession)}`
          : `${API_BASE_URL}/api/admin/addons/active`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load add-ons');

        const data = await res.json();

        // Client-side guard: apply the same rule in case backend skipped it
        const filtered = data.filter((addon) => addonMatchesSession(addon, selectedSession));
        setAddons(filtered);
      } catch (err) {
        console.error('Error loading add-ons:', err);
        setAddons([]);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [selectedSession]); // re-run every time the session changes

  // When the session changes, clear any previously selected add-ons that are
  // no longer valid for the new session
  useEffect(() => {
    if (Object.keys(selectedAddons).length === 0) return;

    const stillValid = {};
    for (const [name, price] of Object.entries(selectedAddons)) {
      const addon = addons.find((a) => a.name === name);
      if (addon) stillValid[name] = price;
    }

    // Only update if something was actually removed
    if (Object.keys(stillValid).length !== Object.keys(selectedAddons).length) {
      setSelectedAddons(stillValid);
      onAddonsChange(stillValid);
    }
  }, [addons]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddonToggle = (addon) => {
    const newSelected = { ...selectedAddons };
    if (newSelected[addon.name]) {
      delete newSelected[addon.name];
    } else {
      newSelected[addon.name] = addon.price;
    }
    setSelectedAddons(newSelected);
    onAddonsChange(newSelected);
  };

  if (loading) {
    return (
      <div className="addons-section">
        <h3 className="section-title">
          <i className="fas fa-plus-circle"></i>
          Add-ons
        </h3>
        <p className="section-subtitle">Loading add-ons...</p>
      </div>
    );
  }

  if (addons.length === 0) {
    return (
      <div className="addons-section">
        <h3 className="section-title">
          <i className="fas fa-plus-circle"></i>
          Add-ons
        </h3>
        <p className="section-subtitle">
          {selectedSession
            ? `No add-ons available for the ${selectedSession} session`
            : 'No add-ons available at this time'}
        </p>
      </div>
    );
  }

  return (
    <div className="addons-section">
      <h3 className="section-title">
        <i className="fas fa-plus-circle"></i>
        Add-ons
      </h3>
      <p className="section-subtitle">Enhance your experience with these extras</p>

      <div className="addons-grid">
        {addons.map((addon) => (
          <label key={addon._id} className="addon-option">
            <input
              type="checkbox"
              checked={!!selectedAddons[addon.name]}
              onChange={() => handleAddonToggle(addon)}
            />
            <div className="addon-info">
              <span className="addon-name">{addon.name}</span>
              <span className="addon-price">+ ₱{addon.price.toLocaleString()}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default AddonsSelector;