// frontend/src/config/packageData.js
export const oasisPackages = {
  'Oasis 1': {
    name: 'Oasis 1',
    packages: {
      'Package 1': {
        name: 'Package 1',
        image: '/images/packages/oasis1/package-1.jpg',
        description: 'Cottage Only (No Room)',
        baseCapacity: 20,  // Good for 20 pax
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Free WiFi',
          'Portable griller',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 5999, weekend: 6400 },
          'Night': { weekday: 6400, weekend: 6800 },
          '22hrs': null
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      },
      'Package 2': {
        name: 'Package 2',
        image: '/images/packages/oasis1/package-2.jpg',
        description: '1 AC Room (Superior - 2-4 pax)',
        baseCapacity: 20,  // Good for 20 pax (changed from 4)
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Air Conditioned Superior room (2-4 sleeping capacity)',
          'Smart TV with Netflix',
          'Free WiFi',
          'Portable griller',
          'Cooler',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 9000, weekend: 9500 },
          'Night': { weekday: 10000, weekend: 10500 },
          '22hrs': { weekday: 15000, weekend: 16000 }
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      },
      'Package 3': {
        name: 'Package 3',
        image: '/images/packages/oasis1/package-3.jpg',
        description: '1 AC Room (Family - 8-12 pax)',
        baseCapacity: 20,  // Good for 20 pax (changed from 12)
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Air Conditioned Family room (8-12 sleeping capacity)',
          'Smart TV with Netflix',
          'Fridge',
          'Free WiFi',
          'Portable griller',
          'Cooler',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 9500, weekend: 10000 },
          'Night': { weekday: 10500, weekend: 11000 },
          '22hrs': { weekday: 16000, weekend: 17000 }
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      },
      'Package 4': {
        name: 'Package 4',
        image: '/images/packages/oasis1/package-4.jpg',
        description: '2 AC Rooms (Family + Superior - 12-15 pax)',
        baseCapacity: 20,  // Good for 20 pax (changed from 15)
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Air Conditioned Family room & Superior room (12-15 sleeping capacity)',
          'Smart TV with Netflix',
          'Fridge',
          'Free WiFi',
          'Portable griller',
          'Cooler',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 10000, weekend: 10500 },
          'Night': { weekday: 11000, weekend: 11500 },
          '22hrs': { weekday: 17000, weekend: 18000 }
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      },
      'Package 5': {
        name: 'Package 5',
        image: '/images/packages/oasis1/package-5.jpg',
        description: '4 AC Rooms (2 Family + 2 Superior - 22-25 pax)',
        baseCapacity: 20,  // Good for 20 pax (changed from 25)
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Two Air Conditioned Family rooms & Two Superior rooms (22-25 sleeping capacity)',
          'Smart TV with Netflix',
          'Fridge',
          'Free WiFi',
          'Portable griller',
          'Cooler',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 14200, weekend: 15600 },
          'Night': { weekday: 14600, weekend: 16000 },
          '22hrs': { weekday: 19400, weekend: 21200 }
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      },
      'Package 5+': {
        name: 'Package 5+',
        image: '/images/packages/oasis1/package-5plus.jpg',
        description: '4 AC Rooms + Extra Space (30-100 pax)',
        baseCapacity: 30,  // Good for 30-100 pax (kept as is)
        maxCapacity: 100,
        inclusions: [
          'Swimming pool with bubble jacuzzi and fountain',
          'Cottage (Gazebo) and kubo cottage near parking area',
          'Two Air Conditioned Family rooms & Two Superior rooms',
          'Smart TV with Netflix',
          'Fridge',
          'Free WiFi',
          'Portable griller',
          'Cooler',
          'All outside amenities'
        ],
        pricing: {
          'Day': { weekday: 17000, weekend: 20000 },
          'Night': { weekday: 18000, weekend: 21000 },
          '22hrs': { weekday: 25000, weekend: 30000 }
        },
        addons: ['Karaoke (₱700)', 'Stove 10hrs (₱200)', 'Stove 22hrs (₱400)']
      }
    }
  },
  'Oasis 2': {
    name: 'Oasis 2',
    packages: {
      'Package A': {
        name: 'Package A',
        image: '/images/packages/oasis2/package-a.jpg',
        description: 'Pool & Open Spaces Only',
        baseCapacity: 30,  // Good for 30 pax
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Pool and all open spaces',
          'Free WiFi access',
          'Griller'
        ],
        pricing: {
          'Day': { weekday: 7500, weekend: 10000 },
          'Night': { weekday: 8500, weekend: 11000 },
          '22hrs': null
        },
        addons: ['Karaoke (₱700)', 'Stove (₱300)']
      },
      'Package B': {
        name: 'Package B',
        image: '/images/packages/oasis2/package-b.jpg',
        description: '1 AC Family Room',
        baseCapacity: 30,  // Good for 30 pax
        maxCapacity: 100,   // Can accept extra guests up to 100
        inclusions: [
          'Pool and all open spaces',
          'Free WiFi access',
          'Air-conditioned Family room with ref',
          'Smart TV with Netflix',
          'Griller'
        ],
        pricing: {
          'Day': { weekday: 9000, weekend: 12000 },
          'Night': { weekday: 10000, weekend: 12500 },
          '22hrs': { weekday: 16500, weekend: 20000 }
        },
        addons: ['Karaoke (₱700)', 'Stove (₱300)']
      },
      'Package C': {
        name: 'Package C',
        image: '/images/packages/oasis2/package-c.jpg',
        description: 'Ideal for Events (50-100 pax)',
        baseCapacity: 50,  // Good for 50-100 pax (kept as is)
        maxCapacity: 100,
        inclusions: [
          'Pool and all open spaces',
          'Free WiFi access',
          'Air-conditioned Family room with ref',
          'Smart TV with Netflix',
          'Griller'
        ],
        pricing: {
          '50pax': {
            'Day': { weekday: 19000, weekend: 19000 },
            'Night': { weekday: 20000, weekend: 20000 },
            '22hrs': { weekday: 26000, weekend: 26000 }
          },
          '100pax': {
            'Day': { weekday: 20000, weekend: 20000 },
            'Night': { weekday: 21000, weekend: 21000 },
            '22hrs': { weekday: 30000, weekend: 30000 }
          }
        },
        addons: ['Karaoke (₱700)', 'Stove (₱300)']
      }
    }
  }
};

// Helper function to extract price from addon string
export const getAddonPrice = (addonString) => {
  const match = addonString.match(/₱(\d+,?\d*)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  return 0;
};

// Helper function to get base package price
export const getPackagePrice = (oasis, packageName, session, date, pax = null) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  if (!packageData) return 0;
  
  const checkDate = new Date(date);
  const isWeekend = checkDate.getDay() === 5 || checkDate.getDay() === 6 || checkDate.getDay() === 0;
  const dayType = isWeekend ? 'weekend' : 'weekday';
  
  // Handle Package C special pricing
  if (packageName === 'Package C') {
    const paxKey = pax <= 50 ? '50pax' : '100pax';
    return packageData.pricing[paxKey]?.[session]?.[dayType] || 0;
  }
  
  // Handle null sessions (like 22hrs for Package 1 and Package A)
  const sessionPricing = packageData.pricing[session];
  if (!sessionPricing) return 0;
  
  return sessionPricing[dayType] || 0;
};

// Calculate total price with extra guests (₱150 per person over base capacity)
export const getTotalPriceWithExtras = (oasis, packageName, session, date, guestCount, selectedAddons = {}) => {
  // Get base package price
  const basePrice = getPackagePrice(oasis, packageName, session, date, guestCount);
  if (basePrice === 0) return 0;
  
  // Get package capacity
  const packageData = oasisPackages[oasis]?.packages[packageName];
  if (!packageData) return basePrice;
  
  const baseCapacity = packageData.baseCapacity;
  const extraGuestCharge = 150; // ₱150 per extra guest
  
  // Calculate extra guest charges
  let extraGuestTotal = 0;
  if (guestCount > baseCapacity) {
    const extraGuests = guestCount - baseCapacity;
    extraGuestTotal = extraGuests * extraGuestCharge;
  }
  
  // Calculate addons total
  const addonsTotal = Object.values(selectedAddons).reduce((sum, price) => sum + price, 0);
  
  // Return total (base price + extra guests + addons)
  return basePrice + extraGuestTotal + addonsTotal;
};

// Helper to check if session is available for package
export const isSessionAvailable = (oasis, packageName, session) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  if (!packageData) return false;
  
  const sessionPricing = packageData.pricing[session];
  return sessionPricing !== null && sessionPricing !== undefined;
};

// Get available sessions for package
export const getAvailableSessions = (oasis, packageName) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  if (!packageData) return [];
  
  const sessions = [];
  if (isSessionAvailable(oasis, packageName, 'Day')) sessions.push('Day');
  if (isSessionAvailable(oasis, packageName, 'Night')) sessions.push('Night');
  if (isSessionAvailable(oasis, packageName, '22hrs')) sessions.push('22hrs');
  
  return sessions;
};

// Get downpayment amount based on session
export const getDownpayment = (session, totalPrice = null) => {
  // For Night or 22hrs sessions, downpayment is ₱5,000
  if (session === 'Night' || session === '22hrs') return 5000;
  // For Day sessions, downpayment is ₱3,000
  return 3000;
};

// Get full payment amount (returns the total price)
export const getFullPayment = (totalPrice) => {
  return totalPrice;
};

// Get max capacity for package (including extra guests)
export const getMaxCapacity = (oasis, packageName) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  return packageData?.maxCapacity || packageData?.baseCapacity || 0;
};

// Get base capacity for package
export const getBaseCapacity = (oasis, packageName) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  return packageData?.baseCapacity || 0;
};

// Get available addons for package
export const getAvailableAddons = (oasis, packageName) => {
  const packageData = oasisPackages[oasis]?.packages[packageName];
  return packageData?.addons || [];
};