// src/constants/packages.js
// ============================================
// PACKAGES - Dynamic packages, add-ons, and sessions from API
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Cache for all data
let dataCache = {
  Oasis1Packages: [],
  Oasis2Packages: [],
  addons: [],
  sessions: [],
  isLoading: false,
  lastFetch: null,
  loadPromise: null
};

// Fetch add-ons from API (public)
export const fetchAddons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/addons/active`);
    if (!response.ok) throw new Error('Failed to fetch add-ons');
    const data = await response.json();
    dataCache.addons = data;
    return data;
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return dataCache.addons;
  }
};

// Fetch sessions from API (public)
export const fetchSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/sessions`);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    const data = await response.json();
    dataCache.sessions = data;
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return dataCache.sessions;
  }
};

// Transform API package data - FIXED to use minCapacity and maxCapacity
const transformPackageData = (apiPackage) => {
  const pricing = {};
  
  if (apiPackage.pricing) {
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
      // Regular packages - keep the pricing structure as is
      for (const [session, prices] of Object.entries(apiPackage.pricing)) {
        pricing[session] = prices;
      }
    }
  }
  
  // 🔴 FIXED: Use minCapacity and maxCapacity, not baseCapacity
  const hasMinCapacity = apiPackage.minCapacity && apiPackage.minCapacity > 0;
  
  return {
    id: apiPackage._id,
    name: apiPackage.name,
    image: apiPackage.image || `/images/packages/${apiPackage.oasis === 'Oasis 1' ? 'oasis1' : 'oasis2'}/${apiPackage.name.toLowerCase().replace(/ /g, '-')}.jpg`,
    subtitle: apiPackage.description?.substring(0, 50) || apiPackage.name,
    capacity: hasMinCapacity 
      ? `${apiPackage.minCapacity} - ${apiPackage.maxCapacity} pax`
      : `Up to ${apiPackage.maxCapacity} pax`,
    minCapacity: apiPackage.minCapacity || 0,
    maxCapacity: apiPackage.maxCapacity,
    inclusions: apiPackage.inclusions || [],
    addons: [],
    sessions: apiPackage.availableSessions || ['Day', 'Night'],
    pricing: pricing,
    isActive: apiPackage.isActive
  };
};

// Fetch all packages from API using PUBLIC endpoint
export const fetchAllPackages = async () => {
  // If already loading, return the existing promise
  if (dataCache.loadPromise) {
    return dataCache.loadPromise;
  }
  
  // If we have cached data less than 5 minutes old, use it
  if (dataCache.lastFetch && (Date.now() - dataCache.lastFetch < 300000) && dataCache.Oasis1Packages.length > 0) {
    return dataCache;
  }
  
  dataCache.isLoading = true;
  
  dataCache.loadPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/packages/public`);
      
      if (!response.ok) {
        console.warn('Failed to fetch packages, using empty array');
        dataCache.Oasis1Packages = [];
        dataCache.Oasis2Packages = [];
        return dataCache;
      }
      
      const data = await response.json();
      
      const oasis1Packages = data
        .filter(pkg => pkg.oasis === 'Oasis 1' && pkg.isActive === true)
        .map(pkg => transformPackageData(pkg));
      
      const oasis2Packages = data
        .filter(pkg => pkg.oasis === 'Oasis 2' && pkg.isActive === true)
        .map(pkg => transformPackageData(pkg));
      
      dataCache.Oasis1Packages = oasis1Packages;
      dataCache.Oasis2Packages = oasis2Packages;
      dataCache.lastFetch = Date.now();
      
      console.log('✅ Packages loaded:', { oasis1: oasis1Packages.length, oasis2: oasis2Packages.length });
      
      return dataCache;
    } catch (error) {
      console.error('Error fetching packages:', error);
      dataCache.Oasis1Packages = [];
      dataCache.Oasis2Packages = [];
      return dataCache;
    } finally {
      dataCache.isLoading = false;
      dataCache.loadPromise = null;
    }
  })();
  
  return dataCache.loadPromise;
};

// Force clear cache and refresh (called after admin updates)
export const refreshAllData = async () => {
  // Clear cache
  dataCache.lastFetch = null;
  dataCache.Oasis1Packages = [];
  dataCache.Oasis2Packages = [];
  dataCache.loadPromise = null;
  
  // Refetch all data
  await fetchAddons();
  await fetchSessions();
  await fetchAllPackages();
  
  // Update exported arrays
  OASIS1_PACKAGES = dataCache.Oasis1Packages;
  OASIS2_PACKAGES = dataCache.Oasis2Packages;
  ADDONS = dataCache.addons;
  SESSIONS = dataCache.sessions;
  
  return {
    OASIS1_PACKAGES,
    OASIS2_PACKAGES,
    ADDONS,
    SESSIONS
  };
};

// Export getters that return the current cached data
export const getOasis1Packages = () => dataCache.Oasis1Packages || [];
export const getOasis2Packages = () => dataCache.Oasis2Packages || [];
export const getAddons = () => dataCache.addons || [];
export const getSessions = () => dataCache.sessions || [];

// Default exports - will be populated after refresh
export let OASIS1_PACKAGES = [];
export let OASIS2_PACKAGES = [];
export let ADDONS = [];
export let SESSIONS = [];

// Auto-initialize and update exports
refreshAllData().then(result => {
  OASIS1_PACKAGES = result.OASIS1_PACKAGES;
  OASIS2_PACKAGES = result.OASIS2_PACKAGES;
  ADDONS = result.ADDONS;
  SESSIONS = result.SESSIONS;
});

export const PAYMENT_METHODS = ["GCash", "Maya", "GoTyme", "SeaBank", "Cash"];

export const BOOKING_RULES = [
  { title: "Downpayment", desc: "₱3,000 for Day/Night · ₱5,000 for 22-hour packages (non-refundable)" },
  { title: "Incidental Fee", desc: "₱1,000 collected before check-in, refundable upon checkout" },
  { title: "Extra Person", desc: "₱150 per person beyond the package capacity" },
  { title: "Check-in / Check-out", desc: "Check-in: 8:00 AM · Check-out: 6:00 PM" },
  { title: "Rescheduling", desc: "Allowed at least 1 week before booking date" },
  { title: "Valid ID Required", desc: "Present 1 valid government-issued ID upon arrival" },
];