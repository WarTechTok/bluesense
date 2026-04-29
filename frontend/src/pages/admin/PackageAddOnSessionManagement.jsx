// frontend/src/pages/admin/PackageAddOnSessionManagement.jsx
// ============================================
// UNIFIED MANAGEMENT - Packages, Add-ons, and Sessions
// ============================================

import React, { useState } from 'react';
import PackageManagement from './PackageManagement';
import AddOnManagement from './AddOnManagement';
import SessionManagement from './SessionManagement';
import './PackageAddOnSessionManagement.css';

const PackageAddOnSessionManagement = () => {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className="unified-management-container">
      {/* Tab Navigation */}
      <div className="management-tabs">
        <button
          className={`tab-button ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          <i className="fas fa-box"></i>
          Packages
        </button>
        <button
          className={`tab-button ${activeTab === 'addons' ? 'active' : ''}`}
          onClick={() => setActiveTab('addons')}
        >
          <i className="fas fa-cube"></i>
          Add-ons
        </button>
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <i className="fas fa-clock"></i>
          Sessions
        </button>
      </div>

      {/* Tab Content */}
      <div className="management-content">
        {activeTab === 'packages' && <PackageManagement />}
        {activeTab === 'addons' && <AddOnManagement />}
        {activeTab === 'sessions' && <SessionManagement />}
      </div>
    </div>
  );
};

export default PackageAddOnSessionManagement;
