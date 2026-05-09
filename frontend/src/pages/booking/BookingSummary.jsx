// frontend/src/pages/booking/BookingSummary.jsx
// ============================================
// BOOKING SUMMARY — reads capacity/room info from
// packageData prop (API-fetched), not hardcoded tables.
// ============================================

import React from 'react';

const BookingSummary = ({
  selectedOasis,
  selectedPackage,
  selectedSession,
  packageData,       // ← API-fetched, transformed package object
  formData,
  nights,
  pricePerNight,
  totalPrice,
  addonsTotal,
  downpayment,
  paymentType,
  extraGuestWarning,
}) => {

  // ============================================
  // DAY TYPE from selected date
  // ============================================
  const getDayType = () => {
    if (!formData.reservationDate) return null;
    const day = new Date(formData.reservationDate).getDay();
    return (day >= 1 && day <= 4) ? 'weekday' : 'weekend';
  };

  const dayType   = getDayType();
  const isWeekday = dayType === 'weekday';

  const getRateBreakdown = () => {
    if (!selectedPackage || !selectedSession || !formData.reservationDate) return '';
    const dayText     = isWeekday ? 'Monday - Thursday' : 'Friday - Sunday';
    const sessionText = selectedSession === '22hrs' ? '22 Hours Rate'
                      : selectedSession === 'Day'   ? 'Day Rate'
                      : 'Night Rate';
    return `${dayText} • ${sessionText}`;
  };

  // ============================================
  // CAPACITY — from API packageData prop
  // ============================================
  const maxCapacity = packageData?.maxCapacity || 0;
  const minCapacity = packageData?.minCapacity || 0;

  const getCapacityInfo = () => {
    if (!selectedPackage) return '';
    if (minCapacity > 0) return `${minCapacity}–${maxCapacity} pax`;
    return `Up to ${maxCapacity} pax`;
  };

  // ============================================
  // PACKAGE DISPLAY NAME — from API description
  // Falls back to just the package name if no description
  // ============================================
  const getPackageDisplayName = () => {
    if (!selectedPackage) return '—';
    // If the API provided a description, append it
    const desc = packageData?.subtitle || packageData?.description;
    if (desc && desc !== selectedPackage) {
      return `${selectedPackage} - ${desc}`;
    }
    return selectedPackage;
  };

  // ============================================
  // ROOM INFO — from API inclusions
  // Build a short room summary from the inclusions array
  // ============================================
  const getRoomInfo = () => {
    if (!packageData) return '';
    const inclusions = packageData.inclusions || [];
    // Look for an inclusion that mentions "room", "cottage", or "no room"
    const roomLine = inclusions.find((inc) =>
      /room|cottage|kubo/i.test(inc)
    );
    return roomLine || packageData.description || '';
  };

  // ============================================
  // EXTRA PERSONS FEE — from API maxCapacity
  // ₱150 per person over maxCapacity
  // ============================================
  const getExtraPersonsFee = () => {
    if (!maxCapacity || maxCapacity <= 0) return 0;
    const guestCount = formData.guestCount || 1;
    if (guestCount <= maxCapacity) return 0;
    return (guestCount - maxCapacity) * 150;
  };

  const extraPersonsFee  = getExtraPersonsFee();
  const extraPersonsCount = Math.max(0, (formData.guestCount || 0) - maxCapacity);
  const isBelowMin        = minCapacity > 0 && (formData.guestCount || 0) < minCapacity;

  return (
    <div className="booking-summary">
      <div className="summary-header">
        <i className="fas fa-leaf"></i>
        <h3>Booking Summary</h3>
      </div>

      <div className="summary-content">

        {/* Location */}
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

            {getRoomInfo() && (
              <div className="summary-item">
                <span className="label">Room</span>
                <span className="value">{getRoomInfo()}</span>
              </div>
            )}
          </>
        )}

        {selectedSession && (
          <div className="summary-item">
            <span className="label">Session</span>
            <span className="value">{selectedSession}</span>
          </div>
        )}

        {formData.reservationDate ? (
          <>
            <div className="summary-divider"></div>

            <div className="summary-item">
              <span className="label">Reservation Date</span>
              <span className="value">
                {new Date(formData.reservationDate).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>

            <div className="summary-item">
              <span className="label">Day Type</span>
              <span className="value">{isWeekday ? 'Monday - Thursday' : 'Friday - Sunday'}</span>
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

            {/* Rate applied */}
            <div className="summary-item" style={{ background: '#f0f9ff', margin: '0 -20px', padding: '8px 20px', borderRadius: '8px' }}>
              <span className="label" style={{ fontWeight: '600', color: '#0369a1' }}>Rate Applied</span>
              <span className="value" style={{ fontWeight: '600', color: '#0284c7' }}>{getRateBreakdown()}</span>
            </div>

            {/* Package rate */}
            <div className="summary-item">
              <span className="label">Package Rate</span>
              <span className="value">₱{pricePerNight.toLocaleString()}</span>
            </div>

            {/* Extra persons fee */}
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

            {/* Total */}
            <div className="summary-total">
              <span className="label">Total Amount</span>
              <span className="value">₱{totalPrice.toLocaleString()}</span>
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
                  <span className="value">₱{(totalPrice - downpayment).toLocaleString()}</span>
                </div>
              </>
            )}

            {paymentType === 'fullpayment' && (
              <div className="summary-item" style={{ background: '#d4edda', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <span className="label" style={{ color: '#155724' }}>Payment Type</span>
                <span className="value" style={{ color: '#155724', fontWeight: '600' }}>Full Payment</span>
              </div>
            )}

            {/* Notes */}
            {paymentType === 'downpayment' && (
              <div className="summary-note">
                <i className="fas fa-info-circle"></i>
                <span>Downpayment secures your reservation. Balance payable upon arrival.</span>
              </div>
            )}
            {paymentType === 'fullpayment' && (
              <div className="summary-note" style={{ background: '#d4edda', color: '#155724' }}>
                <i className="fas fa-check-circle"></i>
                <span>Full payment. No additional payment needed upon arrival.</span>
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
            <div className="summary-note" style={{ background: '#e0f2fe', color: '#0369a1', marginTop: '12px' }}>
              <i className="fas fa-calendar-alt"></i>
              <span>Monday–Thursday rates are lower than Friday–Sunday rates.</span>
            </div>
          </>
        ) : (
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