// frontend/src/pages/booking/Booking.jsx
// ============================================
// BOOKING PAGE — all prices from API via currentPackage
// ============================================

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { createBooking } from "../../services/api";
import BookingSuccessModal from "../../components/modals/BookingSuccessModal";
import PendingBookingModal from "../../components/modals/PendingBookingModal";
import LimitReachedModal from "../../components/modals/LimitReachedModal";
import DoubleBookingModal from "../../components/modals/DoubleBookingModal";
import StepIndicator from "./StepIndicator";
import BookingSummary from "./BookingSummary";
import GuestInfoStep from "./GuestInfoStep";
import DateStep from "./DateStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import AddonsSelector from "../../components/booking/AddonsSelector";
import {
  getPriceFromPackage,
  getExtraGuestCharge,
  getDownpaymentAmount,
  getMaxCapacityFromPackage,
  getMinCapacityFromPackage,
} from "../../config/packageData";
import "./Booking.css";

function Booking() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [step, setStep]                           = useState(1);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [showSuccessModal, setShowSuccessModal]   = useState(false);
  const [showPendingModal, setShowPendingModal]   = useState(false);
  const [showLimitModal, setShowLimitModal]       = useState(false);
  const [showDoubleBookingModal, setShowDoubleBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails]       = useState(null);
  const [selectedAddons, setSelectedAddons]       = useState({});
  const [infoConfirmed, setInfoConfirmed]         = useState(false);
  const [extraGuestWarning, setExtraGuestWarning] = useState("");
  // Sessions fetched from DB — includes downpaymentAmount set by admin
  const [sessionData, setSessionData]             = useState([]);

  // Pre-selected data from navigation state (set by PackageCard → handleBook)
  const preselectedOasis   = location.state?.oasis   || null;
  const preselectedPackage = location.state?.package || null; // full API-transformed object

  const [selectedOasis]   = useState(preselectedOasis || "");
  const [selectedPackage] = useState(preselectedPackage?.name || null);
  const [selectedSession, setSelectedSession] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    fullName:        loggedInUser.name  || "",
    email:           loggedInUser.email || "",
    phone:           loggedInUser.phone || "",
    guestCount:      1,
    reservationDate: "",
    checkoutDate:    "",
    specialRequests: "",
    paymentMethod:   "",
    paymentType:     "downpayment",
    agreeTerms:      false,
    session:         "",
    paymentProof:    null,
  });

  const [errors, setErrors] = useState({});

  // ============================================
  // currentPackage — SINGLE SOURCE OF TRUTH
  // This is the API-fetched, transformed package object.
  // It carries correct pricing, capacity, and sessions from the DB.
  // All price/capacity calculations MUST read from this object.
  // ============================================
  const currentPackage = (() => {
    if (!preselectedPackage) return null;
    return {
      ...preselectedPackage,
      // Ensure sessions field is populated (transformPackageData sets this)
      sessions: preselectedPackage.sessions?.length > 0
        ? preselectedPackage.sessions
        : preselectedPackage.availableSessions || [],
    };
  })();

  // ============================================
  // CAPACITY (from API)
  // ============================================
  const getMaxCapacityForPackage = () => getMaxCapacityFromPackage(currentPackage);
  const getMinCapacityForPackage = () => getMinCapacityFromPackage(currentPackage);

  // ============================================
  // PRICING (from API via currentPackage)
  // ============================================

  // Base package price — reads currentPackage.pricing, NOT hardcoded table
  const calculatePrice = () => {
    if (!selectedSession || !formData.reservationDate) return 0;
    return getPriceFromPackage(
      currentPackage,
      selectedSession,
      formData.reservationDate,
      formData.guestCount
    );
  };

  const calculateAddonsTotal = () =>
    Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);

  // Extra-guest charge: ₱150 per guest over maxCapacity
  const calculateExtraGuestCharges = () =>
    getExtraGuestCharge(currentPackage, formData.guestCount);

  const getTotalPrice = () => {
    const base       = calculatePrice();
    const extraGuest = calculateExtraGuestCharges();
    const addons     = calculateAddonsTotal();
    const total      = base + extraGuest + addons;

    console.log("💰 Price breakdown:", {
      base, extraGuest, addons, total,
      guestCount:  formData.guestCount,
      maxCapacity: getMaxCapacityForPackage(),
      package:     selectedPackage,
      session:     selectedSession,
      date:        formData.reservationDate,
    });

    return total;
  };

  const calculateNights = () => 1;

  // Downpayment: prefer DB value set by admin
  const getDownpayment = () =>
    getDownpaymentAmount(selectedSession, sessionData);

  // ============================================
  // AVAILABLE SESSIONS (from API)
  // ============================================
  const getAvailableSessions = () => currentPackage?.sessions || [];

  // ============================================
  // LIFECYCLE
  // ============================================
  useEffect(() => {
    if (!preselectedOasis || !preselectedPackage) {
      const confirm = window.confirm("Please select a package first. Go to homepage?");
      if (confirm) navigate("/");
    }
  }, [preselectedOasis, preselectedPackage, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login?redirect=/booking");
  }, [navigate]);

  // Fetch session config (downpayment amounts) from DB
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
        const res  = await fetch(`${API_BASE_URL}/api/admin/sessions`);
        const data = await res.json();
        if (Array.isArray(data)) setSessionData(data);
      } catch (err) {
        console.error("Failed to fetch session data:", err);
      }
    };
    fetchSessions();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setFormData((prev) => ({ ...prev, session }));
    if (errors.session) setErrors((prev) => ({ ...prev, session: "" }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // Update extra-guest warning using API capacity
    if (name === "guestCount") {
      const maxCap   = getMaxCapacityForPackage();
      const guests   = parseInt(value) || 0;
      if (guests > maxCap && maxCap > 0) {
        const extra    = guests - maxCap;
        const extraCost = extra * 150;
        setExtraGuestWarning(
          `ℹ️ +${extra} guest(s) beyond standard capacity. Additional ₱150/guest = ₱${extraCost.toLocaleString()} will be added to your total.`
        );
      } else {
        setExtraGuestWarning("");
      }
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email?.trim())    newErrors.email    = "Email is required";
      if (!formData.guestCount || formData.guestCount < 1)
        newErrors.guestCount = "Number of guests is required";

      const minCap = getMinCapacityForPackage();

      if (minCap > 0 && formData.guestCount < minCap)
        newErrors.guestCount = `Minimum ${minCap} guests required for this package`;
      // No upper block — guests above maxCapacity are allowed; extra charge is added to total
      if (!infoConfirmed)
        newErrors.confirmInfo = "Please confirm your information first";
    }

    if (step === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = "Reservation date is required";
      if (!selectedSession)          newErrors.session = "Please select a session";
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method";
      if (!formData.paymentType)   newErrors.paymentType   = "Please select a payment type";
      if (formData.paymentMethod && formData.paymentMethod !== "cash" && !formData.paymentProof)
        newErrors.paymentProof = "Please upload payment proof";
    }

    if (step === 4 && !formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !infoConfirmed) {
      setErrors({ ...errors, confirmInfo: "Please confirm your information first" });
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

  const handleViewBookings    = () => { setShowPendingModal(false); setShowLimitModal(false); navigate("/my-bookings"); };
  const handleDoubleBookingClose = () => { setShowDoubleBookingModal(false); setStep(2); window.scrollTo(0, 0); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);

    try {
      const mapPaymentMethod = (m) => ({
        cash: "Cash", gcash: "GCash", maya: "Maya", seabank: "SeaBank", gotyme: "GoTyme",
      }[m] || m);

      const fd = new FormData();
      fd.append("customerName",    formData.fullName);
      fd.append("customerContact", formData.phone);
      fd.append("customerEmail",   formData.email);
      fd.append("oasis",           selectedOasis);
      fd.append("package",         selectedPackage);
      fd.append("session",         selectedSession);
      fd.append("bookingDate",     formData.reservationDate);
      fd.append("pax",             Number(formData.guestCount));
      fd.append("totalPrice",      getTotalPrice());
      fd.append("downpayment",     getDownpayment());
      fd.append("paymentType",     formData.paymentType);
      fd.append("paymentMethod",   mapPaymentMethod(formData.paymentMethod));
      fd.append("specialRequests", formData.specialRequests || "");
      fd.append("addons",          JSON.stringify(selectedAddons || {}));
      if (formData.paymentProof) fd.append("paymentProof", formData.paymentProof);

      console.log("📤 Submitting booking — total:", getTotalPrice(), "down:", getDownpayment());

      const result = await createBooking(fd);

      if (result.booking) {
        setBookingDetails({
          bookingId:   result.booking.bookingReference || result.booking._id?.slice(-6).toUpperCase(),
          oasis:       selectedOasis,
          package:     selectedPackage,
          session:     selectedSession,
          checkIn:     new Date(formData.reservationDate).toLocaleDateString(),
          guests:      formData.guestCount,
          totalAmount: getTotalPrice(),
          downpayment: getDownpayment(),
          paymentType: formData.paymentType,
        });
        setShowSuccessModal(true);
      } else {
        alert(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      const msg    = error?.data?.message || error?.message || "Failed to submit booking.";
      const status = error?.status;
      if (status === 409 || msg.includes("already booked")) {
        setShowDoubleBookingModal(true);
      } else if (msg.includes("pending booking") || msg.includes("complete your payment first")) {
        setShowPendingModal(true);
      } else if (msg.includes("2 upcoming bookings") || msg.includes("booking limit")) {
        setShowLimitModal(true);
      } else if (!msg.includes("already have a booking on this date")) {
        alert(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived values passed to child components
  const pricePerNight = calculatePrice();
  const totalPrice    = getTotalPrice();
  const nights        = calculateNights();
  const downpayment   = getDownpayment();

  // ============================================
  // GUARD: no package selected
  // ============================================
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
                    selectedOasis={selectedOasis}
                    selectedPackage={selectedPackage}
                  />
                  {errors.confirmInfo && (
                    <span className="error-message confirm-error">{errors.confirmInfo}</span>
                  )}
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
                  packageData={currentPackage}
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
                    className={`btn-next ${step === 1 && !infoConfirmed ? "disabled" : ""}`}
                    onClick={handleNext}
                    disabled={step === 1 && !infoConfirmed}
                  >
                    Continue <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                      : <><i className="fas fa-check-circle"></i> Confirm Booking</>
                    }
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
      <PendingBookingModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onViewBookings={handleViewBookings}
      />
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onViewBookings={handleViewBookings}
      />
      <DoubleBookingModal
        isOpen={showDoubleBookingModal}
        onClose={() => setShowDoubleBookingModal(false)}
        onSelectAnotherDate={handleDoubleBookingClose}
      />
    </div>
  );
}

export default Booking;