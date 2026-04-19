// frontend/src/components/booking/AvailabilityCalendar.jsx

import React from 'react';
import DiagonalCalendar from './DiagonalCalendar';

function AvailabilityCalendar({ selectedDate, onDateChange, oasis, packageName, minDate }) {
  return (
    <div className="availability-calendar">
      <DiagonalCalendar
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        oasis={oasis}
        packageName={packageName}
        minDate={minDate}  // ← Pass minDate to DiagonalCalendar
      />
    </div>
  );
}

export default AvailabilityCalendar;