// frontend/src/components/booking/SessionSelector.jsx
// ============================================
// SESSION SELECTOR — prices from API packageData prop
//
// API pricing shape (from transformPackageData):
//   Regular:   packageData.pricing[sessionId].weekday  / .weekend
//   Package C: packageData.pricing["50pax"][sessionId].weekday / .weekend
// ============================================

import React, { useState, useEffect } from 'react';
import { getSessions, refreshAllData } from '../../constants/packages';

function SessionSelector({
  selectedSession,
  onSessionChange,
  oasis,
  packageName,
  bookedSessions = {},
  packageData,
  selectedDate,    // ISO date string — pass this from DateStep so pricing shows correct day type
}) {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // ============================================
  // DAY TYPE — derived from the date the user picked
  // ============================================
  const getDayType = () => {
    if (!selectedDate) return 'weekday';
    const day = new Date(selectedDate).getDay();
    return (day === 0 || day === 5 || day === 6) ? 'weekend' : 'weekday';
  };

  const dayType = getDayType();

  // ============================================
  // AVAILABILITY CHECKS
  // ============================================
  const is22hrsDisabled  = () => bookedSessions.Day === true || bookedSessions.Night === true;
  const isSessionDisabled = (id) => {
    if (bookedSessions[id]) return true;
    if (id === '22hrs' && is22hrsDisabled()) return true;
    return false;
  };
  const getDisabledMessage = (id) => {
    if (id === '22hrs' && is22hrsDisabled()) return '22-hour session requires both Day and Night availability';
    if (bookedSessions[id]) return 'This session is already booked';
    return '';
  };

  // ============================================
  // PRICE LOOKUP — uses correct API shape
  // ============================================
  const getSessionPrice = (sessionId) => {
    if (!packageData?.pricing) return null;

    const pricing = packageData.pricing;

    // Package C: pax-based tiers — just flag it, price shown elsewhere
    if (packageData.name === 'Package C') {
      return { type: 'pax' };
    }

    // Regular packages: pricing[sessionId] = { weekday, weekend }
    const sessionPricing = pricing[sessionId];
    if (!sessionPricing) return null;

    return {
      type:    'fixed',
      weekday: sessionPricing.weekday || 0,
      weekend: sessionPricing.weekend || 0,
    };
  };

  const renderPrice = (sessionId) => {
    const info = getSessionPrice(sessionId);

    if (!info) {
      return <div className="session-price">Price varies</div>;
    }

    if (info.type === 'pax') {
      return <div className="session-price">Based on guest count</div>;
    }

    const { weekday, weekend } = info;

    if (weekday || weekend) {
      // Highlight the rate that applies to the selected date
      return (
        <div className="session-price">
          <div className={`price-row weekday${dayType === 'weekday' ? ' active-rate' : ''}`}>
            Mon–Thu: ₱{(weekday || 0).toLocaleString()}
          </div>
          <div className={`price-row weekend${dayType === 'weekend' ? ' active-rate' : ''}`}>
            Fri–Sun: ₱{(weekend || 0).toLocaleString()}
          </div>
        </div>
      );
    }

    return <div className="session-price">Price varies</div>;
  };

  // ============================================
  // LOAD SESSIONS FROM API
  // ============================================
  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      await refreshAllData();
      const list = getSessions();
      setSessions(
        list.map((s) => ({
          id:                s.name,
          name:              s.displayName,
          time:              `${s.startTime} - ${s.endTime}`,
          downpaymentAmount: s.downpaymentAmount,
        }))
      );
      setLoading(false);
    };
    loadSessions();
  }, []);

  // ============================================
  // FILTER sessions to those allowed by this package
  // packageData.sessions comes from transformPackageData (reflects DB)
  // ============================================
  const packageSessions = packageData?.sessions?.length > 0
    ? packageData.sessions
    : packageData?.availableSessions || null;

  const availableSessions = packageSessions
    ? sessions.filter((s) => packageSessions.includes(s.id))
    : sessions;

  if (loading) {
    return (
      <div className="session-selector">
        <div className="session-options">
          <div className="loading-state">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-selector">
      <div className="session-options">
        {availableSessions.map((session) => {
          const isDisabled       = isSessionDisabled(session.id);
          const disabledMessage  = getDisabledMessage(session.id);
          const isSelected       = selectedSession === session.id;
          const isBooked         = bookedSessions[session.id];

          return (
            <label
              key={session.id}
              className={`session-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              title={disabledMessage}
            >
              <input
                type="radio"
                name="session"
                value={session.id}
                checked={isSelected}
                onChange={() => !isDisabled && onSessionChange(session.id)}
                disabled={isDisabled}
              />
              <div className="session-info">
                <div className="session-name">
                  {session.name}
                  {isBooked && session.id !== '22hrs' && (
                    <span className="booked-badge">Already Booked</span>
                  )}
                  {session.id === '22hrs' && is22hrsDisabled() && !isBooked && (
                    <span className="booked-badge">Requires Day &amp; Night</span>
                  )}
                  {session.id === '22hrs' && isBooked && (
                    <span className="booked-badge">Already Booked</span>
                  )}
                </div>
                <div className="session-time">{session.time}</div>
                <div className="session-downpayment">
                  Downpayment: ₱{session.downpaymentAmount?.toLocaleString()}
                </div>
              </div>
              <div className="session-price-container">
                {renderPrice(session.id)}
              </div>
            </label>
          );
        })}
      </div>

      {sessions.some((s) => s.id === '22hrs') && (bookedSessions.Day || bookedSessions.Night) && (
        <div className="session-info-note" style={{
          marginTop: '12px', padding: '8px 12px', background: '#fef3c7',
          borderRadius: '8px', fontSize: '12px', color: '#92400e',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <i className="fas fa-info-circle"></i>
          <span>22-hour session is unavailable when Day or Night session is already booked.</span>
        </div>
      )}
    </div>
  );
}

export default SessionSelector;