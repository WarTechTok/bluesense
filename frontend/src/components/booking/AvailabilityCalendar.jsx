// frontend/src/components/booking/AvailabilityCalendar.jsx
import React from 'react';
import DiagonalCalendar from './DiagonalCalendar';

function AvailabilityCalendar({ selectedDate, onDateChange, oasis, packageName }) {
  return (
    <div className="availability-calendar">
      <DiagonalCalendar
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        oasis={oasis}
        packageName={packageName}
      />
    </div>
  );
}

export default AvailabilityCalendar;