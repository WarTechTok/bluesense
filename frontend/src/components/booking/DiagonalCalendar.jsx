// frontend/src/components/booking/DiagonalCalendar.jsx
import React, { useState, useEffect } from 'react';
import './DiagonalCalendar.css';

function DiagonalCalendar({ selectedDate, onDateChange, oasis, packageName }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!oasis || !packageName) {
        console.log('⚠️ Missing oasis or packageName for booked dates');
        return;
      }
      
      setLoading(true);
      try {
        const backendUrl = "http://localhost:8080";
        const url = `${backendUrl}/api/bookings/booked-dates?oasis=${encodeURIComponent(oasis)}&package=${encodeURIComponent(packageName)}`;
        
        console.log('📅 Fetching booked dates from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📅 Booked dates response:', data);
        
        if (data.success && data.bookedDates) {
          console.log('✅ Booked dates loaded:', data.bookedDates);
          setBookedDates(data.bookedDates);
        } else {
          console.warn('⚠️ Invalid response format:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching booked dates:', error);
        // Don't break the calendar - just log the error
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookedDates();
  }, [oasis, packageName]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    const today = new Date();
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    // Don't go back before today
    if (prev >= today) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= maxDate) {
      setCurrentMonth(next);
    }
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only allow clicking dates that are today or in the future
    if (clickedDate >= today) {
      // Check max advance (3 months)
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (clickedDate <= maxDate) {
        onDateChange(clickedDate);
      }
    }
  };

  const getDateStatus = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const status = bookedDates[dateStr] || null;
    
    // Log when a booked date is found
    if (status) {
      console.log(`📍 ${dateStr}: Day=${status.Day.booked ? '❌ Booked' : '✅ Available'}, Night=${status.Night.booked ? '❌ Booked' : '✅ Available'}`);
    }
    
    return status;
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (date > maxDate) return true;
    
    return false;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentMonth.getFullYear() &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDateStatus(day);
    const disabled = isDateDisabled(day);
    const selected = isDateSelected(day);
    
    days.push(
      <div
        key={day}
        className={`calendar-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
        onClick={() => !disabled && handleDateClick(day)}
      >
        <div className="day-number">{day}</div>
        
        {status && (
          <svg className="diagonal-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Diagonal line from top-left to bottom-right */}
            <line x1="0" y1="0" x2="100" y2="100" stroke="#333" strokeWidth="2" />
            
            {/* Day session (left) */}
            <circle 
              cx="25" 
              cy="50" 
              r="6" 
              className={`session-indicator ${status.Day.booked ? 'booked' : 'available'}`}
              fill={status.Day.booked ? '#ef4444' : '#10b981'}
            />
            
            {/* Night session (right) */}
            <circle 
              cx="75" 
              cy="50" 
              r="6" 
              className={`session-indicator ${status.Night.booked ? 'booked' : 'available'}`}
              fill={status.Night.booked ? '#ef4444' : '#10b981'}
            />
          </svg>
        )}
        
        {!status && !disabled && (
          <svg className="diagonal-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke="#e0e0e0" strokeWidth="1" />
            <circle cx="25" cy="50" r="6" fill="#10b981" />
            <circle cx="75" cy="50" r="6" fill="#10b981" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className="diagonal-calendar">
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={handlePrevMonth}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3 className="month-title">{monthName}</h3>
        <button className="month-nav-btn" onClick={handleNextMonth}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-info">
        <div className="info-item">
          <span className="label">Left (Day)</span>
          <span className="badge">8AM - 5PM</span>
        </div>
        <div className="info-item">
          <span className="label">Right (Night)</span>
          <span className="badge">6PM - 6AM</span>
        </div>
      </div>

      <div className="legend">
        <span><span className="legend-mark available"></span> Available</span>
        <span><span className="legend-mark booked"></span> Booked</span>
      </div>

      <div className="weekday-headers">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>

      <div className="calendar-grid">{days}</div>

      {loading && <div className="calendar-loading">Loading availability...</div>}
    </div>
  );
}

export default DiagonalCalendar;
