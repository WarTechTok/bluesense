// frontend/src/pages/booking/GuestInfoStep.jsx
// ============================================
// GUEST INFO STEP - Read-only with confirm button
// ============================================

import React, { useState, useEffect, useCallback } from "react";

// NEW IMPORT: getTotalMaxCapacity tells us the hard ceiling for the selected package.
// WHAT: This helper computes maxCapacity + maxExtraGuests from the package object.
// WHY:  The old code had a hardcoded `> 100` ceiling. Now the ceiling comes from
//       the package the admin configured in Package Management.
// HOW:  Always returns a finite number (base + maxExtraGuests).
//       maxExtraGuests defaults to 0 when not set.
import { getTotalMaxCapacity } from "../../config/packageData";

const GuestInfoStep = ({
  formData,
  errors,
  handleChange,
  onConfirm,
  isConfirmed,
  selectedOasis,
  selectedPackage,
  // NEW PROP: selectedPackageObj
  // WHAT: The full API-fetched package object (not just the name string).
  // WHY:  We need maxCapacity and maxExtraGuests from the DB to compute the
  //       real booking ceiling. The name string alone isn't enough.
  // HOW:  Pass this from Booking.jsx where `currentPackage` already exists.
  //       If not provided, we fall back to safe defaults (no ceiling enforced).
  selectedPackageObj,
}) => {
  const [userInfo, setUserInfo] = useState({
    fullName: formData.fullName || "",
    email: formData.email || "",
    phone: formData.phone || "",
  });

  // Get minimum capacity for selected package (driven by DB object when available,
  // falls back to the hardcoded values for Package 5+ and Package C).
  const getMinCapacity = useCallback(() => {
    // NEW: Prefer the minCapacity from the package object if available.
    // WHY: Using the DB value means admin changes in Package Management are
    //      reflected here immediately — no code change needed.
    if (selectedPackageObj?.minCapacity > 0) return selectedPackageObj.minCapacity;

    // FALLBACK: keep old hardcoded values so nothing breaks if the prop is missing.
    if (selectedOasis === "Oasis 1" && selectedPackage === "Package 5+") return 30;
    if (selectedOasis === "Oasis 2" && selectedPackage === "Package C") return 50;
    return 0;
  }, [selectedOasis, selectedPackage, selectedPackageObj]);

  // Auto-set guest count to minimum when a package with a minimum is selected
  // 🔥 FIX: REMOVED formData.guestCount from deps to stop auto-reset on every keystroke
  useEffect(() => {
    const minCapacity = getMinCapacity();
    if (minCapacity > 0 && formData.guestCount < minCapacity) {
      handleChange({ target: { name: "guestCount", value: minCapacity } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOasis, selectedPackage]); // ← formData.guestCount REMOVED

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
        handleChange({ target: { name: "fullName", value: updatedUser.name || "" } });
        handleChange({ target: { name: "email",    value: updatedUser.email || "" } });
        handleChange({ target: { name: "phone",    value: updatedUser.phone || "" } });
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

  // ── Capacity logic ────────────────────────────────────────────────────────

  const minCapacity = getMinCapacity();

  // NEW: Compute the hard ceiling from the package object.
  // totalMaxCapacity = base + maxExtraGuests. Always a finite number.
  const totalMaxCapacity = getTotalMaxCapacity(selectedPackageObj);

  // NEW: The base capacity (guests included in package price, no extra charge).
  // WHY:  We use this to show an informational message when guests will incur
  //       an extra fee but are still within the allowed ceiling.
  const baseCapacity = selectedPackageObj?.maxCapacity || 0;

  // isAboveCeiling: true when guest count exceeds base + maxExtraGuests.
  const isAboveCeiling = Number(formData.guestCount) > totalMaxCapacity;

  // WHAT: Is the guest count below the required minimum?
  const isGuestCountAboveMin = minCapacity === 0 || Number(formData.guestCount) >= minCapacity;

  // NEW: Combine both checks to decide if the Confirm button should be disabled.
  // WHY:  Old code only checked > 100. Now we also block when above the ceiling.
  const isConfirmDisabled = isConfirmed || isAboveCeiling || !isGuestCountAboveMin;

  // NEW: Will the customer pay an extra guest fee (above base but within ceiling)?
  // WHY:  We show a soft informational message in this case — not an error, just
  //       a heads-up that extra charges will apply.
  const willHaveExtraCharge =
    baseCapacity > 0 &&
    Number(formData.guestCount) > baseCapacity &&
    !isAboveCeiling;

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
            Phone Number{" "}
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>(optional)</span>
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
                type="text"
                inputMode="numeric"
                name="guestCount"
                value={formData.guestCount}
                onKeyDown={(e) => {
                  // Allow: Backspace, Delete, Tab, arrows, Home, End
                  const allowed = [
                    "Backspace", "Delete", "Tab",
                    "ArrowLeft", "ArrowRight", "Home", "End",
                  ];
                  if (allowed.includes(e.key)) return;
                  // Block anything that is not a digit 0-9
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text");
                  const digitsOnly = pasted.replace(/\D/g, "");
                  if (digitsOnly) {
                    handleChange({ target: { name: "guestCount", value: digitsOnly } });
                  }
                }}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  handleChange({ target: { name: "guestCount", value: digitsOnly } });
                }}
                className={errors?.guestCount ? "error" : ""}
              />
            )}
          </div>

          {/* Minimum capacity warning */}
          {minCapacity > 0 && Number(formData.guestCount) < minCapacity && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
              ⚠️ Minimum {minCapacity} guests required for this package.
            </div>
          )}

          {/* NEW: Hard ceiling exceeded — BLOCK message.
              Shown when pax exceeds base + maxExtraGuests ceiling. */}
          {isAboveCeiling && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
              {baseCapacity > 0 && (selectedPackageObj?.maxExtraGuests ?? 0) === 0
                ? `⛔ Maximum ${totalMaxCapacity} pax allowed. No additional guests permitted for this package.`
                : `⛔ Maximum ${totalMaxCapacity} pax allowed (Base: ${baseCapacity} + Extra: ${selectedPackageObj?.maxExtraGuests ?? 0})`
              }
            </div>
          )}

          {/* NEW: Extra charge info message — shown when above base but within ceiling.
              WHAT: Lets the customer know they'll be charged per extra guest.
              WHY:  This is helpful UX — they learn about the fee before they confirm.
              HOW:  willHaveExtraCharge is true only when:
                      guestCount > baseCapacity  AND  guestCount <= totalMaxCapacity */}
          {willHaveExtraCharge && (
            <div style={{ color: "#f59e0b", fontSize: "12px", marginTop: "4px" }}>
              ℹ️ Guests above {baseCapacity} pax will be charged ₱
              {(selectedPackageObj?.extraGuestFee ?? 150).toLocaleString()} per person.
            </div>
          )}

          {/* Info message for packages with a required minimum */}
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