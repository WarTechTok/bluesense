// frontend/src/pages/booking/Booking.jsx
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
import PackageSelector from '../../components/booking/PackageSelector';
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
  
  // Package selection state
  const [selectedOasis, setSelectedOasis] = useState(location.state?.oasis || 'Oasis 1');
  const [selectedPackage, setSelectedPackage] = useState(location.state?.package?.name || null);
  const [selectedSession, setSelectedSession] = useState(null);
  
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
    session: '',
    paymentProof: null
  });
  
  const [errors, setErrors] = useState({});

  // Get current package data
  const currentPackage = selectedOasis && selectedPackage 
    ? oasisPackages[selectedOasis]?.packages[selectedPackage] 
    : null;

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
    return 1; // Day and Night are single-day bookings
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

  // Handle package selection
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedSession(null);
    setFormData(prev => ({ ...prev, session: '' }));
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setFormData(prev => ({ ...prev, session: session }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!selectedPackage) newErrors.package = 'Please select a package';
      if (!selectedSession) newErrors.session = 'Please select a session';
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.guestCount > (currentPackage?.maxPax || 100)) {
        newErrors.guestCount = `Maximum ${currentPackage?.maxPax} guests for this package`;
      }
    }
    if (step === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = 'Reservation date is required';
    }
    if (step === 4 && !formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
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
        addons: selectedAddons,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod === 'cash' ? 'Cash' : formData.paymentMethod === 'gcash' ? 'GCash' : 'GoTyme',
        paymentProof: formData.paymentProof
      };
      
      const result = await createBooking(bookingPayload);
      
      if (result.booking) {
        setBookingDetails({
          bookingId: result.booking._id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase(),
          oasis: selectedOasis,
          package: selectedPackage,
          session: selectedSession,
          checkIn: new Date(formData.reservationDate).toLocaleDateString(),
          guests: formData.guestCount,
          totalAmount: getTotalPrice(),
          downpayment: getDownpaymentAmount()
        });
        setShowSuccessModal(true);
      } else {
        alert(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePerNight = calculatePrice();
  const totalPrice = getTotalPrice();
  const nights = calculateNights();
  const downpayment = getDownpaymentAmount();

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking-hero">
        <div className="booking-hero-bg"></div>
        <div className="booking-hero-content">
          <span className="hero-badge">Secure Your Stay</span>
          <h1>Complete Your Reservation</h1>
          <p>Experience tranquility at Catherine's Oasis</p>
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
          />
          
          <div className="booking-form-wrapper">
            <StepIndicator currentStep={step} />
            <form className="booking-form" onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <div className="oasis-selector">
                    <h3>Select Location</h3>
                    <div className="oasis-buttons">
                      <button 
                        type="button"
                        className={`oasis-btn ${selectedOasis === 'Oasis 1' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedOasis('Oasis 1');
                          setSelectedPackage(null);
                          setSelectedSession(null);
                        }}
                      >
                        Oasis 1
                      </button>
                      <button 
                        type="button"
                        className={`oasis-btn ${selectedOasis === 'Oasis 2' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedOasis('Oasis 2');
                          setSelectedPackage(null);
                          setSelectedSession(null);
                        }}
                      >
                        Oasis 2
                      </button>
                    </div>
                  </div>
                  
                  <PackageSelector
                    selectedOasis={selectedOasis}
                    selectedPackage={selectedPackage}
                    onSelectPackage={handlePackageSelect}
                    onSelectSession={handleSessionSelect}
                    selectedDate={formData.reservationDate}
                  />
                  
                  {errors.package && <span className="error-message">{errors.package}</span>}
                  {errors.session && <span className="error-message">{errors.session}</span>}
                  
                  <GuestInfoStep formData={formData} errors={errors} handleChange={handleChange} />
                </>
              )}
              
              {step === 2 && (
                <DateStep 
                  formData={formData} 
                  errors={errors} 
                  handleChange={handleChange}
                  selectedOasis={selectedOasis}
                  selectedPackage={selectedPackage}
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
                  <button type="button" className="btn-next" onClick={handleNext}>
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