import React, { useState, useEffect } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getPrice = () => {
    if (!formData.reservationDate) return packageData.price || 0;
    
    const checkInDate = new Date(formData.reservationDate);
    const dayOfWeek = checkInDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (packageData.pricing) {
      if (isWeekend && packageData.pricing.weekend) {
        const weekendPrices = Object.values(packageData.pricing.weekend);
        return weekendPrices[0] || packageData.price || 0;
      } else if (packageData.pricing.weekday) {
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
    return isWeekend ? 'Weekend Rate' : 'Weekday Rate';
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const check1 = new Date(checkIn);
    const check2 = new Date(checkOut);
    const nights = Math.ceil((check2 - check1) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const getTotalPrice = () => {
    const nights = calculateNights(formData.reservationDate, formData.checkoutDate);
    return getPrice() * nights;
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Cash Payment',
      gcash: 'GCash',
      gotyme: 'GoTyme Bank'
    };
    return methods[method] || 'Unknown';
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.guestCount) newErrors.guestCount = 'Number of guests is required';
    }
    
    if (step === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = 'Check-in date is required';
      if (!formData.checkoutDate) newErrors.checkoutDate = 'Check-out date is required';
      if (formData.reservationDate && formData.checkoutDate) {
        const nights = calculateNights(formData.reservationDate, formData.checkoutDate);
        if (nights <= 0) newErrors.checkoutDate = 'Check-out must be after check-in';
      }
    }
    
    if (step === 4 && !formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Booking submitted:', formData);
    alert('✨ Booking submitted successfully! We will contact you soon.');
    navigate('/');
  };

  const today = new Date().toISOString().split('T')[0];
  const nights = calculateNights(formData.reservationDate, formData.checkoutDate);
  const pricePerNight = getPrice();
  const totalPrice = getTotalPrice();
  const priceType = getPriceType();

  return (
    <div className="booking-page">
      <Navbar />

      {/* Hero Section */}
      <div className="booking-hero">
        <div className="booking-hero-bg"></div>
        <div className="booking-hero-content">
          <span className="hero-badge">Secure Your Stay</span>
          <h1>Complete Your Reservation</h1>
          <p>Experience tranquility at Catherine's Oasis</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="booking-main">
        <div className="booking-container">
          {/* Package Summary Card */}
          <div className="booking-summary-card">
            <div className="summary-header">
              <i className="fas fa-leaf"></i>
              <h3>Booking Summary</h3>
            </div>
            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">Package</span>
                <span className="summary-value">{packageData.name || 'Selected Package'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Location</span>
                <span className="summary-value">{oasis || 'Catherine\'s Oasis'}</span>
              </div>
              {formData.reservationDate && (
                <>
                  <div className="summary-divider"></div>
                  <div className="summary-row">
                    <span className="summary-label">Check-in</span>
                    <span className="summary-value">
                      <i className="far fa-calendar-alt"></i> {new Date(formData.reservationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {formData.checkoutDate && (
                    <div className="summary-row">
                      <span className="summary-label">Check-out</span>
                      <span className="summary-value">
                        <i className="far fa-calendar-alt"></i> {new Date(formData.checkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {nights > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Duration</span>
                      <span className="summary-value">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span className="summary-label">Rate Type</span>
                    <span className={`rate-badge ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>
                      {priceType}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Guests</span>
                    <span className="summary-value">
                      <i className="fas fa-user-friends"></i> {formData.guestCount} {formData.guestCount === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row price-breakdown">
                    <span className="summary-label">Rate per night</span>
                    <span className="summary-value">₱{pricePerNight.toLocaleString()}</span>
                  </div>
                  {nights > 0 && (
                    <div className="summary-row price-breakdown">
                      <span className="summary-label">Total ({nights} nights)</span>
                      <span className="summary-value">₱{totalPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span className="summary-label">Total Due</span>
                    <span className="total-amount">₱{totalPrice.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            {!formData.reservationDate && (
              <div className="summary-empty">
                <i className="far fa-calendar-plus"></i>
                <p>Select your dates to see pricing</p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="booking-form-wrapper">
            {/* Step Indicator */}
            <div className="step-indicator">
              {[
                { num: 1, label: 'Guest Info', icon: 'fas fa-user' },
                { num: 2, label: 'Dates', icon: 'fas fa-calendar-alt' },
                { num: 3, label: 'Payment', icon: 'fas fa-credit-card' },
                { num: 4, label: 'Review', icon: 'fas fa-check-circle' }
              ].map((item) => (
                <div key={item.num} className={`step-item ${step >= item.num ? 'active' : ''} ${step === item.num ? 'current' : ''}`}>
                  <div className="step-circle">
                    {step > item.num ? <i className="fas fa-check"></i> : item.num}
                  </div>
                  <div className="step-label">
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form className="booking-form" onSubmit={handleSubmit}>
              {/* Step 1: Guest Information */}
              {step === 1 && (
                <div className="step-card">
                  <div className="step-header">
                    <i className="fas fa-user-circle"></i>
                    <h2>Who's coming?</h2>
                    <p>Tell us about the primary guest</p>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Full Name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-user input-icon"></i>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={errors.fullName ? 'error' : ''}
                        />
                      </div>
                      {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Email Address <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-envelope input-icon"></i>
                        <input
                          type="email"
                          name="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? 'error' : ''}
                        />
                      </div>
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label>Phone Number <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-phone input-icon"></i>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+63 9XX XXX XXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? 'error' : ''}
                        />
                      </div>
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label>Number of Guests <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-user-friends input-icon"></i>
                        <select
                          name="guestCount"
                          value={formData.guestCount}
                          onChange={handleChange}
                          className={errors.guestCount ? 'error' : ''}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 50].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Dates */}
              {step === 2 && (
                <div className="step-card">
                  <div className="step-header">
                    <i className="fas fa-calendar-week"></i>
                    <h2>When are you staying?</h2>
                    <p>Select your check-in and check-out dates</p>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Check-in Date <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-calendar-check input-icon"></i>
                        <input
                          type="date"
                          name="reservationDate"
                          value={formData.reservationDate}
                          onChange={handleChange}
                          min={today}
                          className={errors.reservationDate ? 'error' : ''}
                        />
                      </div>
                      {errors.reservationDate && <span className="error-message">{errors.reservationDate}</span>}
                    </div>

                    <div className="form-group">
                      <label>Check-out Date <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-calendar-times input-icon"></i>
                        <input
                          type="date"
                          name="checkoutDate"
                          value={formData.checkoutDate}
                          onChange={handleChange}
                          min={formData.reservationDate || today}
                          className={errors.checkoutDate ? 'error' : ''}
                        />
                      </div>
                      {errors.checkoutDate && <span className="error-message">{errors.checkoutDate}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label>Special Requests</label>
                      <div className="input-wrapper">
                        <i className="fas fa-pen input-icon"></i>
                        <textarea
                          name="specialRequests"
                          placeholder="Any special requirements or preferences? (e.g., dietary restrictions, celebration requests)"
                          rows="4"
                          value={formData.specialRequests}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="date-info-card">
                        <i className="fas fa-moon"></i>
                        <div>
                          <strong>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong>
                          <span>Stay duration</span>
                        </div>
                        <div className="rate-info">
                          <span className={`rate-tag ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>
                            {priceType}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div className="step-card">
                  <div className="step-header">
                    <i className="fas fa-wallet"></i>
                    <h2>Payment Method</h2>
                    <p>Choose how you'd like to pay</p>
                  </div>
                  
                  <div className="payment-methods">
                    <div className={`payment-card ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
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
                          <p>Pay upon arrival at the property</p>
                        </div>
                        <div className="payment-check">
                          {formData.paymentMethod === 'cash' && <i className="fas fa-check-circle"></i>}
                        </div>
                      </label>
                    </div>

                    <div className={`payment-card ${formData.paymentMethod === 'gcash' ? 'selected' : ''}`}>
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
                          <p>Quick and easy mobile payment</p>
                        </div>
                        <div className="payment-check">
                          {formData.paymentMethod === 'gcash' && <i className="fas fa-check-circle"></i>}
                        </div>
                      </label>
                    </div>

                    <div className={`payment-card ${formData.paymentMethod === 'gotyme' ? 'selected' : ''}`}>
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
                          <p>Digital banking made simple</p>
                        </div>
                        <div className="payment-check">
                          {formData.paymentMethod === 'gotyme' && <i className="fas fa-check-circle"></i>}
                        </div>
                      </label>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="payment-summary">
                      <div className="payment-summary-row">
                        <span>Room rate ({nights} night{nights !== 1 ? 's' : ''})</span>
                        <span>₱{pricePerNight.toLocaleString()} × {nights}</span>
                      </div>
                      <div className="payment-summary-row total">
                        <span>Total Amount Due</span>
                        <span>₱{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="payment-note">
                        <i className="fas fa-info-circle"></i>
                        <p>For e-wallet payments, you'll receive payment instructions after booking confirmation.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Terms */}
              {step === 4 && (
                <div className="step-card">
                  <div className="step-header">
                    <i className="fas fa-clipboard-list"></i>
                    <h2>Review Your Booking</h2>
                    <p>Double-check your details before confirming</p>
                  </div>
                  
                  <div className="review-grid">
                    <div className="review-section">
                      <h3><i className="fas fa-user"></i> Guest Information</h3>
                      <div className="review-details">
                        <div className="review-item">
                          <span>Full Name</span>
                          <strong>{formData.fullName}</strong>
                        </div>
                        <div className="review-item">
                          <span>Email</span>
                          <strong>{formData.email}</strong>
                        </div>
                        <div className="review-item">
                          <span>Phone</span>
                          <strong>{formData.phone}</strong>
                        </div>
                        <div className="review-item">
                          <span>Guests</span>
                          <strong>{formData.guestCount} people</strong>
                        </div>
                      </div>
                    </div>

                    <div className="review-section">
                      <h3><i className="fas fa-calendar"></i> Stay Details</h3>
                      <div className="review-details">
                        <div className="review-item">
                          <span>Check-in</span>
                          <strong>{formData.reservationDate ? new Date(formData.reservationDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</strong>
                        </div>
                        <div className="review-item">
                          <span>Check-out</span>
                          <strong>{formData.checkoutDate ? new Date(formData.checkoutDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</strong>
                        </div>
                        <div className="review-item">
                          <span>Duration</span>
                          <strong>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong>
                        </div>
                        <div className="review-item">
                          <span>Rate Type</span>
                          <strong className={`rate-badge-small ${priceType.toLowerCase().includes('weekend') ? 'weekend' : 'weekday'}`}>{priceType}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="review-section">
                      <h3><i className="fas fa-receipt"></i> Payment Summary</h3>
                      <div className="review-details">
                        <div className="review-item">
                          <span>Rate per night</span>
                          <strong>₱{pricePerNight.toLocaleString()}</strong>
                        </div>
                        <div className="review-item">
                          <span>Total ({nights} nights)</span>
                          <strong>₱{totalPrice.toLocaleString()}</strong>
                        </div>
                        <div className="review-item">
                          <span>Payment Method</span>
                          <strong>{getPaymentMethodName(formData.paymentMethod)}</strong>
                        </div>
                      </div>
                    </div>

                    {formData.specialRequests && (
                      <div className="review-section">
                        <h3><i className="fas fa-comment"></i> Special Requests</h3>
                        <div className="review-details">
                          <p className="special-requests">{formData.specialRequests}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="terms-card">
                    <h3><i className="fas fa-file-contract"></i> Terms & Conditions</h3>
                    <div className="terms-content">
                      <ul>
                        <li><i className="fas fa-exchange-alt"></i> <strong>Non-refundable but can be rebooked</strong> (only 1 rebook attempt allowed, applicable for weekdays only)</li>
                        <li><i className="fas fa-envelope"></i> Booking confirmation will be sent within 24 hours</li>
                        <li><i className="fas fa-clock"></i> Please arrive 15 minutes before your check-in time</li>
                        <li><i className="fas fa-calendar-minus"></i> Cancellation must be made at least 7 days before reservation date</li>
                        <li><i className="fas fa-credit-card"></i> Payment must be completed before arrival for e-wallet payments</li>
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
                        I have read and agree to the terms and conditions above <span className="required">*</span>
                      </label>
                    </div>
                    {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" className="btn-prev" onClick={handlePrev}>
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    Continue
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Confirm Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Booking;