/**
 * Script to populate Inventory with mock pool cleaning supplies
 * Run: node scripts/addPoolCleaningInventory.js
 * Adds realistic swimming pool maintenance items with prices and dates
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');

const poolCleaningItems = [
  {
    item: 'Chlorine Tablets',
    quantity: 50,
    unit: 'Units',
    price: 8.50,
    lowStockAlert: 10,
    description: 'Stabilized chlorine tablets for pool sanitization'
  },
  {
    item: 'Chlorine Powder',
    quantity: 30,
    unit: 'Kg',
    price: 350.00,
    lowStockAlert: 5,
    description: 'Granular chlorine for rapid pool treatment'
  },
  {
    item: 'pH Increaser (Soda Ash)',
    quantity: 20,
    unit: 'Kg',
    price: 120.00,
    lowStockAlert: 5,
    description: 'Sodium carbonate to raise pool pH levels'
  },
  {
    item: 'pH Decreaser (Muriatic Acid)',
    quantity: 25,
    unit: 'Liters',
    price: 85.00,
    lowStockAlert: 5,
    description: 'Hydrochloric acid to lower pool pH levels'
  },
  {
    item: 'Pool Algaecide',
    quantity: 15,
    unit: 'Liters',
    price: 250.00,
    lowStockAlert: 3,
    description: 'Algae control and prevention chemical'
  },
  {
    item: 'Clarifier Solution',
    quantity: 20,
    unit: 'Liters',
    price: 180.00,
    lowStockAlert: 5,
    description: 'Water clarifying agent for pool transparency'
  },
  {
    item: 'Pool Brush - Nylon',
    quantity: 8,
    unit: 'Units',
    price: 350.00,
    lowStockAlert: 2,
    description: 'Nylon bristle pool brush for wall cleaning'
  },
  {
    item: 'Pool Vacuum Head',
    quantity: 5,
    unit: 'Units',
    price: 1200.00,
    lowStockAlert: 2,
    description: 'Weighted pool vacuum head for debris removal'
  },
  {
    item: 'Pool Filter Cartridge',
    quantity: 12,
    unit: 'Units',
    price: 2500.00,
    lowStockAlert: 3,
    description: 'Replacement filter cartridge for pool filtration system'
  },
  {
    item: 'Pool Test Kit (Chemical)',
    quantity: 10,
    unit: 'Units',
    price: 450.00,
    lowStockAlert: 2,
    description: 'Chemical test strips for pH and chlorine testing'
  },
  {
    item: 'Skimmer Net',
    quantity: 6,
    unit: 'Units',
    price: 280.00,
    lowStockAlert: 2,
    description: 'Surface debris skimmer net'
  },
  {
    item: 'Pool Shock Treatment',
    quantity: 18,
    unit: 'Units',
    price: 550.00,
    lowStockAlert: 5,
    description: 'Super-chlorination treatment for pool maintenance'
  },
  {
    item: 'Floc (Flocculant)',
    quantity: 10,
    unit: 'Kg',
    price: 200.00,
    lowStockAlert: 3,
    description: 'Coagulant for sediment settlement in pool'
  },
  {
    item: 'Pool Tile Cleaner',
    quantity: 8,
    unit: 'Liters',
    price: 320.00,
    lowStockAlert: 2,
    description: 'Specialized cleaner for pool tile and grout'
  },
  {
    item: 'Calcium Hardness Increaser',
    quantity: 5,
    unit: 'Kg',
    price: 450.00,
    lowStockAlert: 2,
    description: 'Calcium chloride for water hardness adjustment'
  }
];

async function addPoolCleaningInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Check if inventory already exists
    const existingCount = await Inventory.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Inventory already has ${existingCount} items. Skipping population.`);
      console.log('To reset: Delete items in MongoDB and run this script again.\n');
      await mongoose.connection.close();
      return;
    }

    // Get sequence numbers
    const lastItem = await Inventory.findOne().sort({ createdAt: -1 });
    let sequence = lastItem ? parseInt(lastItem.itemId.slice(4)) : 0;

    let addedCount = 0;
    const currentDate = new Date();
    const arrivalDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const expirationDate = new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    for (const item of poolCleaningItems) {
      sequence++;
      const newItem = new Inventory({
        itemId: `ITM-${String(sequence).padStart(4, '0')}`,
        item: item.item,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        lowStockAlert: item.lowStockAlert,
        arrivalDate: arrivalDate,
        expirationDate: expirationDate
      });

      await newItem.save();
      console.log(`✅ Added: ${item.item} (${item.quantity} ${item.unit}) - ₱${item.price.toFixed(2)}`);
      addedCount++;
    }

    console.log(`\n✨ Successfully added ${addedCount} pool cleaning inventory items!`);
    console.log('\n📊 Inventory Summary:');
    console.log(`├─ Total Items: ${addedCount}`);
    console.log(`├─ Arrival Date: ${arrivalDate.toLocaleDateString()}`);
    console.log(`├─ Expiration Date: ${expirationDate.toLocaleDateString()}`);
    
    // Calculate total inventory value
    const totalValue = poolCleaningItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    console.log(`├─ Total Inventory Value: ₱${totalValue.toFixed(2)}`);
    console.log(`└─ All items added to inventory management system\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPoolCleaningInventory();
