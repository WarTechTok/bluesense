import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './Booking.css';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const packageData = location.state?.package || {};
  const oasis = location.state?.oasis || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    guestCount: 1,
    reservationDate: '',
    checkoutDate: '',
    specialRequests: '',
    paymentMethod: 'cash',
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getPrice = () => {
    if (!formData.reservationDate) return packageData.price || 0;
    
    const checkInDate = new Date(formData.reservationDate);
    const dayOfWeek = checkInDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    
    // If package has pricing structure (weekday/weekend)
    if (packageData.pricing) {
      if (isWeekend && packageData.pricing.weekend) {
        // Get first session price from weekend
        const weekendPrices = Object.values(packageData.pricing.weekend);
        return weekendPrices[0] || packageData.price || 0;
      } else if (packageData.pricing.weekday) {
        // Get first session price from weekday
        const weekdayPrices = Object.values(packageData.pricing.weekday);
        return weekdayPrices[0] || packageData.price || 0;
      }
    }
    
    return packageData.price || 0;
  };

  const getPriceType = () => {
    if (!formData.reservationDate) return '';
    
    const checkInDate = new Date(formData.reservationDate);
    const dayOfWeek = checkInDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    return isWeekend ? 'Weekend' : 'Weekday';
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    console.log('Booking submitted:', formData);
    alert('Booking submitted successfully! We will contact you soon.');
    navigate('/');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-page">
      <Navbar />

      {/* Header Section */}
      <section className="booking-header">
        <div className="booking-header-content">
          <h1>Complete Your Reservation</h1>
          <p>Book your perfect getaway at Catherine's Oasis</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="booking-content">
        <div className="container">
          <div className="booking-wrapper">
            {/* Package Summary */}
            <div className="booking-summary">
              <h3>Package Summary</h3>
              <div className="summary-item">
                <label>Package:</label>
                <span>{packageData.name || 'Selected Package'}</span>
              </div>
              <div className="summary-item">
                <label>Location:</label>
                <span>{oasis}</span>
              </div>
              
              {formData.reservationDate && (
                <>
                  <div className="summary-item">
                    <label>Check-in:</label>
                    <span>{formData.reservationDate}</span>
                  </div>
                  <div className="summary-item">
                    <label>Type:</label>
                    <span className="price-type">{getPriceType()}</span>
                  </div>
                  <div className="summary-item">
                    <label>Guests:</label>
                    <span>{formData.guestCount}</span>
                  </div>
                  {formData.checkoutDate && (
                    <div className="summary-item">
                      <label>Duration:</label>
                      <span>{calculateNights(formData.reservationDate, formData.checkoutDate)} night(s)</span>
                    </div>
                  )}
                  <div className="summary-item summary-price">
                    <label>Price:</label>
                    <span className="price">₱{getPrice().toLocaleString()}</span>
                  </div>
                  {formData.checkoutDate && (
                    <div className="summary-item summary-total">
                      <label>Total:</label>
                      <span className="total">₱{(getPrice() * calculateNights(formData.reservationDate, formData.checkoutDate)).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Guest Info</div>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Dates</div>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Payment</div>
              </div>
              <div className={`step ${step >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Review</div>
              </div>
            </div>

            {/* Form */}
            <form className="booking-form" onSubmit={handleSubmit}>
              {/* Step 1: Guest Information */}
              {step === 1 && (
                <div className="step-content">
                  <h2>Guest Information</h2>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+63 9XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Number of Guests *</label>
                    <select
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Dates */}
              {step === 2 && (
                <div className="step-content">
                  <h2>Select Your Dates</h2>
                  
                  <div className="form-group">
                    <label>Check-in Date *</label>
                    <input
                      type="date"
                      name="reservationDate"
                      value={formData.reservationDate}
                      onChange={handleChange}
                      min={today}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Check-out Date *</label>
                    <input
                      type="date"
                      name="checkoutDate"
                      value={formData.checkoutDate}
                      onChange={handleChange}
                      min={formData.reservationDate || today}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Special Requests</label>
                    <textarea
                      name="specialRequests"
                      placeholder="Any special requirements or preferences?"
                      rows="4"
                      value={formData.specialRequests}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {formData.reservationDate && formData.checkoutDate && (
                    <div className="date-info">
                      <p>Duration: <strong>{calculateNights(formData.reservationDate, formData.checkoutDate)} nights</strong></p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div className="step-content">
                  <h2>Payment Method</h2>
                  
                  <div className="payment-options">
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                      />
                      <label htmlFor="cash">
                        <div className="payment-icon">💵</div>
                        <div className="payment-info">
                          <h4>Cash Payment</h4>
                          <p>Pay upon arrival</p>
                        </div>
                      </label>
                    </div>

                    <div className="payment-option">
                      <input
                        type="radio"
                        id="gcash"
                        name="paymentMethod"
                        value="gcash"
                        checked={formData.paymentMethod === 'gcash'}
                        onChange={handleChange}
                      />
                      <label htmlFor="gcash">
                        <div className="payment-icon">📱</div>
                        <div className="payment-info">
                          <h4>GCash</h4>
                          <p>Mobile money payment</p>
                        </div>
                      </label>
                    </div>

                    <div className="payment-option">
                      <input
                        type="radio"
                        id="gotyme"
                        name="paymentMethod"
                        value="gotyme"
                        checked={formData.paymentMethod === 'gotyme'}
                        onChange={handleChange}
                      />
                      <label htmlFor="gotyme">
                        <div className="payment-icon">💳</div>
                        <div className="payment-info">
                          <h4>GoTyme Bank</h4>
                          <p>Digital banking payment</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="payment-total">
                    <h3>Total Amount Due</h3>
                    {formData.reservationDate && formData.checkoutDate ? (
                      <>
                        <p className="price-breakdown">
                          ₱{getPrice().toLocaleString()} x {calculateNights(formData.reservationDate, formData.checkoutDate)} night(s)
                        </p>
                        <p className="total-price">₱{(getPrice() * calculateNights(formData.reservationDate, formData.checkoutDate)).toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="total-price">Select dates to calculate</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Terms */}
              {step === 4 && (
                <div className="step-content">
                  <h2>Review Your Booking</h2>
                  
                  <div className="review-section">
                    <h3>Booking Details</h3>
                    <div className="review-item">
                      <span>Name:</span>
                      <strong>{formData.fullName}</strong>
                    </div>
                    <div className="review-item">
                      <span>Email:</span>
                      <strong>{formData.email}</strong>
                    </div>
                    <div className="review-item">
                      <span>Phone:</span>
                      <strong>{formData.phone}</strong>
                    </div>
                    <div className="review-item">
                      <span>Guests:</span>
                      <strong>{formData.guestCount}</strong>
                    </div>
                    <div className="review-item">
                      <span>Check-in:</span>
                      <strong>{formData.reservationDate}</strong>
                    </div>
                    <div className="review-item">
                      <span>Check-out:</span>
                      <strong>{formData.checkoutDate}</strong>
                    </div>
                    <div className="review-item">
                      <span>Duration:</span>
                      <strong>{calculateNights(formData.reservationDate, formData.checkoutDate)} night(s)</strong>
                    </div>
                    <div className="review-item">
                      <span>Type:</span>
                      <strong>{getPriceType()}</strong>
                    </div>
                    <div className="review-item">
                      <span>Price (per night):</span>
                      <strong>₱{getPrice().toLocaleString()}</strong>
                    </div>
                    <div className="review-item review-total">
                      <span>Total Amount:</span>
                      <strong>₱{(getPrice() * calculateNights(formData.reservationDate, formData.checkoutDate)).toLocaleString()}</strong>
                    </div>
                    <div className="review-item">
                      <span>Payment Method:</span>
                      <strong>{getPaymentMethodName(formData.paymentMethod)}</strong>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="terms-section">
                    <h3>Terms & Conditions</h3>
                    <div className="terms-content">
                      <p><strong>Terms & Conditions:</strong></p>
                      <ul>
                        <li><strong>Non-refundable but can be rebooked</strong> (only 1 rebooked attempt is allowed and applicable for weekdays only)</li>
                        <li>Booking confirmation will be sent within 24 hours</li>
                        <li>Please arrive 15 minutes before your check-in time</li>
                        <li>Cancellation must be made at least 7 days before reservation date</li>
                        <li>Payment must be completed before arrival for e-wallet payments</li>
                        <li>Management reserves the right to modify terms</li>
                      </ul>
                    </div>
                    
                    <div className="terms-checkbox">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <label htmlFor="agreeTerms">
                        I agree to the terms and conditions above *
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" className="btn-prev" onClick={handlePrev}>
                    ← Previous
                  </button>
                )}
                
                {step < 4 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="btn-submit">
                    Complete Booking
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function calculateNights(checkIn, checkOut) {
  const check1 = new Date(checkIn);
  const check2 = new Date(checkOut);
  const nights = Math.ceil((check2 - check1) / (1000 * 60 * 60 * 24));
  return nights;
}

function getPaymentMethodName(method) {
  const methods = {
    cash: 'Cash Payment',
    gcash: 'GCash',
    gotyme: 'GoTyme Bank'
  };
  return methods[method] || 'Unknown';
}

export default Booking;
