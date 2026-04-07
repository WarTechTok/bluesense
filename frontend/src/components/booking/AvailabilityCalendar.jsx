// frontend/src/components/booking/AvailabilityCalendar.jsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function AvailabilityCalendar({ selectedDate, onDateChange, oasis, packageName }) {
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!oasis || !packageName) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/bookings/booked-dates?oasis=${encodeURIComponent(oasis)}&package=${encodeURIComponent(packageName)}`);
        const data = await response.json();
        setBookedDates(data.bookedDates || []);
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookedDates();
  }, [oasis, packageName]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (bookedDates.includes(dateStr)) {
        return 'booked-date';
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      return bookedDates.includes(dateStr);
    }
    return false;
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <i className="fas fa-calendar-alt"></i>
        <h3>Select Your Date</h3>
        <div className="calendar-legend">
          <span><span className="legend-available"></span> Available</span>
          <span><span className="legend-booked"></span> Booked</span>
        </div>
      </div>
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        minDate={new Date()}
        className="booking-calendar"
      />
      {loading && <div className="calendar-loading">Loading availability...</div>}
    </div>
  );
}

export default AvailabilityCalendar;