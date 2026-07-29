// frontend/src/config/packageData.js
// ============================================
// PACKAGE DATA HELPERS — NO HARDCODED PRICES
// All prices and capacities come from the API via the
// package object (transformed by transformPackageData in constants/packages.js).
//
// Functions here accept a `packageObj` (the API-fetched package) instead of
// looking up a hardcoded table, so admin edits are reflected immediately.
// ============================================

// ============================================
// PRICING HELPERS (API-driven)
// ============================================

/**
 * Get the base package price from an API package object.
 * @param {object} packageObj - transformed package from API (has .pricing, .name)
 * @param {string} session     - "Day" | "Night" | "22hrs"
 * @param {string|Date} date   - reservation date (to determine weekday/weekend)
 * @param {number} pax         - guest count (only matters for Package C)
 * @returns {number}
 */
export const getPriceFromPackage = (packageObj, session, date, pax = 1) => {
  if (!packageObj || !session || !date) return 0;

  const pricing = packageObj.pricing;
  if (!pricing) return 0;

  const d = new Date(date);
  // Friday=5, Saturday=6, Sunday=0 are weekend; Mon–Thu are weekday
  const isWeekend = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
  const dayType = isWeekend ? 'weekend' : 'weekday';

  // Package C uses pax-based tiers.
  // After transformPackageData, shape is: { "50pax": { Day: 19000, Night: 20000, "22hrs": 26000 } }
  // Values are plain numbers (no nested weekday/weekend) — Package C has a single flat rate.
  if (packageObj.name === 'Package C') {
    const minCap = packageObj.minCapacity || 50;
    const maxCap = packageObj.maxCapacity || 100;
    const tier   = pax <= minCap ? `${minCap}pax` : `${maxCap}pax`;
    const tierPricing = pricing[tier];
    if (!tierPricing) return 0;

    const val = tierPricing[session];
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;               // flat number (actual shape)
    if (typeof val === 'object') return val[dayType] || val.weekday || 0; // nested (legacy)
    return 0;
  }

  // Regular packages: pricing[session] is normally { weekday, weekend }
  // but packages stored before the schema change may be a flat number.
  // Handle both so ALL packages — Oasis 1 and Oasis 2 — display correctly.
  const sessionPricing = pricing[session];
  if (sessionPricing === null || sessionPricing === undefined) return 0;

  // Flat number (e.g. { "Day": 7500 }) — same rate regardless of day type
  if (typeof sessionPricing === 'number') return sessionPricing;

  // Nested object (e.g. { weekday: 7500, weekend: 8500 })
  return sessionPricing[dayType] || sessionPricing.weekday || 0;
};

/**
 * Calculate extra-guest charge from an API package object.
 *
 * WHAT: Returns the total extra fee for guests beyond the base capacity.
 * WHY:  The fee rate is read from packageObj.extraGuestFee (per-package)
 *       rather than a hardcoded constant, so admin changes take effect immediately.
 * HOW:  (guestCount - included) × feePerPerson
 *
 * @param {object} packageObj  - API-fetched package (.maxCapacity, .extraGuestFee)
 * @param {number} guestCount  - total number of guests the customer entered
 * @returns {number}           - total extra charge in pesos (0 if within base capacity)
 */
export const getExtraGuestCharge = (packageObj, guestCount) => {
  if (!packageObj) return 0;

  // WHAT: Guests up to maxCapacity are included in the package price.
  const included = packageObj.maxCapacity || 0;

  // WHAT: No extra charge if guest count is within the included limit.
  if (guestCount <= included) return 0;

  // WHAT: Read the per-person fee from the package (set by admin).
  // HOW:  ?? 150 uses 150 only if extraGuestFee is null or undefined.
  //       It won't replace a valid value of 0 (unlike ||).
  const feePerPerson = packageObj.extraGuestFee ?? 150;

  // WHAT: Total = number of extra guests × fee per person.
  return (guestCount - included) * feePerPerson;
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW HELPER: getTotalMaxCapacity
// ─────────────────────────────────────────────────────────────────────────────
// WHAT: Returns the absolute maximum number of guests allowed for a booking.
//       This is the hard ceiling that blocks any booking above it.
//
//       ceiling = maxCapacity + maxExtraGuests
//
//       Example: maxCapacity=20, maxExtraGuests=10 → ceiling=30.
//       A booking of 31 pax will be blocked.
//
// WHY:  With maxExtraGuests now on the package, both GuestInfoStep.jsx (frontend
//       validation) and bookingController.js (backend validation) need to compute
//       this ceiling. This single helper keeps the logic in one place.
//
// HOW:  Returns Infinity when maxExtraGuests is null (admin set no cap), so the
//       caller can do `pax > getTotalMaxCapacity(pkg)` without a null-check branch.
//       Uses ?? null (nullish coalescing) so a maxExtraGuests of 0 (zero extras
//       allowed) is treated as 0, NOT as "no cap".
//
// @param {object} packageObj - API-fetched package object
// @returns {number}          - absolute max guests, or Infinity if no cap is set
// ─────────────────────────────────────────────────────────────────────────────
export const getTotalMaxCapacity = (packageObj) => {
  if (!packageObj) return Infinity;

  const base = packageObj.maxCapacity || 0;

  // WHAT: Check if admin has set a cap on extra guests.
  // HOW:  maxExtraGuests is null when the admin left the field blank (= no cap).
  //       We MUST use ?? null here, not || null, because 0 is a valid value
  //       meaning "zero extra guests allowed" — || would wrongly treat 0 as null.
  const maxExtra = packageObj.maxExtraGuests ?? null;

  // WHAT: No cap set → return Infinity so any pax count passes the ceiling check.
  if (maxExtra === null) return Infinity;

  // WHAT: Ceiling = base capacity + allowed extra guests.
  return base + maxExtra;
};

/**
 * Returns a full breakdown object for capacity fee display in BookingSummary.
 *
 * WHAT: Returns extraGuestCount, extraGuestCharge, isOverCapacity, feePerPerson,
 *       AND totalMaxCapacity so callers have everything they need in one call.
 * WHY:  BookingSummary.jsx needs the count and rate separately to display
 *       "₱150 × 5 extra pax = ₱750". It also needs totalMaxCapacity to show
 *       the "max X pax" label when a cap is set.
 *
 * @param {object} packageObj  - API-fetched package
 * @param {number} guestCount  - total guests entered by customer
 * @returns {{ extraGuestCount, extraGuestCharge, isOverCapacity, feePerPerson, totalMaxCapacity }}
 */
export const getCapacityFeeInfo = (packageObj, guestCount) => {
  const included = packageObj?.maxCapacity || 0;
  const extraGuestCount = Math.max(0, (guestCount || 0) - included);

  // WHAT: Same fee lookup as getExtraGuestCharge — must stay consistent.
  const feePerPerson = packageObj?.extraGuestFee ?? 150;

  // NEW: Also compute the absolute ceiling so BookingSummary can display it.
  // WHY:  Having it here means callers don't need a separate import of
  //       getTotalMaxCapacity — one call returns everything.
  const totalMaxCapacity = getTotalMaxCapacity(packageObj);

  return {
    extraGuestCount,
    extraGuestCharge: extraGuestCount * feePerPerson,
    isOverCapacity: extraGuestCount > 0,
    feePerPerson,
    // NEW: ceiling value — Infinity when no cap, or base + maxExtraGuests when set.
    totalMaxCapacity,
  };
};

/**
 * Get downpayment for a session.
 * Prefers admin-configured value from sessionData; falls back to standard rules.
 */
export const getDownpaymentAmount = (session, sessionDataFromDB = []) => {
  if (sessionDataFromDB.length > 0) {
    const match = sessionDataFromDB.find((s) => s.name === session);
    if (match?.downpaymentAmount) return match.downpaymentAmount;
  }
  return session === '22hrs' ? 5000 : 3000;
};

// ============================================
// CAPACITY HELPERS (API-driven)
// ============================================

export const getMaxCapacityFromPackage = (packageObj) =>
  packageObj?.maxCapacity || 100;

export const getMinCapacityFromPackage = (packageObj) =>
  packageObj?.minCapacity || 0;

// ============================================
// SESSION AVAILABILITY (API-driven)
// ============================================

export const getAvailableSessionsFromPackage = (packageObj) =>
  packageObj?.sessions || packageObj?.availableSessions || [];

// ============================================
// LEGACY EXPORTS — kept so any file that still imports from
// packageData.js doesn't crash, but they no longer contain prices.
// Booking.jsx and BookingSummary.jsx have been updated to use the
// API-driven helpers above instead of these.
// ============================================

export const oasisPackages = {
  'Oasis 1': { name: 'Oasis 1', packages: {} },
  'Oasis 2': { name: 'Oasis 2', packages: {} },
};

export const getPackagePrice    = () => 0;
export const getMaxCapacity     = () => 0;
export const getBaseCapacity    = () => 0;
export const getAvailableAddons = () => [];
export const isSessionAvailable = () => false;
export const getAvailableSessions = () => [];
export const getTotalPriceWithExtras = () => 0;
export const getAddonPrice = (addonString) => {
  const match = addonString?.match(/₱(\d+,?\d*)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
};
export const getDownpayment = (session) =>
  session === '22hrs' ? 5000 : 3000;