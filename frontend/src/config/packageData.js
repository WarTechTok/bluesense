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
 * WHY:  The fee rate used to be hardcoded as 150. Now we read it from
 *       packageObj.extraGuestFee so that any admin change in Package
 *       Management takes effect immediately without a code change.
 * HOW:  (guestCount - included) × feePerPerson
 *
 * @param {object} packageObj  - API-fetched package (must have .maxCapacity, .extraGuestFee)
 * @param {number} guestCount  - total number of guests the customer entered
 * @returns {number}           - total extra charge in pesos (0 if within capacity)
 */
export const getExtraGuestCharge = (packageObj, guestCount) => {
  if (!packageObj) return 0;

  // WHAT: The number of guests whose cost is already included in the base price.
  // WHY:  We only charge for guests ABOVE this — not for everyone.
  // HOW:  Reads maxCapacity from the package object. Falls back to 0 so the
  //       charge only fires when we actually know the capacity limit.
  const included = packageObj.maxCapacity || 0;

  // WHAT: If the guest count is within the included limit, no extra charge.
  if (guestCount <= included) return 0;

  // WHAT: Read the per-person fee from the package object.
  // WHY:  This is the new editable field the admin sets in Package Management.
  //       It lives in the database, not in this file.
  // HOW:  `?? 150` means: use 150 ONLY if extraGuestFee is null or undefined.
  //       This is different from `|| 150` — the `??` operator (nullish coalescing)
  //       won't replace a valid value of 0, while `||` would.
  const feePerPerson = packageObj.extraGuestFee ?? 150;

  // WHAT: The total extra charge = number of extra guests × fee per person.
  // Example: 5 extra guests × ₱200/person = ₱1,000
  return (guestCount - included) * feePerPerson;
};

/**
 * Returns a breakdown object for capacity fee display in BookingSummary.
 *
 * WHAT: Returns extraGuestCount, extraGuestCharge, isOverCapacity, and feePerPerson.
 * WHY:  BookingSummary.jsx needs the count and the rate separately so it can
 *       display "₱200 × 5 extra pax" instead of just "₱1,000".
 * HOW:  Same logic as getExtraGuestCharge but returns structured data.
 *
 * @param {object} packageObj  - API-fetched package
 * @param {number} guestCount  - total guests
 * @returns {{ extraGuestCount, extraGuestCharge, isOverCapacity, feePerPerson }}
 */
export const getCapacityFeeInfo = (packageObj, guestCount) => {
  const included = packageObj?.maxCapacity || 0;
  const extraGuestCount = Math.max(0, (guestCount || 0) - included);

  // WHAT: Read the per-person fee the same way as getExtraGuestCharge.
  // WHY:  Consistency — both helpers must use the exact same fee rate
  //       so the displayed breakdown always matches the calculated total.
  const feePerPerson = packageObj?.extraGuestFee ?? 150;

  return {
    extraGuestCount,
    // WHAT: Total extra fee = count × rate.
    extraGuestCharge: extraGuestCount * feePerPerson,
    isOverCapacity: extraGuestCount > 0,
    // WHAT: Expose feePerPerson so the UI can show "₱200 × 5 pax".
    // WHY:  Without this, the UI would have to duplicate the ?? 150 logic itself.
    feePerPerson,
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

// Empty oasisPackages shell — structure only, no prices, no capacities.
// If any component still references oasisPackages[x].packages[y] it will
// get an empty object back rather than a stale hardcoded price.
export const oasisPackages = {
  'Oasis 1': { name: 'Oasis 1', packages: {} },
  'Oasis 2': { name: 'Oasis 2', packages: {} },
};

// These still work but return 0 (forcing callers to use API-driven helpers).
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