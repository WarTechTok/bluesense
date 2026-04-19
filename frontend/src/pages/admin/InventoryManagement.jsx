import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import * as adminApi from '../../services/admin/adminApi';
import { validateInventoryItem, validateInventoryUsage } from '../../utils/adminValidation';
import './ManagementPages.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    unit: '',
    lowStockAlert: 5,
    price: '',
    arrivalDate: '',
    expirationDate: ''
  });
  const [usageData, setUsageData] = useState({
    quantityUsed: '',
    usedBy: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchLowStockItems();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await adminApi.getAllInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const data = await adminApi.getLowStockItems();
      setLowStockItems(data);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        item: '',
        quantity: '',
        unit: '',
        lowStockAlert: 5,
        price: '',
        arrivalDate: '',
        expirationDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // ============================================
      // FORM VALIDATION USING UTILITY
      // ============================================
      const validation = validateInventoryItem(formData);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      if (editingItem) {
        await adminApi.updateInventoryQuantity(editingItem._id, formData.quantity);
      } else {
        await adminApi.createInventoryItem(formData);
      }
      setIsModalOpen(false);
      fetchInventory();
      alert('✅ Inventory item saved successfully!');
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('❌ Error saving inventory item');
    }
  };

  const handleRecordUsage = async (item) => {
    setEditingItem(item);
    setUsageData({ quantityUsed: '', usedBy: '' });
    setIsUsageModalOpen(true);
  };

  const handleSubmitUsage = async () => {
    try {
      // ============================================
      // FORM VALIDATION USING UTILITY
      // ============================================
      const validation = validateInventoryUsage(usageData);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      await adminApi.recordInventoryUsage(editingItem._id, usageData);
      setIsUsageModalOpen(false);
      fetchInventory();
      fetchLowStockItems();
      alert('✅ Usage recorded successfully!');
    } catch (error) {
      console.error('Error recording usage:', error);
      alert('❌ Error recording usage');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await adminApi.deleteInventoryItem(id);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        alert('Error deleting inventory item');
      }
    }
  };

  const columns = [
    { key: 'itemId', label: 'Item ID' },
    { key: 'item', label: 'Item Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'price',
      label: 'Price',
      render: (value) => `₱${parseFloat(value || 0).toFixed(2)}`
    },
    { key: 'lowStockAlert', label: 'Low Stock Alert' },
    {
      key: 'arrivalDate',
      label: 'Arrival Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'expirationDate',
      label: 'Expiration Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'quantity',
      label: 'Status',
      render: (value, row) => {
        const isLowStock = value < row.lowStockAlert;
        return (
          <span className={`status-badge ${isLowStock ? 'status-warning' : 'status-available'}`}>
            {isLowStock ? '⚠️ Low Stock' : '✓ In Stock'}
          </span>
        );
      }
    }
  ];

  const actions = [
    { label: 'Record Usage', type: 'usage', handler: handleRecordUsage }
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Item</button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {lowStockItems.length} item(s) with low stock
        </div>
      )}

      <DataTable
        columns={columns}
        data={inventory}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        actions={actions}
      />

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h3>{editingItem ? '✎ Edit Item' : '➕ Add New Item'}</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <form className="form landscape">
              {!editingItem && (
                <div className="form-group">
                  <label>Item ID</label>
                  <input
                    type="text"
                    value="ITM-Auto"
                    disabled
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                  <small>Auto-generated upon save</small>
                </div>
              )}
              {editingItem && (
                <div className="form-group">
                  <label>Item ID</label>
                  <input
                    type="text"
                    value={editingItem.itemId || 'N/A'}
                    disabled
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., Liters, Units, Boxes"
                />
              </div>
              <div className="form-group">
                <label>Price Per Unit *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="e.g., 150.00"
                />
              </div>
              <div className="form-group">
                <label>Low Stock Alert</label>
                <input
                  type="number"
                  value={formData.lowStockAlert}
                  onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Arrival Date</label>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>{editingItem ? 'Update' : 'Create'} Item</button>
          </div>
        </Modal>
      )}

      {isUsageModalOpen && (
        <Modal onClose={() => setIsUsageModalOpen(false)}>
          <div className="modal-header">
            <h3>📊 Record Usage</h3>
            <button className="modal-close" onClick={() => setIsUsageModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <form className="form">
              <div className="form-group">
                <label>Item: {editingItem?.item}</label>
              </div>
              <div className="form-group">
                <label>Quantity Used *</label>
                <input
                  type="number"
                  value={usageData.quantityUsed}
                  onChange={(e) => setUsageData({ ...usageData, quantityUsed: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Used By (Staff ID)</label>
                <input
                  type="text"
                  value={usageData.usedBy}
                  onChange={(e) => setUsageData({ ...usageData, usedBy: e.target.value })}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsUsageModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmitUsage}>Record Usage</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryManagement;
