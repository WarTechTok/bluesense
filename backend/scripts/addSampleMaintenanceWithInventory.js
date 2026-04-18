/**
 * Script to create sample maintenance records using pool cleaning inventory
 * Run: node scripts/addSampleMaintenanceWithInventory.js
 * Creates 5 maintenance records that reference inventory items
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Inventory = require('../models/Inventory');

async function addSampleMaintenance() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all inventory items
    const inventory = await Inventory.find().limit(15);
    if (inventory.length === 0) {
      console.log('❌ No inventory items found. Run addPoolCleaningInventory.js first.');
      await mongoose.connection.close();
      return;
    }

    console.log(`📦 Found ${inventory.length} inventory items\n`);

    // Delete existing maintenance records
    const deleteResult = await Maintenance.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing maintenance records\n`);

    // Sample maintenance tasks
    const maintenanceTasks = [
      {
        title: 'Weekly Pool Sanitization',
        description: 'Routine weekly pool cleaning and chemical treatment',
        category: 'Cleaning',
        priority: 'High',
        status: 'Completed',
        inventoryItems: [
          { itemId: inventory[0]._id, itemName: inventory[0].item, quantityUsed: 10, unitPrice: inventory[0].price }, // Chlorine tablets
          { itemId: inventory[1]._id, itemName: inventory[1].item, quantityUsed: 2, unitPrice: inventory[1].price }   // Chlorine powder
        ]
      },
      {
        title: 'pH Level Adjustment',
        description: 'Balance pool water pH using chemical treatments',
        category: 'Cleaning',
        priority: 'Medium',
        status: 'Completed',
        inventoryItems: [
          { itemId: inventory[2]._id, itemName: inventory[2].item, quantityUsed: 5, unitPrice: inventory[2].price },  // pH increaser
          { itemId: inventory[3]._id, itemName: inventory[3].item, quantityUsed: 3, unitPrice: inventory[3].price }   // pH decreaser
        ]
      },
      {
        title: 'Algae Treatment & Prevention',
        description: 'Treat existing algae and apply preventive solution',
        category: 'Equipment',
        priority: 'High',
        status: 'In Progress',
        inventoryItems: [
          { itemId: inventory[4]._id, itemName: inventory[4].item, quantityUsed: 2, unitPrice: inventory[4].price },  // Pool algaecide
          { itemId: inventory[5]._id, itemName: inventory[5].item, quantityUsed: 3, unitPrice: inventory[5].price }   // Clarifier solution
        ]
      },
      {
        title: 'Filter Cartridge Replacement & Cleaning',
        description: 'Replace main pool filter cartridge and clean walls',
        category: 'Equipment',
        priority: 'High',
        status: 'Pending',
        inventoryItems: [
          { itemId: inventory[8]._id, itemName: inventory[8].item, quantityUsed: 1, unitPrice: inventory[8].price },  // Pool filter cartridge
          { itemId: inventory[6]._id, itemName: inventory[6].item, quantityUsed: 1, unitPrice: inventory[6].price },  // Pool brush
          { itemId: inventory[13]._id, itemName: inventory[13].item, quantityUsed: 2, unitPrice: inventory[13].price } // Pool tile cleaner
        ]
      },
      {
        title: 'Monthly Deep Cleaning & Shock Treatment',
        description: 'Monthly pool maintenance with shock treatment',
        category: 'Cleaning',
        priority: 'Medium',
        status: 'Pending',
        inventoryItems: [
          { itemId: inventory[11]._id, itemName: inventory[11].item, quantityUsed: 1, unitPrice: inventory[11].price }, // Pool shock treatment
          { itemId: inventory[12]._id, itemName: inventory[12].item, quantityUsed: 2, unitPrice: inventory[12].price }, // Floc (flocculant)
          { itemId: inventory[7]._id, itemName: inventory[7].item, quantityUsed: 1, unitPrice: inventory[7].price },   // Pool vacuum head
          { itemId: inventory[10]._id, itemName: inventory[10].item, quantityUsed: 1, unitPrice: inventory[10].price }  // Skimmer net
        ]
      }
    ];

    let sequence = 0;
    const now = new Date();

    for (const task of maintenanceTasks) {
      sequence++;

      // Calculate total inventory cost
      const inventoryCost = task.inventoryItems.reduce((total, item) => {
        return total + (item.quantityUsed * item.unitPrice);
      }, 0);

      const maintenance = new Maintenance({
        maintenanceId: `MNT-${String(sequence).padStart(4, '0')}`,
        title: task.title,
        description: task.description,
        category: task.category,
        amount: inventoryCost,
        currency: 'PHP',
        priority: task.priority,
        status: task.status,
        vendor: 'In-House Maintenance',
        invoiceNumber: `INV-${String(sequence).padStart(3, '0')}`,
        inventoryUsed: task.inventoryItems.map(item => ({
          inventoryId: item.itemId,
          itemName: item.itemName,
          quantityUsed: item.quantityUsed,
          unitPrice: item.unitPrice,
          totalCost: item.quantityUsed * item.unitPrice
        })),
        laborHours: [2, 1.5, 2.5, 3, 4][sequence - 1] || 2,
        notes: `Pool maintenance completed using inventory items. Status: ${task.status}`,
        reportedDate: new Date(now.getTime() - (5 - sequence) * 24 * 60 * 60 * 1000),
        completedDate: task.status === 'Completed' ? new Date(now.getTime() - (5 - sequence) * 24 * 60 * 60 * 1000) : null,
        isRecurring: true,
        recurringFrequency: 'Weekly'
      });

      await maintenance.save();

      console.log(`✅ Added: ${task.title}`);
      console.log(`   └─ Inventory Cost: ₱${inventoryCost.toFixed(2)}`);
      console.log(`   └─ Items Used: ${task.inventoryItems.length}`);
      task.inventoryItems.forEach(item => {
        console.log(`      • ${item.itemName}: ${item.quantityUsed} @ ₱${item.unitPrice.toFixed(2)} = ₱${(item.quantityUsed * item.unitPrice).toFixed(2)}`);
      });
      console.log();
    }

    // Calculate summary statistics
    const stats = await Maintenance.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalExpense: { $sum: '$amount' },
          byStatus: {
            $push: {
              status: '$status',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log('📊 Maintenance Summary:');
      console.log(`├─ Total Maintenance Records: ${stat.totalRecords}`);
      console.log(`├─ Total Maintenance Expense: ₱${stat.totalExpense.toFixed(2)}`);
      console.log(`├─ By Status:`);
      
      const statusBreakdown = {};
      stat.byStatus.forEach(s => {
        statusBreakdown[s.status] = (statusBreakdown[s.status] || 0) + 1;
      });
      
      Object.entries(statusBreakdown).forEach(([status, count]) => {
        console.log(`│  └─ ${status}: ${count} record(s)`);
      });
      
      console.log(`└─ All records use inventory items for accurate expense tracking\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSampleMaintenance();
