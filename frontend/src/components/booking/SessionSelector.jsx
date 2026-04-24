// frontend/src/components/booking/SessionSelector.jsx
// ============================================
// SESSION SELECTOR - Dynamic with pricing from packageData
// ============================================

import React, { useState, useEffect } from 'react';
import { getSessions, refreshAllData } from '../../constants/packages';

function SessionSelector({ selectedSession, onSessionChange, oasis, packageName, bookedSessions = {}, packageData }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayType, setDayType] = useState('weekday'); // This should come from selected date
  
  const is22hrsDisabled = () => {
    return bookedSessions.Day === true || bookedSessions.Night === true;
  };

  const isSessionDisabled = (sessionId) => {
    if (bookedSessions[sessionId]) return true;
    if (sessionId === '22hrs' && is22hrsDisabled()) return true;
    return false;
  };

  const getDisabledMessage = (sessionId) => {
    if (sessionId === '22hrs' && is22hrsDisabled()) {
      return '22-hour session requires both Day and Night availability';
    }
    if (bookedSessions[sessionId]) {
      return 'This session is already booked';
    }
    return '';
  };

  // Get price for a session from packageData
  const getSessionPrice = (sessionId) => {
    if (!packageData || !packageData.pricing) return null;
    
    // Handle Package C special pricing (pax-based)
    if (packageData.name === 'Package C') {
      // This should be dynamic based on selected pax
      return { type: 'pax', price: 'Varies by guest count' };
    }
    
    // Regular packages
    const pricing = packageData.pricing;
    const price = pricing[dayType]?.[sessionId];
    
    if (price) {
      return { type: 'fixed', weekday: pricing.weekday?.[sessionId], weekend: pricing.weekend?.[sessionId] };
    }
    
    return null;
  };

  const renderPrice = (sessionId) => {
    const priceInfo = getSessionPrice(sessionId);
    if (!priceInfo) return <div className="session-price">Price varies</div>;
    
    if (priceInfo.type === 'pax') {
      return <div className="session-price">Based on guest count</div>;
    }
    
    if (priceInfo.weekday && priceInfo.weekend) {
      return (
        <div className="session-price">
          <div className="price-row weekday">Mon-Thu: ₱{priceInfo.weekday.toLocaleString()}</div>
          <div className="price-row weekend">Fri-Sun: ₱{priceInfo.weekend.toLocaleString()}</div>
        </div>
      );
    }
    
    return <div className="session-price">Price varies</div>;
  };

  // Load sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      await refreshAllData();
      const sessionList = getSessions();
      const formattedSessions = sessionList.map(session => ({
        id: session.name,
        name: session.displayName,
        time: `${session.startTime} - ${session.endTime}`,
        downpaymentAmount: session.downpaymentAmount
      }));
      setSessions(formattedSessions);
      setLoading(false);
    };
    loadSessions();
  }, []);

  // Determine day type from selected date (pass from parent)
  useEffect(() => {
    // This should come from the selected date in parent
    // For now, we'll use a placeholder
    const date = new Date();
    const isWeekend = date.getDay() === 5 || date.getDay() === 6 || date.getDay() === 0;
    setDayType(isWeekend ? 'weekend' : 'weekday');
  }, []);

  const availableSessions = packageData?.availableSessions 
    ? sessions.filter(s => packageData.availableSessions.includes(s.id))
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
          const isDisabled = isSessionDisabled(session.id);
          const disabledMessage = getDisabledMessage(session.id);
          const isSelected = selectedSession === session.id;
          const isBooked = bookedSessions[session.id];
          
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
                  {isBooked && session.id !== '22hrs' && <span className="booked-badge">Already Booked</span>}
                  {session.id === '22hrs' && is22hrsDisabled() && !isBooked && (
                    <span className="booked-badge">Requires Day & Night</span>
                  )}
                  {session.id === '22hrs' && isBooked && <span className="booked-badge">Already Booked</span>}
                </div>
                <div className="session-time">{session.time}</div>
                <div className="session-downpayment">Downpayment: ₱{session.downpaymentAmount?.toLocaleString()}</div>
              </div>
              <div className="session-price-container">
                {renderPrice(session.id)}
              </div>
            </label>
          );
        })}
      </div>
      
      {sessions.some(s => s.id === '22hrs') && (bookedSessions.Day || bookedSessions.Night) && (
        <div className="session-info-note" style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          background: '#fef3c7', 
          borderRadius: '8px', 
          fontSize: '12px', 
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-info-circle"></i> 
          <span>22-hour session is unavailable when Day or Night session is already booked.</span>
        </div>
      )}
    </div>
  );
}

export default SessionSelector;