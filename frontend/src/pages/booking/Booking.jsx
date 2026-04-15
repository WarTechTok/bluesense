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
  const [extraGuestWarning, setExtraGuestWarning] = useState('');
  
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

  // Calculate base package price
  const calculatePrice = () => {
    if (!selectedOasis || !selectedPackage || !selectedSession || !formData.reservationDate) {
      return 0;
    }
    return getPackagePrice(selectedOasis, selectedPackage, selectedSession, formData.reservationDate, formData.guestCount);
  };

  const calculateAddonsTotal = () => {
    return Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);
  };

  // Calculate extra guest charges (₱150 per person over base capacity)
  const calculateExtraGuestCharges = () => {
    const packageData = oasisPackages[selectedOasis]?.packages[selectedPackage];
    if (!packageData) return 0;
    
    // Get base capacity (included guests with no extra charge)
    const baseCapacity = packageData.baseCapacity || packageData.capacity || 0;
    const currentGuests = formData.guestCount;
    
    if (currentGuests > baseCapacity) {
      const extraGuests = currentGuests - baseCapacity;
      return extraGuests * 150; // ₱150 per extra guest
    }
    return 0;
  };

  // Calculate total price including base price, extra guests, and addons
  const getTotalPrice = () => {
    const basePrice = calculatePrice();
    const extraGuestCharges = calculateExtraGuestCharges();
    const addonsTotal = calculateAddonsTotal();
    const total = basePrice + extraGuestCharges + addonsTotal;
    
    // Debug log to verify calculations
    console.log('💰 Price Breakdown:', {
      basePrice,
      extraGuestCharges,
      addonsTotal,
      total,
      guestCount: formData.guestCount,
      baseCapacity: oasisPackages[selectedOasis]?.packages[selectedPackage]?.baseCapacity || oasisPackages[selectedOasis]?.packages[selectedPackage]?.capacity,
      selectedPackage
    });
    
    return total;
  };

  // Calculate nights based on session
  const calculateNights = () => {
    if (!formData.reservationDate) return 1;
    if (selectedSession === '22hrs') return 1;
    if (selectedSession === 'Night') return 1;
    if (selectedSession === 'Day') return 1;
    return 1;
  };

  // Get downpayment amount based on session
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
    
    // Update extra guest warning when guest count changes
    if (name === 'guestCount') {
      const packageData = oasisPackages[selectedOasis]?.packages[selectedPackage];
      const baseCapacity = packageData?.baseCapacity || packageData?.capacity || 0;
      const guestCount = parseInt(value) || 0;
      
      if (guestCount > baseCapacity) {
        const extraCount = guestCount - baseCapacity;
        const extraCost = extraCount * 150;
        setExtraGuestWarning(`⚠️ Extra charge: ${extraCount} extra guest(s) @ ₱150/head = ₱${extraCost.toLocaleString()} will be added to your total.`);
      } else {
        setExtraGuestWarning('');
      }
    }
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

      // Guest info validation - allow exceeding capacity (just warn, don't block)
      if (!formData.guestCount || formData.guestCount < 1) {
        newErrors.guestCount = 'Number of guests is required';
      }
      
      // Capacity validation - only check minimum, maximum is allowed with extra charge
      const minCapacity = getMinCapacityForPackage();
      
      if (minCapacity > 0 && formData.guestCount < minCapacity) {
        newErrors.guestCount = `Minimum ${minCapacity} guests required for this package`;
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
      if (formData.paymentMethod && formData.paymentMethod !== 'cash' && !formData.paymentProof) {
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

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', formData.fullName);
      formDataToSend.append('customerContact', formData.phone);
      formDataToSend.append('customerEmail', formData.email);
      formDataToSend.append('oasis', selectedOasis);
      formDataToSend.append('package', selectedPackage);
      formDataToSend.append('session', selectedSession);
      formDataToSend.append('bookingDate', formData.reservationDate);
      formDataToSend.append('pax', Number(formData.guestCount));
      formDataToSend.append('totalPrice', getTotalPrice());
      formDataToSend.append('downpayment', getDownpaymentAmount());
      formDataToSend.append('paymentType', formData.paymentType);
      formDataToSend.append('paymentMethod', mapPaymentMethod(formData.paymentMethod));
      formDataToSend.append('specialRequests', formData.specialRequests || '');
      formDataToSend.append('addons', JSON.stringify(selectedAddons || {}));
      
      // Add payment proof file if uploaded
      if (formData.paymentProof) {
        formDataToSend.append('paymentProof', formData.paymentProof);
      }
      
      // Debug log
      console.log('📤 Booking with file:', formData.paymentProof);
      console.log('💰 Total Price:', getTotalPrice());
      console.log('💰 Downpayment:', getDownpaymentAmount());
      
      const result = await createBooking(formDataToSend);
      
      console.log('✅ Booking Response:', result);
      
      if (result.booking) {
        setBookingDetails({
          bookingId: result.booking.bookingReference || result.booking._id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase(),
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
            extraGuestWarning={extraGuestWarning}
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
                    extraGuestWarning={extraGuestWarning}
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