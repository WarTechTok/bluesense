// frontend/src/pages/booking/Booking.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useBlocker } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { reserveSlot, releaseSlot, confirmBooking } from "../../services/api";
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
  const [sessionData, setSessionData]             = useState([]);

  // ---- Stored reservation ID from Step 2 ----
  const [reservedBookingId, setReservedBookingId] = useState(
    () => localStorage.getItem("reservedBookingId") || null
  );

  // Helper — clears reservation from BOTH state and localStorage
  const clearReservation = () => {
    setReservedBookingId(null);
    localStorage.removeItem("reservedBookingId");
  };

  // ---- Step 2 inline error (409 slot taken) ----
  const [slotError, setSlotError] = useState("");

  const preselectedOasis   = location.state?.oasis   || null;
  const preselectedPackage = location.state?.package || null;

  const [selectedOasis]   = useState(preselectedOasis  || "");
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

  const currentPackage = (() => {
    if (!preselectedPackage) return null;
    return {
      ...preselectedPackage,
      sessions:
        preselectedPackage.sessions?.length > 0
          ? preselectedPackage.sessions
          : preselectedPackage.availableSessions || [],
    };
  })();

  const getMaxCapacityForPackage = () => getMaxCapacityFromPackage(currentPackage);
  const getMinCapacityForPackage = () => getMinCapacityFromPackage(currentPackage);

  const calculatePrice = () => {
    if (!selectedSession || !formData.reservationDate) return 0;
    return getPriceFromPackage(currentPackage, selectedSession, formData.reservationDate, formData.guestCount);
  };

  const calculateAddonsTotal = () =>
    Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);

  const calculateExtraGuestCharges = () =>
    getExtraGuestCharge(currentPackage, formData.guestCount);

  const getTotalPrice = () => {
    const base       = calculatePrice();
    const extraGuest = calculateExtraGuestCharges();
    const addons     = calculateAddonsTotal();
    return base + extraGuest + addons;
  };

  const calculateNights = () => 1;

  const getDownpayment = () => getDownpaymentAmount(selectedSession, sessionData);

  const getAvailableSessions = () => currentPackage?.sessions || [];

  // ---- Lifecycle ----
  useEffect(() => {
    if (!preselectedOasis || !preselectedPackage) {
      const confirm = window.confirm("Please select a package first. Go to homepage?");
      if (confirm) navigate("/");
    }
  }, [preselectedOasis, preselectedPackage, navigate]);

  // FIX 4: Release the slot on tab close / refresh (page unload events).
  useEffect(() => {
    const handleBeforeUnload = () => {
      const id = localStorage.getItem("reservedBookingId");
      if (!id) return;

      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

      fetch(`${API_BASE_URL}/api/bookings/reserve/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
      });

      localStorage.removeItem("reservedBookingId");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // FIX 3b: Release the slot on in-SPA navigation (browser Back, Navbar links).
  // beforeunload doesn't fire on SPA navigation — useBlocker intercepts it.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!reservedBookingId &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      (async () => {
        try {
          await releaseSlot(reservedBookingId);
          console.log(`🔓 Slot released on SPA navigation: ${reservedBookingId}`);
        } catch (err) {
          console.warn("releaseSlot failed on navigation — proceeding anyway:", err?.message);
        } finally {
          clearReservation();
          blocker.proceed();
        }
      })();
    }
  }, [blocker, reservedBookingId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login?redirect=/booking");
  }, [navigate]);

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

  // ---- Handlers ----
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setFormData((prev) => ({ ...prev, session }));
    if (errors.session) setErrors((prev) => ({ ...prev, session: "" }));
    setSlotError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "reservationDate") setSlotError("");

    if (name === "guestCount") {
      const maxCap  = getMaxCapacityForPackage();
      const guests  = parseInt(value) || 0;
      if (guests > maxCap && maxCap > 0) {
        const extra    = guests - maxCap;
        const feeRate  = currentPackage?.extraGuestFee ?? 150;
        const extraCost = extra * feeRate;
        setExtraGuestWarning(
          `ℹ️ +${extra} guest(s) beyond standard capacity. Additional ₱${feeRate}/guest = ₱${extraCost.toLocaleString()} will be added to your total.`,
        );
      } else {
        setExtraGuestWarning("");
      }
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName?.trim())  newErrors.fullName  = "Full name is required";
      if (!formData.email?.trim())     newErrors.email     = "Email is required";
      if (formData.phone?.trim()) {
        const phPhoneRegex = /^(\+?63|0)?9\d{9}$/;
        if (!phPhoneRegex.test(formData.phone.trim()))
          newErrors.phone = "Invalid phone number. Use: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX, or 9XXXXXXXXX";
      }
      if (!formData.guestCount || formData.guestCount < 1)
        newErrors.guestCount = "Number of guests is required";
      const minCap = getMinCapacityForPackage();
      if (minCap > 0 && formData.guestCount < minCap)
        newErrors.guestCount = `Minimum ${minCap} guests required for this package`;
      if (!infoConfirmed)
        newErrors.confirmInfo = "Please confirm your information first";
    }

    if (step === 2) {
      if (!formData.reservationDate) newErrors.reservationDate = "Reservation date is required";
      if (!selectedSession)          newErrors.session          = "Please select a session";
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method";
      if (!formData.paymentType)   newErrors.paymentType   = "Please select a payment type";
      if (
        formData.paymentMethod &&
        formData.paymentMethod !== "cash" &&
        !formData.paymentProof
      )
        newErrors.paymentProof = "Please upload payment proof";
    }

    if (step === 4 && !formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && !infoConfirmed) {
      setErrors({ ...errors, confirmInfo: "Please confirm your information first" });
      return;
    }

    if (!validateStep()) return;

    if (step === 2) {
      setIsSubmitting(true);
      setSlotError("");
      try {
        const result = await reserveSlot({
          customerName:    formData.fullName,
          customerEmail:   formData.email,
          customerContact: formData.phone?.trim() || "",
          oasis:           selectedOasis,
          package:         selectedPackage,
          session:         selectedSession,
          bookingDate:     formData.reservationDate,
          pax:             Number(formData.guestCount),
          specialRequests: formData.specialRequests || "",
        });

        const bookingId = result.bookingId;

        setReservedBookingId(bookingId);
        localStorage.setItem("reservedBookingId", bookingId);

        if (result.reused) {
          console.log(`♻️  Reusing existing reservation: ${bookingId} until ${result.reservedUntil}`);
        } else {
          console.log(`✅ Slot reserved: ${bookingId} until ${result.reservedUntil}`);
        }

        setStep(3);
        window.scrollTo(0, 0);
      } catch (error) {
        if (error.status === 409) {
          setSlotError("This date and session is already reserved. Please select another date or session.");
        } else {
          setSlotError(error?.data?.message || error?.message || "Failed to reserve slot. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = async () => {
    if (step === 3 && reservedBookingId) {
      try {
        await releaseSlot(reservedBookingId);
        console.log(`🔓 Slot released on Back: ${reservedBookingId}`);
      } catch (err) {
        console.warn("releaseSlot failed (Back button) — proceeding anyway:", err?.message);
      }
      clearReservation();
    }

    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleViewBookings = () => {
    setShowPendingModal(false);
    setShowLimitModal(false);
    navigate("/my-bookings");
  };

  const handleDoubleBookingClose = () => {
    setShowDoubleBookingModal(false);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!reservedBookingId) {
      alert("Reservation not found. Please go back to Step 2 and try again.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const mapPaymentMethod = (m) =>
        ({ cash: "Cash", gcash: "GCash", maya: "Maya", seabank: "SeaBank", gotyme: "GoTyme" })[m] || m;

      const fd = new FormData();
      fd.append("totalPrice",    getTotalPrice());
      fd.append("downpayment",   getDownpayment());
      fd.append("paymentType",   formData.paymentType);
      fd.append("paymentMethod", mapPaymentMethod(formData.paymentMethod));
      fd.append("addons",        JSON.stringify(selectedAddons || {}));
      fd.append("pax",           Number(formData.guestCount));
      if (formData.paymentProof) fd.append("paymentProof", formData.paymentProof);

      console.log("📤 Confirming booking:", reservedBookingId, "— total:", getTotalPrice());

      const result = await confirmBooking(reservedBookingId, fd);

      if (result.booking) {
        clearReservation();
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

      if (status === 410 || msg.includes("expired")) {
        clearReservation();
        alert("Your reservation has expired (5 minutes). Please select your date again.");
        setStep(2);
        window.scrollTo(0, 0);
      } else if (status === 409 || msg.includes("already booked")) {
        setShowDoubleBookingModal(true);
      } else if (msg.includes("pending booking") || msg.includes("complete your payment first")) {
        setShowPendingModal(true);
      } else if (msg.includes("2 upcoming bookings") || msg.includes("booking limit")) {
        setShowLimitModal(true);
      } else {
        alert(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePerNight = calculatePrice();
  const totalPrice    = getTotalPrice();
  const nights        = calculateNights();
  const downpayment   = getDownpayment();

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
                    selectedPackageObj={currentPackage}
                  />
                  {errors.confirmInfo && (
                    <span className="error-message confirm-error">{errors.confirmInfo}</span>
                  )}
                </>
              )}

              {step === 2 && (
                <>
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
                  {slotError && (
                    <div className="slot-error-message" style={{
                      marginTop: "12px",
                      padding: "12px 16px",
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      color: "#dc2626",
                      fontSize: "14px",
                    }}>
                      ⚠️ {slotError}
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <AddonsSelector
                    packageData={currentPackage}
                    selectedSession={selectedSession}
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
                    disabled={(step === 1 && !infoConfirmed) || isSubmitting}
                  >
                    {step === 2 && isSubmitting ? (
                      <><i className="fas fa-spinner fa-spin"></i> Checking availability...</>
                    ) : (
                      <>Continue <i className="fas fa-arrow-right"></i></>
                    )}
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