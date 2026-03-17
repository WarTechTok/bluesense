// ============================================
// STAT CARD COMPONENT - Professional Version
// ============================================
// Reusable statistics card for dashboard display
// Shows: title, large value, and optional trend indicator
// Props: title, value, trend
// Used in: Dashboard overview and analytics pages

import React from 'react';
import './StatCard.css';

// ============================================
// STAT CARD - COMPONENT RENDER
// ============================================
// Props:
//   - title: Card heading (e.g., "Total Reservations")
//   - value: Main statistic number/text to display
//   - trend: Optional object {type: 'up'|'down', text: string}
// Returns: Clean, minimal card with title and value
const StatCard = ({ title, value, trend = null }) => {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {trend && (
          <span className={`stat-trend ${trend.type}`}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;