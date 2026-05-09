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

  // Package C uses pax-based tiers
  if (packageObj.name === 'Package C') {
    const minCap = packageObj.minCapacity || 50;
    const maxCap = packageObj.maxCapacity || 100;
    const tier   = pax <= minCap ? `${minCap}pax` : `${maxCap}pax`;
    return pricing[tier]?.[session]?.[dayType]
        || pricing[tier]?.[session]?.weekday
        || 0;
  }

  // Regular packages: pricing[session].weekday / pricing[session].weekend
  const sessionPricing = pricing[session];
  if (!sessionPricing) return 0;
  return sessionPricing[dayType] || sessionPricing.weekday || 0;
};

/**
 * Calculate extra-guest charge from an API package object.
 * ₱150 per guest over the package's base capacity (maxCapacity).
 */
export const getExtraGuestCharge = (packageObj, guestCount) => {
  if (!packageObj) return 0;
  // Use maxCapacity as the "included" ceiling — guests beyond this pay extra
  const included = packageObj.maxCapacity || 0;
  if (guestCount <= included) return 0;
  return (guestCount - included) * 150;
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