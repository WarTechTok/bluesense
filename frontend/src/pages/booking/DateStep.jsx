// frontend/src/pages/booking/DateStep.jsx
import React from 'react';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
import SessionSelector from '../../components/booking/SessionSelector';

function DateStep({ formData, errors, handleChange, selectedOasis, selectedPackage }) {
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    handleChange({ target: { name: 'reservationDate', value: formattedDate } });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-calendar-week"></i>
        </div>
        <div className="step-title">
          <h2>Select Your Date</h2>
          <p>Choose when you want to stay at Catherine's Oasis</p>
        </div>
      </div>
      
      <div className="date-step-layout">
        {/* Calendar Column */}
        <div className="calendar-wrapper">
          <div className="section-card">
            <h3 className="section-title">
              <i className="fas fa-calendar-alt"></i>
              Available Dates
            </h3>
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
        </div>
        
        {/* Session Column */}
        <div className="session-wrapper">
          <div className="section-card">
            <h3 className="section-title">
              <i className="fas fa-clock"></i>
              Select Session
            </h3>
            <SessionSelector
              selectedSession={formData.session}
              onSessionChange={(session) => handleChange({ target: { name: 'session', value: session } })}
              oasis={selectedOasis}
              packageName={selectedPackage}
            />
          </div>
        </div>
      </div>
      
      {/* Special Requests Section */}
      <div className="special-requests-card">
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
        ></textarea>
      </div>
    </div>
  );
}

export default DateStep;