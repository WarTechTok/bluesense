// frontend/src/pages/booking/Booking.jsx
// ============================================
// BOOKING PAGE - Pre-fills selections from previous page
// ============================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { createBooking } from '../../services/api';
import BookingSuccessModal from '../../components/modals/BookingSuccessModal';
import StepIndicator from './StepIndicator';
import BookingSummary from './BookingSummary';
import GuestInfoStep from './GuestInfoStep';
import DateStep from './DateStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';
import AddonsSelector from '../../components/booking/AddonsSelector';
import { getPackagePrice, getDownpayment, oasisPackages } from '../../config/packageData';
import './Booking.css';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [infoConfirmed, setInfoConfirmed] = useState(false);
  
  // Get preselected data from navigation state
  const preselectedOasis = location.state?.oasis || null;
  const preselectedPackage = location.state?.package || null;
  
  // Package selection state (pre-filled from previous page)
  const [selectedOasis] = useState(preselectedOasis || '');
  const [selectedPackage] = useState(preselectedPackage?.name || null);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Get logged-in user data from localStorage
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    fullName: loggedInUser.name || '',
    email: loggedInUser.email || '',
    phone: loggedInUser.phone || '',
    guestCount: 1,
    reservationDate: '',
    checkoutDate: '',
    specialRequests: '',
    paymentMethod: '',
    paymentType: 'downpayment',
    agreeTerms: false,
    session: '',
    paymentProof: null
  });
  
  const [errors, setErrors] = useState({});

  // Helper functions for capacity
  const getMaxCapacityForPackage = () => {
    if (selectedOasis === 'Oasis 1') {
      if (selectedPackage === 'Package 5+') return 100;
      return 20;
    }
    if (selectedOasis === 'Oasis 2') {
      if (selectedPackage === 'Package C') return 100;
      return 30;
    }
    return 100;
  };

  const getMinCapacityForPackage = () => {
    if (selectedOasis === 'Oasis 1' && selectedPackage === 'Package 5+') return 30;
    if (selectedOasis === 'Oasis 2' && selectedPackage === 'Package C') return 50;
    return 0;
  };

  // Check if selections are missing
  useEffect(() => {
    if (!preselectedOasis || !preselectedPackage) {
      const confirm = window.confirm('Please select a package first. Go to homepage?');
      if (confirm) {
        navigate('/');
      }
    }
  }, [preselectedOasis, preselectedPackage, navigate]);

  // Get current package data
  const currentPackage = selectedOasis && selectedPackage 
    ? oasisPackages[selectedOasis]?.packages[selectedPackage] 
    : null;

  // Get available sessions for this package
  const getAvailableSessions = () => {
    if (!currentPackage) return [];
    return currentPackage.sessions || [];
  };

  // Calculate price based on selections
  const calculatePrice = () => {
    if (!selectedOasis || !selectedPackage || !selectedSession || !formData.reservationDate) {
      return 0;
    }
    return getPackagePrice(selectedOasis, selectedPackage, selectedSession, formData.reservationDate, formData.guestCount);
  };

  const calculateAddonsTotal = () => {
    return Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);
  };

  const calculateNights = () => {
    if (!formData.reservationDate) return 1;
    if (selectedSession === '22hrs') return 1;
    return 1;
  };

  const getTotalPrice = () => {
    return calculatePrice() + calculateAddonsTotal();
  };

  const getDownpaymentAmount = () => {
    return getDownpayment(selectedSession);
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/booking');
    }
  }, [navigate]);

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setFormData(prev => ({ ...prev, session: session }));
    if (errors.session) {
      setErrors(prev => ({ ...prev, session: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      // Required contact info validation
      if (!formData.fullName || formData.fullName.trim() === '') {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email || formData.email.trim() === '') {
        newErrors.email = 'Email is required';
      }
      if (!formData.phone || formData.phone.trim() === '') {
        newErrors.phone = 'Phone number is required';
      }

      // Guest info validation
      if (!formData.guestCount || formData.guestCount < 1) {
        newErrors.guestCount = 'Number of guests is required';
      }
      
      // Capacity validation
      const maxCapacity = getMaxCapacityForPackage();
      const minCapacity = getMinCapacityForPackage();
      
      if (minCapacity > 0 && formData.guestCount < minCapacity) {
        newErrors.guestCount = `Minimum ${minCapacity} guests required for this package`;
      }
      if (formData.guestCount > maxCapacity) {
        const extraCost = (formData.guestCount - maxCapacity) * 150;
        newErrors.guestCount = `Maximum ${maxCapacity} guests (${formData.guestCount - maxCapacity} extra @ ₱150/head = ₱${extraCost.toLocaleString()})`;
      }
      
      // Check if info is confirmed
      if (!infoConfirmed) {
        newErrors.confirmInfo = 'Please confirm your information first';
      }
    }
    
    if (step === 2) {
      if (!formData.reservationDate) {
        newErrors.reservationDate = 'Reservation date is required';
      }
      if (!selectedSession) {
        newErrors.session = 'Please select a session';
      }
    }

    if (step === 3) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Please select a payment method';
      }
      if (!formData.paymentType) {
        newErrors.paymentType = 'Please select a payment type (downpayment or full payment)';
      }
      // Payment proof required for digital payments
      if (formData.paymentMethod && !formData.paymentProof) {
        newErrors.paymentProof = 'Please upload payment proof';
      }
    }
    
    if (step === 4 && !formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !infoConfirmed) {
      setErrors({ ...errors, confirmInfo: 'Please confirm your information first' });
      return;
    }
    
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    
    try {
      // Helper function to map payment method to proper casing
      const mapPaymentMethod = (method) => {
        const mapping = {
          'cash': 'Cash',
          'gcash': 'GCash',
          'maya': 'Maya',
          'seabank': 'SeaBank',
          'gotyme': 'GoTyme'
        };
        return mapping[method] || method;
      };

      // Handle payment proof file - Note: Payment proof upload will be handled separately
      // Not included in initial booking to avoid payload size issues
      // User can upload payment proof after booking confirmation

      const bookingPayload = {
        customerName: formData.fullName,
        customerContact: formData.phone,
        customerEmail: formData.email,
        oasis: selectedOasis,
        package: selectedPackage,
        session: selectedSession,
        bookingDate: formData.reservationDate,
        pax: Number(formData.guestCount),
        totalPrice: getTotalPrice(),
        downpayment: getDownpaymentAmount(),
        paymentType: formData.paymentType,
        addons: selectedAddons,
        specialRequests: formData.specialRequests,
        paymentMethod: mapPaymentMethod(formData.paymentMethod)
        // paymentProof: Not included to avoid payload size issues
      };
      
      // Debug log
      console.log('📤 Booking Payload:', bookingPayload);
      
      const result = await createBooking(bookingPayload);
      
      console.log('✅ Booking Response:', result);
      
      if (result.booking) {
        setBookingDetails({
          bookingId: result.booking._id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase(),
          oasis: selectedOasis,
          package: selectedPackage,
          session: selectedSession,
          checkIn: new Date(formData.reservationDate).toLocaleDateString(),
          guests: formData.guestCount,
          totalAmount: getTotalPrice(),
          downpayment: getDownpaymentAmount(),
          paymentType: formData.paymentType
        });
        setShowSuccessModal(true);
      } else {
        console.error('❌ Booking failed:', result);
        alert(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to submit booking. Please try again.';
      console.error('Error details:', error?.response?.data);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePerNight = calculatePrice();
  const totalPrice = getTotalPrice();
  const nights = calculateNights();
  const downpayment = getDownpaymentAmount();

  // Show message if no package selected
  if (!preselectedOasis || !preselectedPackage) {
    return (
      <div className="booking-page">
        <Navbar />
        <div className="booking-hero">
          <div className="booking-hero-content">
            <h1>No Package Selected</h1>
            <p>Please select a package from our Oasis pages first.</p>
            <a href="/" className="hero-btn">Go to Homepage</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking-hero">
        <div className="booking-hero-bg"></div>
        <div className="booking-hero-content">
          <span className="hero-badge">Secure Your Stay</span>
          <h1>Complete Your Reservation</h1>
          <p>{selectedOasis} - {selectedPackage}</p>
        </div>
      </div>

      <div className="booking-main">
        <div className="booking-container">
          <BookingSummary
            selectedOasis={selectedOasis}
            selectedPackage={selectedPackage}
            selectedSession={selectedSession}
            packageData={currentPackage}
            formData={formData}
            nights={nights}
            pricePerNight={pricePerNight}
            totalPrice={totalPrice}
            addonsTotal={calculateAddonsTotal()}
            downpayment={downpayment}
            paymentType={formData.paymentType}
          />
          
          <div className="booking-form-wrapper">
            <StepIndicator currentStep={step} />
            <form className="booking-form" onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <div className="selected-info">
                    <div className="info-card">
                      <span className="info-label">Selected Oasis:</span>
                      <span className="info-value">{selectedOasis}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Selected Package:</span>
                      <span className="info-value">{selectedPackage}</span>
                    </div>
                  </div>
                  
                  <GuestInfoStep 
                    formData={formData} 
                    errors={errors} 
                    handleChange={handleChange}
                    onConfirm={() => setInfoConfirmed(true)}
                    isConfirmed={infoConfirmed}
                  />
                  
                  {errors.confirmInfo && <span className="error-message confirm-error">{errors.confirmInfo}</span>}
                </>
              )}
              
              {step === 2 && (
                <DateStep 
                  formData={formData} 
                  errors={errors} 
                  handleChange={handleChange}
                  selectedOasis={selectedOasis}
                  selectedPackage={selectedPackage}
                  onSessionSelect={handleSessionSelect}
                  selectedSession={selectedSession}
                  availableSessions={getAvailableSessions()}
                />
              )}
              
              {step === 3 && (
                <>
                  <AddonsSelector 
                    packageData={currentPackage}
                    onAddonsChange={setSelectedAddons}
                  />
                  <PaymentStep 
                    formData={formData} 
                    handleChange={handleChange}
                    nights={nights}
                    pricePerNight={pricePerNight}
                    totalPrice={totalPrice}
                    downpayment={downpayment}
                    selectedSession={selectedSession}
                  />
                </>
              )}
              
              {step === 4 && (
                <ReviewStep 
                  formData={formData}
                  selectedOasis={selectedOasis}
                  selectedPackage={selectedPackage}
                  selectedSession={selectedSession}
                  nights={nights}
                  pricePerNight={pricePerNight}
                  totalPrice={totalPrice}
                  addonsTotal={calculateAddonsTotal()}
                  downpayment={downpayment}
                  selectedAddons={selectedAddons}
                  errors={errors}
                  handleChange={handleChange}
                />
              )}
              
              <div className="form-navigation">
                {step > 1 && (
                  <button type="button" className="btn-prev" onClick={handlePrev}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                )}
                {step < 4 ? (
                  <button 
                    type="button" 
                    className={`btn-next ${(step === 1 && !infoConfirmed) ? 'disabled' : ''}`} 
                    onClick={handleNext}
                    disabled={step === 1 && !infoConfirmed}
                  >
                    Continue <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    ) : (
                      <><i className="fas fa-check-circle"></i> Confirm Booking</>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <BookingSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        bookingDetails={bookingDetails} 
      />
    </div>
  );
}

export default Booking;