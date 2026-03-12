// ============================================
// STAT CARD COMPONENT
// ============================================
// Reusable statistics card for dashboard display
// Shows: title, large value, icon, and optional trend indicator
// Props: title, value, icon, color (default #667eea), trend
// Used in: Dashboard overview and analytics pages

import React from 'react';
import './StatCard.css';

// ============================================
// STAT CARD - COMPONENT RENDER
// ============================================
// Props:
//   - title: Card heading (e.g., "Total Reservations")
//   - value: Main statistic number/text to display
//   - icon: Emoji or text icon for visual identification
//   - color: Border & icon background color (hex color code)
//   - trend: Optional object {type: 'up'|'down', text: string}
// Returns: Styled card with icon, title, and value
const StatCard = ({ title, value, icon, color = '#667eea', trend = null }) => {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>{icon}</div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && <span className={`stat-trend ${trend.type}`}>{trend.text}</span>}
      </div>
    </div>
  );
};

export default StatCard;
