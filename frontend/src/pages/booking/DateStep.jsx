import React from 'react';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
import SessionSelector from '../../components/booking/SessionSelector';

function DateStep({ formData, errors, handleChange, selectedOasis, selectedPackage }) {
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    handleChange({ target: { name: 'reservationDate', value: formattedDate } });
  };

  const getSessionName = (sessionId) => {
    const sessions = {
      '2d1n': '2D/1N',
      '3d2n': '3D/2N',
      '22hrs': '22 Hours'
    };
    return sessions[sessionId] || sessionId;
  };

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-calendar-week"></i>
        <h2>Select Your Date & Session</h2>
        <p>Choose your preferred date and session type for your stay</p>
      </div>
      
      {/* Package Info Card */}
      <div className="info-card">
        <div className="info-card-header">
          <i className="fas fa-info-circle"></i>
          <h4>Your Selection</h4>
        </div>
        <div className="info-card-content">
          <div className="info-badge">
            <span className="badge-label">Venue:</span>
            <span className="badge-value">{selectedOasis}</span>
          </div>
          <div className="info-badge">
            <span className="badge-label">Package:</span>
            <span className="badge-value">{selectedPackage}</span>
          </div>
        </div>
      </div>

      <div className="date-session-layout">
        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="section-label">
            <i className="fas fa-calendar-alt"></i>
            <span>Select Date</span>
          </div>
          <div className="calendar-container">
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
            <div className="selected-date-display">
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

        {/* Session Section */}
        <div className="session-section">
          <div className="section-label">
            <i className="fas fa-clock"></i>
            <span>Select Session</span>
          </div>
          <SessionSelector
            selectedSession={formData.session}
            onSessionChange={(session) => handleChange({ target: { name: 'session', value: session } })}
            oasis={selectedOasis}
            packageName={selectedPackage}
          />
          {formData.session && (
            <div className="selected-session-display">
              <i className="fas fa-check-circle"></i>
              <span>{getSessionName(formData.session)} Session</span>
            </div>
          )}
        </div>
      </div>

      {/* Special Requests */}
      <div className="special-requests-section">
        <div className="section-label">
          <i className="fas fa-pen-alt"></i>
          <span>Special Requests</span>
        </div>
        <div className="form-group full-width">
          <label>Tell us anything special (Optional)</label>
          <div className="input-wrapper">
            <textarea 
              name="specialRequests" 
              placeholder="e.g., Birthday celebration, dietary restrictions, early check-in, room preferences..."
              rows="4"
              value={formData.specialRequests}
              onChange={handleChange}
              className="special-requests-textarea"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DateStep;