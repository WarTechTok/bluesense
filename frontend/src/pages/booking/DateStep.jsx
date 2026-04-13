// frontend/src/pages/booking/DateStep.jsx
// ============================================
// DATE STEP - Select date and session
// ============================================

import React from 'react';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
import SessionSelector from '../../components/booking/SessionSelector';

function DateStep({ formData, errors, handleChange, selectedOasis, selectedPackage, onSessionSelect, selectedSession }) {
  
  const handleDateChange = (date) => {
    // Fix timezone issue - use local date instead of UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    handleChange({ target: { name: 'reservationDate', value: formattedDate } });
  };

  const handleSessionChange = (session) => {
    // Update both formData and parent state
    handleChange({ target: { name: 'session', value: session } });
    if (onSessionSelect) {
      onSessionSelect(session);
    }
  };

  const getSessionName = (sessionId) => {
    const sessions = {
      'Day': 'Day Session (8AM - 5PM)',
      'Night': 'Night Session (6PM - 6AM)',
      '22hrs': '22-Hour Session (Flexible)'
    };
    return sessions[sessionId] || sessionId;
  };

  // Use selectedSession from props or formData.session
  const currentSession = selectedSession || formData.session;

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-calendar-week"></i>
        <div>
          <h2>Select Your Date & Session</h2>
          <p>Choose your preferred date and session type</p>
        </div>
      </div>
      
      {/* Full Width Calendar */}
      <div className="calendar-wrapper full-width-top">
        <h3 className="section-title">
          <i className="fas fa-calendar-alt"></i>
          Select Date
        </h3>
        <div className="calendar-container landscape">
          <AvailabilityCalendar
            selectedDate={formData.reservationDate ? new Date(formData.reservationDate) : null}
            onDateChange={handleDateChange}
            oasis={selectedOasis}
            packageName={selectedPackage}
          />
          {errors.reservationDate && (
            <span className="error-message">{errors.reservationDate}</span>
          )}
        </div>
        {formData.reservationDate && (
          <div className="selected-display">
            <i className="fas fa-check-circle"></i>
            <span>
              {new Date(formData.reservationDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Info and Session Below Calendar */}
      <div className="date-step-layout bottom-section">
        
        {/* Selected Package Info */}
        <div className="info-wrapper">
          <div className="selected-info">
            <div className="info-card">
              <span className="info-label">Selected Oasis:</span>
              <span className="info-value">{selectedOasis}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Selected Package:</span>
              <span className="info-value">{selectedPackage}</span>
            </div>
          </div>
        </div>

        {/* Session Column */}
        <div className="session-wrapper">
          <h3 className="section-title">
            <i className="fas fa-clock"></i>
            Select Session
          </h3>
          <SessionSelector
            selectedSession={currentSession}
            onSessionChange={handleSessionChange}
            oasis={selectedOasis}
            packageName={selectedPackage}
          />
          {currentSession && (
            <div className="selected-display">
              <i className="fas fa-check-circle"></i>
              <span>{getSessionName(currentSession)}</span>
            </div>
          )}
          {errors.session && (
            <span className="error-message">{errors.session}</span>
          )}
        </div>
      </div>

      {/* Special Requests */}
      <div className="special-requests-section">
        <h3 className="section-title">
          <i className="fas fa-pen-alt"></i>
          Special Requests
        </h3>
        <p className="section-subtitle">Anything we should know? (Optional)</p>
        <textarea 
          name="specialRequests" 
          placeholder="e.g., Birthday celebration, dietary restrictions, early check-in, etc."
          rows="3"
          value={formData.specialRequests}
          onChange={handleChange}
          className="special-requests-textarea"
        />
      </div>
    </div>
  );
}

export default DateStep;