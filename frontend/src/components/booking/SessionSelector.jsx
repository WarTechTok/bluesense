// frontend/src/components/booking/SessionSelector.jsx
import React from 'react';
import { getAvailableSessions, getDownpayment } from '../../config/packageData';

function SessionSelector({ selectedSession, onSessionChange, packageData, oasis, packageName }) {
  const availableSessions = getAvailableSessions(oasis, packageName);
  
  const sessionDetails = {
    'Day': { 
      icon: '☀️', 
      time: '8:00 AM - 5:00 PM', 
      description: 'Enjoy the pool and facilities during daytime'
    },
    'Night': { 
      icon: '🌙', 
      time: '6:00 PM - 3:00 AM', 
      description: 'Night swimming with ambient lighting'
    },
    '22hrs': {
      icon: '🕒',
      time: '10:00 AM - 8:00 AM (next day)',
      description: 'Full 22-hour stay experience'
    }
  };

  return (
    <div className="session-selector">
      <div className="session-header">
        <i className="fas fa-clock"></i>
        <h3>Select Session Type</h3>
        <p>Choose your preferred time slot</p>
      </div>
      <div className="session-options">
        {availableSessions.map(session => (
          <div 
            key={session}
            className={`session-card ${selectedSession === session ? 'selected' : ''}`}
            onClick={() => onSessionChange(session)}
          >
            <div className="session-icon">{sessionDetails[session]?.icon || '🏊'}</div>
            <div className="session-info">
              <h4>{session}</h4>
              <p className="session-time">{sessionDetails[session]?.time || 'Flexible'}</p>
              <p className="session-desc">{sessionDetails[session]?.description || ''}</p>
              <p className="session-downpayment">Downpayment: ₱{getDownpayment(session).toLocaleString()}</p>
            </div>
            <div className="session-radio">
              {selectedSession === session && <i className="fas fa-check-circle"></i>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionSelector;