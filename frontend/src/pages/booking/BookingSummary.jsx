// frontend/src/pages/booking/BookingSummary.jsx
// ============================================
// BOOKING SUMMARY - Displays selected package details
// ============================================

import React from 'react';

const BookingSummary = ({ 
  selectedOasis, 
  selectedPackage, 
  selectedSession, 
  packageData, 
  formData, 
  nights, 
  pricePerNight, 
  totalPrice,
  addonsTotal,
  downpayment,
  paymentType
}) => {
  
  // Get the day type based on selected date
  const getDayType = () => {
    if (!formData.reservationDate) return null;
    
    const date = new Date(formData.reservationDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return 'weekday';
    }
    // Friday = 5, Saturday = 6, Sunday = 0
    return 'weekend';
  };

  const dayType = getDayType();
  const isWeekday = dayType === 'weekday';
  
  // Get rate breakdown text
  const getRateBreakdown = () => {
    if (!selectedPackage || !selectedSession || !formData.reservationDate) return '';
    
    const dayTypeText = isWeekday ? 'Monday - Thursday' : 'Friday - Sunday';
    const sessionText = selectedSession === 'Day' ? 'Day Rate' : 
                       selectedSession === 'Night' ? 'Night Rate' : 
                       selectedSession === '22 Hours' ? '22 Hours Rate' : selectedSession;
    
    return `${dayTypeText} • ${sessionText}`;
  };

  // Get package display name with proper formatting
  const getPackageDisplayName = () => {
    if (!selectedPackage) return '—';
    
    const packageNames = {
      'Package 1': 'Package 1 - Cottage Only',
      'Package 2': 'Package 2 - 1 AC Superior Room',
      'Package 3': 'Package 3 - 1 AC Family Room',
      'Package 4': 'Package 4 - 2 AC Rooms',
      'Package 5': 'Package 5 - 4 AC Rooms',
      'Package 5+': 'Package 5+ - Large Group',
      'Package A': 'Package A - No Room',
      'Package B': 'Package B - 1 AC Family Room',
      'Package C': 'Package C - Events Package',
    };
    return packageNames[selectedPackage] || selectedPackage;
  };

  // Get max capacity for package
  const getMaxCapacity = () => {
    if (!selectedPackage) return 0;
    
    // Oasis 1 capacities
    if (selectedOasis === 'Oasis 1') {
      const capacities = {
        'Package 1': 20,
        'Package 2': 20,
        'Package 3': 20,
        'Package 4': 20,
        'Package 5': 20,
        'Package 5+': 100,
      };
      return capacities[selectedPackage] || 20;
    }
    
    // Oasis 2 capacities
    if (selectedOasis === 'Oasis 2') {
      const capacities = {
        'Package A': 30,
        'Package B': 30,
        'Package C': 100,
      };
      return capacities[selectedPackage] || 30;
    }
    
    return 0;
  };

  // Get min capacity
  const getMinCapacity = () => {
    if (!selectedPackage) return 0;
    
    if (selectedOasis === 'Oasis 1' && selectedPackage === 'Package 5+') {
      return 30;
    }
    if (selectedOasis === 'Oasis 2' && selectedPackage === 'Package C') {
      return 50;
    }
    return 0;
  };

  // Get capacity info text
  const getCapacityInfo = () => {
    if (!selectedPackage) return '';
    
    const minCap = getMinCapacity();
    const maxCap = getMaxCapacity();
    
    if (minCap > 0) {
      return `${minCap}-${maxCap} pax`;
    }
    return `Up to ${maxCap} pax`;
  };

  // Get room info
  const getRoomInfo = () => {
    if (!selectedPackage) return '';
    
    const rooms = {
      'Package 1': 'No room, cottage only',
      'Package 2': '1 AC Superior Room (2-4 pax)',
      'Package 3': '1 AC Family Room (8-12 pax)',
      'Package 4': '1 Family Room + 1 Superior Room (12-15 pax)',
      'Package 5': '2 Family Rooms + 2 Superior Rooms (22-25 pax)',
      'Package 5+': '2 Family Rooms + 2 Superior Rooms (22-25 pax sleeping)',
      'Package A': 'No room',
      'Package B': '1 AC Family Room w/ ref',
      'Package C': '1 AC Family Room w/ ref',
    };
    return rooms[selectedPackage] || '';
  };

  // Calculate extra persons fee
  const getExtraPersonsFee = () => {
    const maxCapacity = getMaxCapacity();
    const guestCount = formData.guestCount || 1;
    
    if (guestCount > maxCapacity && maxCapacity > 0) {
      const extraPersons = guestCount - maxCapacity;
      return extraPersons * 150;
    }
    return 0;
  };

  const extraPersonsFee = getExtraPersonsFee();
  const maxCapacity = getMaxCapacity();
  const minCapacity = getMinCapacity();
  const extraPersonsCount = formData.guestCount - maxCapacity;
  const totalWithExtra = totalPrice;
  const isBelowMin = minCapacity > 0 && formData.guestCount < minCapacity;

  return (
    <div className="booking-summary">
      <div className="summary-header">
        <i className="fas fa-leaf"></i>
        <h3>Booking Summary</h3>
      </div>
      <div className="summary-content">
        
        {/* Oasis & Package */}
        <div className="summary-item">
          <span className="label">Location</span>
          <span className="value">{selectedOasis || '—'}</span>
        </div>
        
        {selectedPackage && (
          <>
            <div className="summary-item">
              <span className="label">Package</span>
              <span className="value">{getPackageDisplayName()}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Capacity</span>
              <span className="value">{getCapacityInfo()}</span>
            </div>
            
            <div className="summary-item">
              <span className="label">Room</span>
              <span className="value">{getRoomInfo()}</span>
            </div>
          </>
        )}
        
        {selectedSession && (
          <div className="summary-item">
            <span className="label">Session</span>
            <span className="value">{selectedSession}</span>
          </div>
        )}
        
        {formData.reservationDate && (
          <>
            <div className="summary-divider"></div>
            
            <div className="summary-item">
              <span className="label">Reservation Date</span>
              <span className="value">
                {new Date(formData.reservationDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="label">Day Type</span>
              <span className="value">
                {isWeekday ? 'Monday - Thursday' : 'Friday - Sunday'}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="label">Guests</span>
              <span className="value">
                {formData.guestCount} {formData.guestCount === 1 ? 'person' : 'persons'}
                {extraPersonsCount > 0 && (
                  <span style={{ color: '#e67e22', marginLeft: '8px', fontSize: '0.7rem' }}>
                    ({extraPersonsCount} extra @ ₱150/head)
                  </span>
                )}
                {isBelowMin && (
                  <span style={{ color: '#e67e22', marginLeft: '8px', fontSize: '0.7rem' }}>
                    (Minimum {minCapacity} pax required)
                  </span>
                )}
              </span>
            </div>
            
            <div className="summary-divider"></div>
            
            {/* Rate Breakdown */}
            <div className="summary-item" style={{ background: '#f0f9ff', margin: '0 -20px', padding: '8px 20px', borderRadius: '8px' }}>
              <span className="label" style={{ fontWeight: '600', color: '#0369a1' }}>Rate Applied</span>
              <span className="value" style={{ fontWeight: '600', color: '#0284c7' }}>{getRateBreakdown()}</span>
            </div>
            
            {/* Package Rate */}
            <div className="summary-item">
              <span className="label">Package Rate</span>
              <span className="value">₱{pricePerNight.toLocaleString()}</span>
            </div>
            
            {/* Extra Persons Fee */}
            {extraPersonsFee > 0 && (
              <div className="summary-item">
                <span className="label">Extra Persons Fee</span>
                <span className="value" style={{ color: '#e67e22' }}>
                  + ₱{extraPersonsFee.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Add-ons */}
            {addonsTotal > 0 && (
              <div className="summary-item">
                <span className="label">Add-ons</span>
                <span className="value">₱{addonsTotal.toLocaleString()}</span>
              </div>
            )}
            
            {/* Total Amount */}
            <div className="summary-total">
              <span className="label">Total Amount</span>
              <span className="value">₱{totalWithExtra.toLocaleString()}</span>
            </div>
            
            {/* Downpayment */}
            {paymentType === 'downpayment' && (
              <>
                <div className="summary-downpayment">
                  <span className="label">Downpayment Required</span>
                  <span className="downpayment-amount">₱{downpayment.toLocaleString()}</span>
                </div>
                
                <div className="summary-item">
                  <span className="label">Remaining Balance</span>
                  <span className="value">₱{(totalWithExtra - downpayment).toLocaleString()}</span>
                </div>
              </>
            )}
            
            {/* Payment Type Note */}
            {paymentType === 'fullpayment' && (
              <div className="summary-item" style={{ background: '#d4edda', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <span className="label" style={{ color: '#155724' }}>Payment Type</span>
                <span className="value" style={{ color: '#155724', fontWeight: '600' }}>Full Payment</span>
              </div>
            )}
            
            {/* Info Notes */}
            {paymentType === 'downpayment' && (
              <div className="summary-note">
                <i className="fas fa-info-circle"></i>
                <span>Downpayment is required to secure your reservation. Balance payable upon arrival.</span>
              </div>
            )}
            
            {paymentType === 'fullpayment' && (
              <div className="summary-note" style={{ background: '#d4edda', color: '#155724' }}>
                <i className="fas fa-check-circle"></i>
                <span>Full payment is required. No additional payment needed upon arrival.</span>
              </div>
            )}
            
            {extraPersonsFee > 0 && (
              <div className="summary-note" style={{ background: '#fef3c7', color: '#92400e' }}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>Extra person charge: ₱150 per person beyond package capacity.</span>
              </div>
            )}
            
            {isBelowMin && (
              <div className="summary-note" style={{ background: '#fee2e2', color: '#991b1b' }}>
                <i className="fas fa-exclamation-circle"></i>
                <span>Minimum {minCapacity} guests required for this package.</span>
              </div>
            )}

            {/* Rate Info Note */}
            <div className="summary-note" style={{ background: '#e0f2fe', color: '#0369a1', marginTop: '12px' }}>
              <i className="fas fa-calendar-alt"></i>
              <span>
                Monday-Thursday rates are lower than Friday-Sunday rates.
              </span>
            </div>
          </>
        )}
        
        {!formData.reservationDate && (
          <div className="summary-empty">
            <i className="far fa-calendar-plus"></i>
            <p>Select your date and session to see pricing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;