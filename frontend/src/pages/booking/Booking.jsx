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
import './Booking.css';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(location.state?.package || {});
  const [oasis, setOasis] = useState(location.state?.oasis || '');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
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

  // 🔴 Check for pending booking from sessionStorage (user just logged in)
  useEffect(() => {
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    
    if (pendingBooking && !location.state) {
      const savedData = JSON.parse(pendingBooking);
      setPackageData(savedData.package || {});
      setOasis(savedData.oasis || '');
      // Clear it so it doesn't persist
      sessionStorage.removeItem('pendingBooking');
    }
  }, [location.state]);

  // 🔴 Also check if user is not logged in at all
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/booking');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getPrice = () => {
    if (!formData.reservationDate) return packageData.price || 0;
    const checkInDate = new Date(formData.reservationDate);
    const isWeekend = checkInDate.getDay() === 0 || checkInDate.getDay() === 6;
    if (packageData.pricing) {
      if (isWeekend && packageData.pricing.weekend) {
        return Object.values(packageData.pricing.weekend)[0] || packageData.price || 0;
      } else if (packageData.pricing.weekday) {
        return Object.values(packageData.pricing.weekday)[0] || packageData.price || 0;
      }
    }
    return packageData.price || 0;
  };

  const getPriceType = () => {
    if (!formData.reservationDate) return '';
    const isWeekend = new Date(formData.reservationDate).getDay() === 0 || new Date(formData.reservationDate).getDay() === 6;
    return isWeekend ? 'Weekend Rate' : 'Weekday Rate';
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const getTotalPrice = () => getPrice() * calculateNights(formData.reservationDate, formData.checkoutDate);
  const getPaymentMethodName = (method) => {
    const methods = { cash: 'Cash Payment', gcash: 'GCash', gotyme: 'GoTyme Bank' };
    return methods[method] || 'Unknown';
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    if (step === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = 'Check-in date is required';
      if (!formData.checkoutDate) newErrors.checkoutDate = 'Check-out date is required';
      if (formData.reservationDate && formData.checkoutDate && calculateNights(formData.reservationDate, formData.checkoutDate) <= 0) {
        newErrors.checkoutDate = 'Check-out must be after check-in';
      }
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
        oasis: oasis || packageData.oasis || '',
        package: packageData.name || '',
        bookingDate: formData.reservationDate,
        pax: Number(formData.guestCount),
        downpayment: formData.reservationDate && (packageData.sessions?.includes('22hrs') ? 5000 : 3000),
        paymentMethod: formData.paymentMethod === 'cash' ? 'Cash' : formData.paymentMethod === 'gcash' ? 'GCash' : 'GoTyme',
      };
      const result = await createBooking(bookingPayload);
      if (result.booking) {
        setBookingDetails({
          bookingId: result.booking._id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase(),
          oasis: oasis || packageData.oasis || 'Catherine\'s Oasis',
          checkIn: new Date(formData.reservationDate).toLocaleDateString(),
          checkOut: new Date(formData.checkoutDate).toLocaleDateString(),
          guests: formData.guestCount,
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

  const nights = calculateNights(formData.reservationDate, formData.checkoutDate);
  const pricePerNight = getPrice();
  const totalPrice = getTotalPrice();
  const priceType = getPriceType();
  const today = new Date().toISOString().split('T')[0];

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
            packageData={packageData}
            oasis={oasis}
            formData={formData}
            nights={nights}
            pricePerNight={pricePerNight}
            totalPrice={totalPrice}
            priceType={priceType}
          />
          <div className="booking-form-wrapper">
            <StepIndicator currentStep={step} />
            <form className="booking-form" onSubmit={handleSubmit}>
              {step === 1 && <GuestInfoStep formData={formData} errors={errors} handleChange={handleChange} />}
              {step === 2 && <DateStep formData={formData} errors={errors} handleChange={handleChange} today={today} nights={nights} priceType={priceType} />}
              {step === 3 && <PaymentStep formData={formData} handleChange={handleChange} nights={nights} pricePerNight={pricePerNight} totalPrice={totalPrice} />}
              {step === 4 && <ReviewStep formData={formData} nights={nights} pricePerNight={pricePerNight} totalPrice={totalPrice} priceType={priceType} getPaymentMethodName={getPaymentMethodName} errors={errors} handleChange={handleChange} />}
              <div className="form-navigation">
                {step > 1 && <button type="button" className="btn-prev" onClick={handlePrev}><i className="fas fa-arrow-left"></i> Back</button>}
                {step < 4 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>Continue <i className="fas fa-arrow-right"></i></button>
                ) : (
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check-circle"></i> Confirm Booking</>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <BookingSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} bookingDetails={bookingDetails} />
    </div>
  );
}

export default Booking;