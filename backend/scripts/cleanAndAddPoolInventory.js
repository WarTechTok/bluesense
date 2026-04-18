/**
 * Clean inventory and add pool cleaning items
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');

async function cleanAndPopulate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing inventory
    const deleteResult = await Inventory.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing items`);

    // Now add the pool cleaning items
    const poolCleaningItems = [
      { item: 'Chlorine Tablets', quantity: 50, unit: 'Units', price: 8.50, lowStockAlert: 10 },
      { item: 'Chlorine Powder', quantity: 30, unit: 'Kg', price: 350.00, lowStockAlert: 5 },
      { item: 'pH Increaser (Soda Ash)', quantity: 20, unit: 'Kg', price: 120.00, lowStockAlert: 5 },
      { item: 'pH Decreaser (Muriatic Acid)', quantity: 25, unit: 'Liters', price: 85.00, lowStockAlert: 5 },
      { item: 'Pool Algaecide', quantity: 15, unit: 'Liters', price: 250.00, lowStockAlert: 3 },
      { item: 'Clarifier Solution', quantity: 20, unit: 'Liters', price: 180.00, lowStockAlert: 5 },
      { item: 'Pool Brush - Nylon', quantity: 8, unit: 'Units', price: 350.00, lowStockAlert: 2 },
      { item: 'Pool Vacuum Head', quantity: 5, unit: 'Units', price: 1200.00, lowStockAlert: 2 },
      { item: 'Pool Filter Cartridge', quantity: 12, unit: 'Units', price: 2500.00, lowStockAlert: 3 },
      { item: 'Pool Test Kit (Chemical)', quantity: 10, unit: 'Units', price: 450.00, lowStockAlert: 2 },
      { item: 'Skimmer Net', quantity: 6, unit: 'Units', price: 280.00, lowStockAlert: 2 },
      { item: 'Pool Shock Treatment', quantity: 18, unit: 'Units', price: 550.00, lowStockAlert: 5 },
      { item: 'Floc (Flocculant)', quantity: 10, unit: 'Kg', price: 200.00, lowStockAlert: 3 },
      { item: 'Pool Tile Cleaner', quantity: 8, unit: 'Liters', price: 320.00, lowStockAlert: 2 },
      { item: 'Calcium Hardness Increaser', quantity: 5, unit: 'Kg', price: 450.00, lowStockAlert: 2 }
    ];

    let sequence = 0;
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
    }

    console.log(`\n✨ Successfully added ${sequence} pool cleaning inventory items!`);
    
    // Calculate total inventory value
    const totalValue = poolCleaningItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    console.log('\n📊 Inventory Summary:');
    console.log(`├─ Total Items: ${sequence}`);
    console.log(`├─ Arrival Date: ${arrivalDate.toLocaleDateString()}`);
    console.log(`├─ Expiration Date: ${expirationDate.toLocaleDateString()}`);
    console.log(`├─ Total Inventory Value: ₱${totalValue.toFixed(2)}`);
    console.log(`└─ All items ready for maintenance expense tracking\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanAndPopulate();
