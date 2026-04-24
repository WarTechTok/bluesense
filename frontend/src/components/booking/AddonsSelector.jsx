// frontend/src/components/booking/AddonsSelector.jsx
// ============================================
// ADD-ONS SELECTOR - Dynamic from API
// ============================================

import React, { useState, useEffect } from 'react';
import { getAddons, refreshAllData } from '../../constants/packages';

function AddonsSelector({ packageData, onAddonsChange }) {
  const [selectedAddons, setSelectedAddons] = useState({});
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAddons = async () => {
      setLoading(true);
      await refreshAllData();
      const addonsList = getAddons();
      setAddons(addonsList);
      setLoading(false);
    };
    loadAddons();
  }, []);

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
        <p className="section-subtitle">No add-ons available at this time</p>
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