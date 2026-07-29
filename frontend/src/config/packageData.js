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
// getTotalMaxCapacity
// Returns base + maxExtraGuests. Always a finite number.
// maxExtraGuests defaults to 0 (no extra guests), never null.
export const getTotalMaxCapacity = (packageObj) => {
  if (!packageObj) return 0;
  const base = packageObj.maxCapacity || 0;
  const maxExtra = packageObj.maxExtraGuests ?? 0;
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
    // ceiling = base + maxExtraGuests (always a finite number)
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