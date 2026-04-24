// backend/scripts/seedPackages.js
// ============================================
// SEED PACKAGES, ADD-ONS & SESSIONS
// Run with: node backend/scripts/seedPackages.js
// ============================================

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Import models
const Package = require('../models/Package');
const AddOn = require('../models/AddOn');
const Session = require('../models/Session');

// ============================================
// SESSIONS DATA
// ============================================
const sessionsData = [
  {
    name: 'Day',
    displayName: 'Day Session',
    startTime: '08:00',
    endTime: '17:00',
    description: '8:00 AM - 5:00 PM',
    downpaymentAmount: 3000,
    isActive: true
  },
  {
    name: 'Night',
    displayName: 'Night Session',
    startTime: '20:00',
    endTime: '06:00',
    description: '8:00 PM - 6:00 AM',
    downpaymentAmount: 3000,
    isActive: true
  },
  {
    name: '22hrs',
    displayName: '22-Hour Session',
    startTime: '08:00',
    endTime: '06:00',
    description: 'Fixed 22-hour schedule',
    downpaymentAmount: 5000,
    isActive: true
  }
];

// ============================================
// ADD-ONS DATA
// ============================================
const addonsData = [
  {
    name: 'Karaoke',
    description: 'Karaoke machine rental',
    price: 700,
    availableForSessions: ['All'],
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Stove (10 hours)',
    description: 'Stove rental for 10 hours',
    price: 200,
    availableForSessions: ['All'],
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Stove (22 hours)',
    description: 'Stove rental for 22 hours',
    price: 400,
    availableForSessions: ['All'],
    isActive: true,
    displayOrder: 3
  }
];

// ============================================
// PACKAGES DATA
// ============================================
const packagesData = [
  // ========== OASIS 1 PACKAGES ==========
  {
    oasis: 'Oasis 1',
    name: 'Package 1',
    description: 'Cottage Only (No Room)',
    baseCapacity: 20,
    maxCapacity: 200,
    inclusions: [
      'Swimming pool with bubble jacuzzi and fountain',
      'Cottage (Gazebo) and kubo cottage near parking area',
      'Free WiFi',
      'Portable griller',
      'All outside amenities'
    ],
    pricing: {
      'Day': { weekday: 5999, weekend: 6400 },
      'Night': { weekday: 6400, weekend: 6800 }
    },
    availableSessions: ['Day', 'Night'],
    displayOrder: 1,
    isActive: true
  },
  {
    oasis: 'Oasis 1',
    name: 'Package 2',
    description: '1 AC Room (Superior - 2-4 pax)',
    baseCapacity: 20,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 2,
    isActive: true
  },
  {
    oasis: 'Oasis 1',
    name: 'Package 3',
    description: '1 AC Room (Family - 8-12 pax)',
    baseCapacity: 20,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 3,
    isActive: true
  },
  {
    oasis: 'Oasis 1',
    name: 'Package 4',
    description: '2 AC Rooms (Family + Superior - 12-15 pax)',
    baseCapacity: 20,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 4,
    isActive: true
  },
  {
    oasis: 'Oasis 1',
    name: 'Package 5',
    description: '4 AC Rooms (2 Family + 2 Superior - 22-25 pax)',
    baseCapacity: 20,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 5,
    isActive: true
  },
  {
    oasis: 'Oasis 1',
    name: 'Package 5+',
    description: '4 AC Rooms + Extra Space (30-100 pax)',
    baseCapacity: 30,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 6,
    isActive: true
  },

  // ========== OASIS 2 PACKAGES ==========
  {
    oasis: 'Oasis 2',
    name: 'Package A',
    description: 'Pool & Open Spaces Only',
    baseCapacity: 30,
    maxCapacity: 200,
    inclusions: [
      'Pool and all open spaces',
      'Free WiFi access',
      'Griller'
    ],
    pricing: {
      'Day': { weekday: 7500, weekend: 10000 },
      'Night': { weekday: 8500, weekend: 11000 }
    },
    availableSessions: ['Day', 'Night'],
    displayOrder: 1,
    isActive: true
  },
  {
    oasis: 'Oasis 2',
    name: 'Package B',
    description: '1 AC Family Room',
    baseCapacity: 30,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 2,
    isActive: true
  },
  {
    oasis: 'Oasis 2',
    name: 'Package C',
    description: 'Ideal for Events (50-100 pax)',
    baseCapacity: 50,
    maxCapacity: 200,
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
    availableSessions: ['Day', 'Night', '22hrs'],
    displayOrder: 3,
    isActive: true
  }
];

// ============================================
// SEED FUNCTION
// ============================================
async function seed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://poolUser:poolUser123@poolcluster.brghuqk.mongodb.net/bluesense?appName=PoolCluster';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Package.deleteMany({});
    await AddOn.deleteMany({});
    await Session.deleteMany({});
    console.log('✅ Cleared existing data');

    // Seed sessions
    await Session.insertMany(sessionsData);
    console.log(`✅ Seeded ${sessionsData.length} sessions`);

    // Seed add-ons
    await AddOn.insertMany(addonsData);
    console.log(`✅ Seeded ${addonsData.length} add-ons`);

    // Seed packages
    await Package.insertMany(packagesData);
    console.log(`✅ Seeded ${packagesData.length} packages`);

    console.log('\n🎉 ALL DATA SEEDED SUCCESSFULLY! 🎉');
    console.log('\nSummary:');
    console.log(`   - Sessions: ${sessionsData.length}`);
    console.log(`   - Add-ons: ${addonsData.length}`);
    console.log(`   - Packages: ${packagesData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();