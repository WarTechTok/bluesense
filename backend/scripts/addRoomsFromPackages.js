const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

// Room data mapped from packages - PRICE REMOVED (handled at package level)
const roomsToAdd = [
  // OASIS 1 - Package 2
  {
    name: 'Oasis 1 - Superior Room',
    capacity: 4,
    description: '1 AC Room (Superior - 2-4 pax)',
    oasis: 'Oasis 1',
    packageName: 'Package 2',
    image: '/images/packages/oasis1/package-2.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Free WiFi',
      'Portable Griller',
      'All Outside Amenities',
      'Pillows - 2',
      'Bed - 1',
      'Remote - 1'
    ],
    status: 'Available'
  },
  // OASIS 1 - Package 3
  {
    name: 'Oasis 1 - Family Room',
    capacity: 12,
    description: '1 AC Room (Family - 8-12 pax)',
    oasis: 'Oasis 1',
    packageName: 'Package 3',
    image: '/images/packages/oasis1/package-3.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Fridge',
      'Free WiFi',
      'Portable Griller',
      'Cooler',
      'All Outside Amenities',
      'Pillows - 4',
      'Bed - 4',
      'Remote - 1'
    ],
    status: 'Available'
  },
  // OASIS 1 - Package 4
  {
    name: 'Oasis 1 - Family + Superior Rooms',
    capacity: 15,
    description: '2 AC Rooms (Family + Superior - 12-15 pax)',
    oasis: 'Oasis 1',
    packageName: 'Package 4',
    image: '/images/packages/oasis1/package-4.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Fridge',
      'Free WiFi',
      'Portable Griller',
      'Cooler',
      'All Outside Amenities',
      'Pillows - 6',
      'Bed - 5',
      'Remote - 1'
    ],
    status: 'Available'
  },
  // OASIS 1 - Package 5
  {
    name: 'Oasis 1 - Four Rooms (2 Family + 2 Superior)',
    capacity: 25,
    description: '4 AC Rooms (2 Family + 2 Superior - 22-25 pax)',
    oasis: 'Oasis 1',
    packageName: 'Package 5',
    image: '/images/packages/oasis1/package-5.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Fridge',
      'Free WiFi',
      'Portable Griller',
      'Cooler',
      'All Outside Amenities',
      'Pillows - 6',
      'Bed - 7',
      'Remote - 1'
    ],
    status: 'Available'
  },
  // OASIS 1 - Package 5+
  {
    name: 'Oasis 1 - Extra Space Package',
    capacity: 100,
    description: '4 AC Rooms + Extra Space (30-100 pax)',
    oasis: 'Oasis 1',
    packageName: 'Package 5+',
    image: '/images/packages/oasis1/package-5plus.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Fridge',
      'Free WiFi',
      'Portable Griller',
      'Cooler',
      'All Outside Amenities',
      'Pillows - 8',
      'Mattress - 4',
      'Remote - 1',
      'Fly Racket - 1',
      'Bed Sheets - 4'
    ],
    status: 'Available'
  },
  // OASIS 2 - Package B
  {
    name: 'Oasis 2 - Family Room',
    capacity: 30,
    description: '1 AC Family Room',
    oasis: 'Oasis 2',
    packageName: 'Package B',
    image: '/images/packages/oasis2/package-b.jpg',
    appliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Refrigerator',
      'Free WiFi',
      'Griller',
      'All Outside Amenities',
      'Pillows - 8',
      'Bed - 4',
      'Remote - 1'
    ],
    status: 'Available'
  }
];

async function addRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense');
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing rooms
    // await Room.deleteMany({});
    // console.log('🗑️  Cleared existing rooms');

    const createdRooms = await Room.insertMany(roomsToAdd);
    console.log(`\n✅ Successfully created ${createdRooms.length} rooms:\n`);
    
    createdRooms.forEach(room => {
      console.log(`📍 ${room.name}`);
      console.log(`   Capacity: ${room.capacity} pax`);
      console.log(`   Oasis: ${room.oasis}`);
      console.log(`   Package: ${room.packageName}`);
      console.log(`   Appliances: ${room.appliances.join(', ')}`);
      console.log('');
    });

    console.log('✨ Room setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRooms();