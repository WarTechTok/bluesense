// frontend/src/pages/booking/GuestInfoStep.jsx
// ============================================
// GUEST INFO STEP - Read-only with confirm button
// ============================================

import React, { useState, useEffect, useCallback } from "react";

const GuestInfoStep = ({
  formData,
  errors,
  handleChange,
  onConfirm,
  isConfirmed,
  selectedOasis,
  selectedPackage,
}) => {
  const [userInfo, setUserInfo] = useState({
    fullName: formData.fullName || "",
    email: formData.email || "",
    phone: formData.phone || "",
  });

  // Get minimum capacity for selected package
  const getMinCapacity = useCallback(() => {
    if (selectedOasis === "Oasis 1" && selectedPackage === "Package 5+") return 30;
    if (selectedOasis === "Oasis 2" && selectedPackage === "Package C") return 50;
    return 0;
  }, [selectedOasis, selectedPackage]);

  // Auto-set guest count to minimum when Package 5+ or Package C is selected
  useEffect(() => {
    const minCapacity = getMinCapacity();
    if (minCapacity > 0 && formData.guestCount < minCapacity) {
      handleChange({ target: { name: "guestCount", value: minCapacity } });
    }
  }, [selectedOasis, selectedPackage, getMinCapacity, handleChange, formData.guestCount]);

  // Listen for profile updates from navbar
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUserInfo({
          fullName: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
        });
        handleChange({
          target: { name: "fullName", value: updatedUser.name || "" },
        });
        handleChange({
          target: { name: "email", value: updatedUser.email || "" },
        });
        handleChange({
          target: { name: "phone", value: updatedUser.phone || "" },
        });
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setUserInfo({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [handleChange]);

  useEffect(() => {
    setUserInfo({
      fullName: formData.fullName || "",
      email: formData.email || "",
      phone: formData.phone || "",
    });
  }, [formData.fullName, formData.email, formData.phone]);

  // Get min and max capacity
  const minCapacity = getMinCapacity();
  const isGuestCountValid = formData.guestCount <= 100;
  const isGuestCountAboveMin = minCapacity === 0 || formData.guestCount >= minCapacity;
  const isConfirmDisabled = isConfirmed || !isGuestCountValid || !isGuestCountAboveMin;

  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-user-circle"></i>
        <div>
          <h2>Confirm Your Information</h2>
          <p>Please verify that your details are correct</p>
        </div>
      </div>

      {/* Simple reminder - can edit through profile */}
      <div className="info-note subtle">
        <i className="fas fa-info-circle"></i>
        <p>You can update your information in your profile settings.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>
            Full Name <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon"></i>
            <div className="readonly-display">
              {userInfo.fullName || "Not provided"}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>
            Email Address <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <i className="fas fa-envelope input-icon"></i>
            <div className="readonly-display">
              {userInfo.email || "Not provided"}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>
            Phone Number <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <i className="fas fa-phone input-icon"></i>
            <div className="readonly-display">
              {userInfo.phone || "Not provided"}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>
            Number of Guests <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <i className="fas fa-user-friends input-icon"></i>
            {isConfirmed ? (
              <div className="readonly-display">
                {formData.guestCount || "Not provided"}{" "}
                {formData.guestCount === 1 ? "person" : "persons"}
              </div>
            ) : (
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                min={minCapacity > 0 ? minCapacity : 1}
                max="100"
                className={errors?.guestCount ? "error" : ""}
              />
            )}
          </div>

          {/* Minimum capacity warning */}
          {minCapacity > 0 && formData.guestCount < minCapacity && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
              ⚠️ Minimum {minCapacity} guests required for this package.
            </div>
          )}

          {/* Maximum capacity warning */}
          {formData.guestCount > 100 && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
              Maximum 100 guests only. Please reduce to 100 or less to confirm.
            </div>
          )}

          {/* Info message for auto-filled packages */}
          {minCapacity > 0 && (
            <div style={{ color: "#0284c7", fontSize: "11px", marginTop: "4px" }}>
              ℹ️ This package requires minimum {minCapacity} guests. Auto-set to {minCapacity}.
            </div>
          )}

          {errors?.guestCount && (
            <span className="error-message">{errors.guestCount}</span>
          )}
        </div>
      </div>

      <div className="confirm-section">
        <button
          type="button"
          className={`confirm-info-btn ${isConfirmed ? "confirmed" : ""}`}
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          style={{ opacity: isConfirmDisabled ? 0.5 : 1 }}
        >
          {isConfirmed ? (
            <>
              <i className="fas fa-check-circle"></i> Confirmed
            </>
          ) : (
            <>
              <i className="fas fa-check"></i> Confirm
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GuestInfoStep;