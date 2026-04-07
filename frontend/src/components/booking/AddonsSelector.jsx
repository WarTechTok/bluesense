// frontend/src/components/booking/AddonsSelector.jsx
import React, { useState } from 'react';

function AddonsSelector({ packageData, onAddonsChange }) {
  const [selectedAddons, setSelectedAddons] = useState({});
  
  const addonPrices = {
    'Karaoke (₱700)': 700,
    'Stove 10hrs (₱200)': 200,
    'Stove 22hrs (₱400)': 400,
    'Stove (₱300)': 300
  };
  
  const handleAddonToggle = (addon) => {
    const newAddons = { ...selectedAddons };
    if (newAddons[addon]) {
      delete newAddons[addon];
    } else {
      newAddons[addon] = addonPrices[addon];
    }
    setSelectedAddons(newAddons);
    onAddonsChange(newAddons);
  };
  
  const totalAddonsPrice = Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);
  
  if (!packageData?.addons || packageData.addons.length === 0) {
    return null;
  }
  
  return (
    <div className="addons-selector">
      <div className="addons-header">
        <h3><i className="fas fa-plus-circle"></i> Add-ons (Optional)</h3>
        <p>Enhance your experience with these add-ons</p>
      </div>
      
      <div className="addons-grid">
        {packageData.addons.map((addon, idx) => (
          <div 
            key={idx}
            className={`addon-card ${selectedAddons[addon] ? 'selected' : ''}`}
            onClick={() => handleAddonToggle(addon)}
          >
            <div className="addon-checkbox">
              {selectedAddons[addon] ? (
                <i className="fas fa-check-square"></i>
              ) : (
                <i className="far fa-square"></i>
              )}
            </div>
            <div className="addon-info">
              <h4>{addon}</h4>
            </div>
            <div className="addon-price">
              ₱{addonPrices[addon]?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      {totalAddonsPrice > 0 && (
        <div className="addons-total">
          <span>Add-ons Total:</span>
          <strong>₱{totalAddonsPrice.toLocaleString()}</strong>
        </div>
      )}
    </div>
  );
}

export default AddonsSelector;