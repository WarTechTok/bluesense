// frontend/src/components/booking/SessionSelector.jsx
// ============================================
// SESSION SELECTOR - Radio buttons with pricing
// ============================================

import React from 'react';

function SessionSelector({ selectedSession, onSessionChange, oasis, packageName, bookedSessions = {} }) {
  
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
          const isBooked = bookedSessions[session.id];
          const isDisabled = isBooked;
          
          return (
            <label 
              key={session.id} 
              className={`session-option ${selectedSession === session.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            >
              <input
                type="radio"
                name="session"
                value={session.id}
                checked={selectedSession === session.id}
                onChange={() => !isDisabled && onSessionChange(session.id)}
                disabled={isDisabled}
              />
              <div className="session-info">
                <div className="session-name">
                  {session.name}
                  {isBooked && <span className="booked-badge">Already Booked</span>}
                </div>
                <div className="session-time">{session.time}</div>
              </div>
              <div className="session-price">{getSessionPrice(session.id)}</div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default SessionSelector;