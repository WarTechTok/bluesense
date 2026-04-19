// frontend/src/components/booking/SessionSelector.jsx
// ============================================
// SESSION SELECTOR - Radio buttons with pricing
// ============================================

import React from 'react';

function SessionSelector({ selectedSession, onSessionChange, oasis, packageName, bookedSessions = {} }) {
  
  // Check if 22hrs should be disabled (if Day OR Night is booked)
  const is22hrsDisabled = () => {
    return bookedSessions.Day === true || bookedSessions.Night === true;
  };

  // Check if a specific session is disabled
  const isSessionDisabled = (sessionId) => {
    // If the session itself is directly booked
    if (bookedSessions[sessionId]) return true;
    
    // Special rule: 22hrs is disabled if Day OR Night is booked
    if (sessionId === '22hrs' && is22hrsDisabled()) return true;
    
    return false;
  };

  // Get tooltip/helper message for disabled sessions
  const getDisabledMessage = (sessionId) => {
    if (sessionId === '22hrs' && is22hrsDisabled()) {
      return '22-hour session requires both Day and Night availability';
    }
    if (bookedSessions[sessionId]) {
      return 'This session is already booked';
    }
    return '';
  };

  // Get pricing based on oasis and package
  const getSessionPrice = (session) => {
    // Oasis 1 Package 1
    if (oasis === 'Oasis 1' && packageName === 'Package 1') {
      if (session === 'Day') return '₱5,999 - ₱6,400';
      if (session === 'Night') return '₱6,400 - ₱6,800';
    }
    
    // Oasis 1 Package 2
    if (oasis === 'Oasis 1' && packageName === 'Package 2') {
      if (session === 'Day') return '₱9,000 - ₱9,500';
      if (session === 'Night') return '₱10,000 - ₱10,500';
      if (session === '22hrs') return '₱15,000 - ₱16,000';
    }
    
    // Oasis 1 Package 3
    if (oasis === 'Oasis 1' && packageName === 'Package 3') {
      if (session === 'Day') return '₱9,500 - ₱10,000';
      if (session === 'Night') return '₱10,500 - ₱11,000';
      if (session === '22hrs') return '₱16,000 - ₱17,000';
    }
    
    // Oasis 1 Package 4
    if (oasis === 'Oasis 1' && packageName === 'Package 4') {
      if (session === 'Day') return '₱10,000 - ₱10,500';
      if (session === 'Night') return '₱11,000 - ₱11,500';
      if (session === '22hrs') return '₱17,000 - ₱18,000';
    }
    
    // Oasis 1 Package 5
    if (oasis === 'Oasis 1' && packageName === 'Package 5') {
      if (session === 'Day') return '₱14,200 - ₱15,600';
      if (session === 'Night') return '₱14,600 - ₱16,000';
      if (session === '22hrs') return '₱19,400 - ₱21,200';
    }
    
    // Oasis 1 Package 5+
    if (oasis === 'Oasis 1' && packageName === 'Package 5+') {
      if (session === 'Day') return '₱17,000 - ₱20,000';
      if (session === 'Night') return '₱18,000 - ₱21,000';
      if (session === '22hrs') return '₱25,000 - ₱30,000';
    }
    
    // Oasis 2 Package A
    if (oasis === 'Oasis 2' && packageName === 'Package A') {
      if (session === 'Day') return '₱7,500 - ₱10,000';
      if (session === 'Night') return '₱8,500 - ₱11,000';
    }
    
    // Oasis 2 Package B
    if (oasis === 'Oasis 2' && packageName === 'Package B') {
      if (session === 'Day') return '₱9,000 - ₱12,000';
      if (session === 'Night') return '₱10,000 - ₱12,500';
      if (session === '22hrs') return '₱16,500 - ₱20,000';
    }
    
    // Oasis 2 Package C (50 PAX)
    if (oasis === 'Oasis 2' && packageName === 'Package C') {
      if (session === 'Day') return '₱19,000 - ₱20,000';
      if (session === 'Night') return '₱20,000 - ₱21,000';
      if (session === '22hrs') return '₱26,000 - ₱30,000';
    }
    
    return 'Price varies';
  };

  // Get available sessions based on package
  const getAvailableSessions = () => {
    // Oasis 1 Package 1 only has Day and Night
    if (oasis === 'Oasis 1' && packageName === 'Package 1') {
      return [
        { id: 'Day', name: 'Day Session', time: '8:00 AM - 5:00 PM' },
        { id: 'Night', name: 'Night Session', time: '6:00 PM - 6:00 AM' },
      ];
    }
    
    // Oasis 2 Package A only has Day and Night
    if (oasis === 'Oasis 2' && packageName === 'Package A') {
      return [
        { id: 'Day', name: 'Day Session', time: '8:00 AM - 5:00 PM' },
        { id: 'Night', name: 'Night Session', time: '6:00 PM - 6:00 AM' },
      ];
    }
    
    // Most packages have all three sessions
    return [
      { id: 'Day', name: 'Day Session', time: '8:00 AM - 5:00 PM' },
      { id: 'Night', name: 'Night Session', time: '6:00 PM - 6:00 AM' },
      { id: '22hrs', name: '22-Hour Session', time: 'Flexible schedule' },
    ];
  };

  const sessions = getAvailableSessions();

  return (
    <div className="session-selector">
      <div className="session-options">
        {sessions.map((session) => {
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
              </div>
              <div className="session-price">{getSessionPrice(session.id)}</div>
            </label>
          );
        })}
      </div>
      
      {/* Info note for 22hrs when Day or Night is booked */}
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