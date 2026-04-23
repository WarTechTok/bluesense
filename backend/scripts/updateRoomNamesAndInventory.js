const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

// Room updates mapping
const roomUpdates = [
  {
    oldName: 'Oasis 1 - Package 2',
    newName: 'Oasis 1 - Superior Room',
    newAppliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Free WiFi',
      'Portable Griller',
      'All Outside Amenities',
      'Pillows - 2',
      'Bed - 1',
      'Remote - 1'
    ]
  },
  {
    oldName: 'Oasis 1 - Package 3',
    newName: 'Oasis 1 - Family Room',
    newAppliances: [
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
    ]
  },
  {
    oldName: 'Oasis 1 - Package 4',
    newName: 'Oasis 1 - Family Room X Superior',
    newAppliances: [
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
    ]
  },
  {
    oldName: 'Oasis 1 - Package 5',
    newName: 'Oasis 1 - Family Room X Superior',
    newAppliances: [
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
    ]
  },
  {
    oldName: 'Oasis 1 - Package 5+',
    newName: 'Oasis 1 - Caseras 3',
    newAppliances: [
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
    ]
  },
  {
    oldName: 'Oasis 2 - Package B',
    newName: 'Oasis 2 - Kamar Tedur Pertama',
    newAppliances: [
      'Air Conditioning',
      'Smart TV with Netflix',
      'Refrigerator',
      'Free WiFi',
      'Griller',
      'All Outside Amenities',
      'Pillows - 8',
      'Bed - 4',
      'Remote - 1'
    ]
  }
];

async function updateRooms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bluesense');
    console.log('✅ Connected to MongoDB\n');

    let updatedCount = 0;

    for (const update of roomUpdates) {
      const room = await Room.findOne({ name: update.oldName });

      if (room) {
        room.name = update.newName;
        room.appliances = update.newAppliances;
        await room.save();
        updatedCount++;

        console.log(`✅ Updated: "${update.oldName}" → "${update.newName}"`);
        console.log(`   Appliances added: Pillows, Bed, Remote${
          update.newName.includes('Caseras') ? ', Mattress, Fly Racket, Bed Sheets' : ''
        }`);
        console.log('');
      } else {
        console.log(`⚠️  Room not found: "${update.oldName}"`);
      }
    }

    console.log(`\n✨ Successfully updated ${updatedCount} rooms!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateRooms();
