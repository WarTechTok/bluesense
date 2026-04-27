        // frontend/src/components/booking/PackageSelector.jsx
        import React, { useState } from 'react';
        import { oasisPackages, getAvailableSessions } from '../../config/packageData';
        // Remove 'getPackagePrice' from imports - it's not used in this file

        function PackageSelector({ selectedOasis, selectedPackage, onSelectPackage, onSelectSession, selectedDate }) {
        const [expandedPackage, setExpandedPackage] = useState(null);
        
        const packages = selectedOasis ? oasisPackages[selectedOasis]?.packages : {};
        
        const getPriceDisplay = (pkg, pkgName) => {
            const sessions = getAvailableSessions(selectedOasis, pkgName);
            if (sessions.length === 0) return 'Contact for pricing';
            
            const firstSession = sessions[0];
            const price = pkg.pricing[firstSession]?.weekday;
            return `Starting at ₱${price?.toLocaleString()}`;
        };
        
        return (
            <div className="package-selector">
            <div className="packages-grid">
                {Object.entries(packages).map(([key, pkg]) => (
                <div 
                    key={key}
                    className={`package-card ${selectedPackage === key ? 'selected' : ''}`}
                    onClick={() => onSelectPackage(key)}
                >
                    <div className="package-header">
                    <h3>{pkg.name}</h3>
                    <span className="package-capacity">👥 Up to {pkg.maxPax} pax</span>
                    </div>
                    
                    <p className="package-desc">{pkg.description}</p>
                    
                    <div className="package-price">
                    {getPriceDisplay(pkg, key)}
                    </div>
                    
                    <button 
                    className="view-details-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPackage(expandedPackage === key ? null : key);
                    }}
                    >
                    {expandedPackage === key ? 'Hide Details' : 'View Inclusions →'}
                    </button>
                    
                    {expandedPackage === key && (
                    <div className="package-inclusions">
                        <h4>✨ Inclusions:</h4>
                        <ul>
                        {pkg.inclusions.map((item, idx) => (
                            <li key={idx}><i className="fas fa-check"></i> {item}</li>
                        ))}
                        </ul>
                        <h4>🎁 Add-ons Available:</h4>
                        <ul>
                        {pkg.addons.map((addon, idx) => (
                            <li key={idx}><i className="fas fa-plus-circle"></i> {addon.name} (₱{addon.price.toLocaleString()})</li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>
                ))}
            </div>
            
            {selectedPackage && (
                <div className="session-selector-section">
                <h3>Select Session Type</h3>
                <div className="session-buttons">
                    {getAvailableSessions(selectedOasis, selectedPackage).map(session => (
                    <button
                        key={session}
                        className={`session-btn ${session === 'Day' ? 'day' : session === 'Night' ? 'night' : 'full'}`}
                        onClick={() => onSelectSession(session)}
                    >
                        <i className={`fas ${
                        session === 'Day' ? 'fa-sun' : 
                        session === 'Night' ? 'fa-moon' : 'fa-clock'
                        }`}></i>
                        {session}
                        {session === '22hrs' && <span className="session-badge">Best Value</span>}
                    </button>
                    ))}
                </div>
                </div>
            )}
            </div>
        );
        }

        export default PackageSelector;