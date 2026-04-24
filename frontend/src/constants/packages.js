// src/constants/packages.js
// ============================================
// PACKAGES - Dynamic packages, add-ons, and sessions from API
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Cache for all data
let dataCache = {
  Oasis1Packages: null,
  Oasis2Packages: null,
  addons: null,
  sessions: null,
  lastFetch: null
};

// Fetch add-ons from API
export const fetchAddons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/addons/active`);
    if (!response.ok) throw new Error('Failed to fetch add-ons');
    const data = await response.json();
    dataCache.addons = data;
    return data;
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return dataCache.addons || [];
  }
};

// Fetch sessions from API
export const fetchSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/sessions`);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    const data = await response.json();
    dataCache.sessions = data;
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return dataCache.sessions || [];
  }
};

// Fetch all packages from API
export const fetchAllPackages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/packages`);
    if (!response.ok) throw new Error('Failed to fetch packages');
    const data = await response.json();
    
    // Transform API data to match existing package structure
    const oasis1Packages = data
      .filter(pkg => pkg.oasis === 'Oasis 1' && pkg.isActive)
      .map((pkg, index) => transformPackageData(pkg, index));
    
    const oasis2Packages = data
      .filter(pkg => pkg.oasis === 'Oasis 2' && pkg.isActive)
      .map((pkg, index) => transformPackageData(pkg, index));
    
    dataCache.Oasis1Packages = oasis1Packages;
    dataCache.Oasis2Packages = oasis2Packages;
    dataCache.lastFetch = Date.now();
    
    // Update the exported arrays
    updateExportedArrays();
    
    return dataCache;
  } catch (error) {
    console.error('Error fetching packages:', error);
    return dataCache;
  }
};

// Transform API package data to match the existing frontend structure
const transformPackageData = (apiPackage, index) => {
  // Build pricing object from API data
  const pricing = {};
  
  if (apiPackage.pricing) {
    // Handle Package C special case (pax-based pricing)
    if (apiPackage.name === 'Package C' && apiPackage.pricing['50pax']) {
      pricing['50pax'] = {
        Day: apiPackage.pricing['50pax'].Day?.weekday || 0,
        Night: apiPackage.pricing['50pax'].Night?.weekday || 0,
        "22hrs": apiPackage.pricing['50pax']["22hrs"]?.weekday || 0
      };
      pricing['100pax'] = {
        Day: apiPackage.pricing['100pax'].Day?.weekday || 0,
        Night: apiPackage.pricing['100pax'].Night?.weekday || 0,
        "22hrs": apiPackage.pricing['100pax']["22hrs"]?.weekday || 0
      };
    } else {
      // Regular packages
      pricing.weekday = {};
      pricing.weekend = {};
      
      apiPackage.availableSessions?.forEach(session => {
        pricing.weekday[session] = apiPackage.pricing[session]?.weekday || 0;
        pricing.weekend[session] = apiPackage.pricing[session]?.weekend || 0;
      });
    }
  }
  
  return {
    id: apiPackage._id,
    name: apiPackage.name,
    image: `/images/packages/${apiPackage.oasis === 'Oasis 1' ? 'oasis1' : 'oasis2'}/${apiPackage.name.toLowerCase().replace(/ /g, '-')}.jpg`,
    subtitle: apiPackage.description?.substring(0, 50) || apiPackage.name,
    capacity: `${apiPackage.baseCapacity} - ${apiPackage.maxCapacity} pax`,
    inclusions: apiPackage.inclusions || [],
    addons: [], // Will be populated from fetched add-ons
    sessions: apiPackage.availableSessions || ['Day', 'Night'],
    pricing: pricing,
    baseCapacity: apiPackage.baseCapacity,
    maxCapacity: apiPackage.maxCapacity
  };
};

// Update the exported arrays
let OASIS1_PACKAGES_EXPORT = [];
let OASIS2_PACKAGES_EXPORT = [];
let ADDONS_EXPORT = [];
let SESSIONS_EXPORT = [];

const updateExportedArrays = () => {
  OASIS1_PACKAGES_EXPORT = dataCache.Oasis1Packages || [];
  OASIS2_PACKAGES_EXPORT = dataCache.Oasis2Packages || [];
  ADDONS_EXPORT = dataCache.addons || [];
  SESSIONS_EXPORT = dataCache.sessions || [];
};

// Export getters that return the current cached data
export const getOasis1Packages = () => OASIS1_PACKAGES_EXPORT;
export const getOasis2Packages = () => OASIS2_PACKAGES_EXPORT;
export const getAddons = () => ADDONS_EXPORT;
export const getSessions = () => SESSIONS_EXPORT;

// Default exports for backward compatibility (will be populated async)
export let OASIS1_PACKAGES = [];
export let OASIS2_PACKAGES = [];
export let ADDONS = [];
export let SESSIONS = [];

// Initialize: fetch all data
export const refreshAllData = async () => {
  await Promise.all([
    fetchAddons(),
    fetchSessions(),
    fetchAllPackages()
  ]);
  
  OASIS1_PACKAGES = OASIS1_PACKAGES_EXPORT;
  OASIS2_PACKAGES = OASIS2_PACKAGES_EXPORT;
  ADDONS = ADDONS_EXPORT;
  SESSIONS = SESSIONS_EXPORT;
  
  return { OASIS1_PACKAGES, OASIS2_PACKAGES, ADDONS, SESSIONS };
};

// Initialize on import
refreshAllData();

// Payment methods
export const PAYMENT_METHODS = ["GCash", "Maya", "GoTyme", "SeaBank", "Cash"];

// Booking rules (can also be made dynamic if needed)
export const BOOKING_RULES = [
  { title: "Downpayment", desc: "₱3,000 for Day/Night · ₱5,000 for 22-hour packages (non-refundable)" },
  { title: "Incidental Fee", desc: "₱1,000 collected before check-in, refundable upon checkout" },
  { title: "Extra Person", desc: "₱150 per person beyond the package capacity" },
  { title: "Check-in / Check-out", desc: "Check-in: 8:00 AM · Check-out: 6:00 PM" },
  { title: "Rescheduling", desc: "Allowed at least 1 week before booking date" },
  { title: "Valid ID Required", desc: "Present 1 valid government-issued ID upon arrival" },
];