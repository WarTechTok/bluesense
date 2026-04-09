// src/components/booking/AddonsSelector.jsx
// ============================================
// ADD-ONS SELECTOR - Checkboxes for add-ons
// ============================================

import React, { useState } from 'react';

function AddonsSelector({ packageData, onAddonsChange }) {
  const [selectedAddons, setSelectedAddons] = useState({});

  // Parse addon string to extract name and price
  const parseAddon = (addonString) => {
    // Examples: "Karaoke (₱700)", "Stove 10hrs (₱200)", "Stove (₱300)"
    const match = addonString.match(/^(.+?)\s*\(₱(\d+)\)$/);
    if (match) {
      return {
        name: match[1].trim(),
        price: parseInt(match[2])
      };
    }
    return { name: addonString, price: null };
  };

  // Get available add-ons from package data
  const getAvailableAddons = () => {
    if (!packageData) return [];
    if (!packageData.addons) return [];
    return packageData.addons.map(addon => parseAddon(addon));
  };

  const handleAddonToggle = (addonName, addonPrice) => {
    const newSelected = { ...selectedAddons };
    if (newSelected[addonName]) {
      delete newSelected[addonName];
    } else {
      newSelected[addonName] = addonPrice;
    }
    setSelectedAddons(newSelected);
    onAddonsChange(newSelected);
  };

  const addons = getAvailableAddons();

  if (addons.length === 0) {
    return (
      <div className="addons-section">
        <h3 className="section-title">Add-ons</h3>
        <p className="section-subtitle">No add-ons available for this package</p>
      </div>
    );
  }

  return (
    <div className="addons-section">
      <h3 className="section-title">Add-ons</h3>
      <p className="section-subtitle">Enhance your experience with these extras</p>
      
      <div className="addons-grid">
        {addons.map((addon, index) => (
          <label key={index} className="addon-option">
            <input
              type="checkbox"
              checked={!!selectedAddons[addon.name]}
              onChange={() => handleAddonToggle(addon.name, addon.price)}
            />
            <div className="addon-info">
              <span className="addon-name">{addon.name}</span>
              {addon.price && <span className="addon-price">+ ₱{addon.price.toLocaleString()}</span>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default AddonsSelector;