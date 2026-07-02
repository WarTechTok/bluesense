import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as adminApi from '../../services/admin';
import { validateInventoryItem, validateInventoryUsage } from '../../utils/adminValidation';
import './ManagementPages.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    unit: '',
    lowStockAlert: 5,
    price: '',
    category: 'Other',
    arrivalDate: '',
    expirationDate: ''
  });
  const [usageData, setUsageData] = useState({
    quantityUsed: '',
    usedBy: ''
  });
  const [createMaintenance, setCreateMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    category: 'Equipment',
    priority: 'Medium',
    description: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchLowStockItems();
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = [...inventory];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.item?.toLowerCase().includes(term) ||
        item.itemId?.toLowerCase().includes(term) ||
        item.unit?.toLowerCase().includes(term)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(item => {
        const addedDate = item.createdAt ? new Date(item.createdAt) : null;
        if (!addedDate || Number.isNaN(addedDate.getTime())) return false;

        const selected = new Date(selectedDate);
        const selectedDayStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
        const selectedDayEnd = new Date(selectedDayStart);
        selectedDayEnd.setDate(selectedDayEnd.getDate() + 1);

        return addedDate >= selectedDayStart && addedDate < selectedDayEnd;
      });
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => (item.category || 'Other') === selectedCategory);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, selectedDate, selectedCategory, inventory]);

  const fetchStaff = async () => {
    try {
      const data = await adminApi.getAllStaff();
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await adminApi.getAllInventory();
      setInventory(data);
      setFilteredInventory(data);
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
      setFormData({
        item: item.item,
        quantity: item.quantity,
        unit: item.unit,
        lowStockAlert: item.lowStockAlert,
        price: item.price,
        category: item.category || 'Other',
        arrivalDate: item.arrivalDate,
        expirationDate: item.expirationDate
      });
    } else {
      setEditingItem(null);
      setFormData({
        item: '',
        quantity: '',
        unit: '',
        lowStockAlert: 5,
        price: '',
        category: 'Other',
        arrivalDate: '',
        expirationDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const showConfirmationModal = (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        try {
          if (onConfirm) await onConfirm();
        } finally {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      confirmText,
      cancelText
    });
  };

  const handleSubmit = async () => {
    try {
      const validation = validateInventoryItem(formData);
      if (!validation.isValid) {
        showConfirmationModal('Validation Error', validation.error, null, 'OK');
        return;
      }

      if (editingItem) {
        await adminApi.updateInventoryItem(editingItem._id, formData);
      } else {
        await adminApi.createInventoryItem(formData);
      }
      setIsModalOpen(false);
      await fetchInventory();
      setExpandedCategory(formData.category || 'Other');
      showConfirmationModal('Success', '✅ Inventory item saved successfully!', null, 'OK');
    } catch (error) {
      console.error('Error saving inventory item:', error);
      showConfirmationModal('Error', '❌ Error saving inventory item', null, 'OK');
    }
  };

  const handleRecordUsage = async (item) => {
    setEditingItem(item);
    setUsageData({ quantityUsed: '', usedBy: '' });
    setCreateMaintenance(false);
    setMaintenanceData({
      title: `${item.item} - Maintenance Usage`,
      category: 'Equipment',
      priority: 'Medium',
      description: ''
    });
    setIsUsageModalOpen(true);
  };

  const handleSubmitUsage = async () => {
    try {
      const validation = validateInventoryUsage(usageData);
      if (!validation.isValid) {
        showConfirmationModal('Validation Error', validation.error, null, 'OK');
        return;
      }

      // Calculate expense
      const quantityUsed = parseInt(usageData.quantityUsed);
      const expense = quantityUsed * parseFloat(editingItem.price || 0);

      const maintenancePayload = createMaintenance && maintenanceData.title
        ? {
            title: maintenanceData.title,
            description: maintenanceData.description || `Inventory item used: ${editingItem.item} (Qty: ${quantityUsed})`,
            category: maintenanceData.category,
            priority: maintenanceData.priority,
            amount: expense,
            currency: 'PHP',
            status: 'Completed',
            inventoryUsed: [
              {
                inventoryId: editingItem._id,
                itemName: editingItem.item,
                quantityUsed: quantityUsed,
                unitPrice: parseFloat(editingItem.price || 0),
                totalCost: expense
              }
            ],
            reportedBy: null
          }
        : null;

      await adminApi.recordInventoryUsage(editingItem._id, {
        ...usageData,
        createMaintenance,
        maintenanceData: maintenancePayload
      });

      setIsUsageModalOpen(false);
      fetchInventory();
      fetchLowStockItems();
      const successMsg = createMaintenance
        ? '✅ Usage recorded and linked to maintenance!' 
        : '✅ Usage recorded successfully!';
      showConfirmationModal('Success', successMsg, null, 'OK');
    } catch (error) {
      console.error('Error recording usage:', error);
      showConfirmationModal('Error', '❌ Error recording usage', null, 'OK');
    }
  };

  const handleDelete = async (id) => {
    showConfirmationModal(
      'Delete Item',
      'Are you sure you want to delete this inventory item?',
      async () => {
        try {
          await adminApi.deleteInventoryItem(id);
          fetchInventory();
          showConfirmationModal('Success', 'Item deleted successfully!', null, 'OK');
        } catch (error) {
          console.error('Error deleting inventory item:', error);
          showConfirmationModal('Error', 'Error deleting inventory item', null, 'OK');
        }
      },
      'Yes, Delete',
      'Cancel'
    );
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
    {
      key: 'category',
      label: 'Category',
      render: (value) => value || 'Other'
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

  const categoryOrder = ['Chemical', 'Appliance', 'Other'];
  const groupedInventory = categoryOrder.reduce((acc, category) => {
    acc[category] = filteredInventory.filter((item) => (item.category || 'Other') === category);
    return acc;
  }, {});

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

      {/* Search and Date Filter */}
      <div className="search-container">
        <div className="search-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by Item Name, Item ID, or Unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="filter-group" style={{ minWidth: '220px' }}>
          <label htmlFor="inventory-date-filter" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
            Filter by Added Date
          </label>
          <input
            id="inventory-date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-input"
            style={{ width: '100%' }}
          />
        </div>

        <div className="filter-group" style={{ minWidth: '200px' }}>
          <label htmlFor="inventory-category-filter" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
            Category
          </label>
          <select
            id="inventory-category-filter"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (e.target.value !== 'All') {
                setExpandedCategory(e.target.value);
              }
            }}
            className="filter-select"
            style={{ width: '100%' }}
          >
            <option value="All">All Categories</option>
            <option value="Chemical">Chemical</option>
            <option value="Appliance">Appliance</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {categoryOrder.filter((category) => selectedCategory === 'All' || selectedCategory === category).map((category) => {
        const items = groupedInventory[category] || [];
        const isExpanded = expandedCategory === category;
        const title = category === 'Chemical' ? '🧪 Chemicals' : category === 'Appliance' ? '🔧 Appliances' : '📦 Other Items';
        const emptyMessage = `No ${category === 'Chemical' ? 'chemical' : category === 'Appliance' ? 'appliance' : 'other'} items in this view.`;

        return (
          <div key={category} className="inventory-category-card">
            <button
              type="button"
              className="inventory-category-card-header"
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
            >
              <div>
                <h3>{title}</h3>
                <span>{items.length} item(s)</span>
              </div>
              <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
            </button>

            {isExpanded && (
              <div className="inventory-category-card-body">
                {items.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={items}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    actions={actions}
                  />
                ) : (
                  <div className="inventory-category-empty">
                    {emptyMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

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
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Chemical">Chemical</option>
                  <option value="Appliance">Appliance</option>
                  <option value="Other">Other</option>
                </select>
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
                <label>Used By (Staff) *</label>
                <select
                  value={usageData.usedBy}
                  onChange={(e) => setUsageData({ ...usageData, usedBy: e.target.value })}
                  required
                >
                  <option value="">-- Select Staff Member --</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.staffId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div style={{
                borderTop: '2px solid #e2e8f0',
                margin: '16px 0',
                paddingTop: '16px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>
                  📋 Create Maintenance Record (Optional)
                </h4>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={createMaintenance}
                      onChange={(e) => setCreateMaintenance(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Automatically create a linked maintenance record</span>
                  </label>
                </div>

                {createMaintenance && (
                  <>
                    <div className="form-group">
                      <label>Maintenance Title *</label>
                      <input
                        type="text"
                        value={maintenanceData.title}
                        onChange={(e) => setMaintenanceData({ ...maintenanceData, title: e.target.value })}
                        placeholder="e.g., Pool Filter Replacement"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={maintenanceData.category}
                        onChange={(e) => setMaintenanceData({ ...maintenanceData, category: e.target.value })}
                      >
                        <option value="Plumbing">🚰 Plumbing</option>
                        <option value="Electrical">⚡ Electrical</option>
                        <option value="HVAC">❄️ HVAC</option>
                        <option value="Cleaning">🧹 Cleaning</option>
                        <option value="Equipment">⚙️ Equipment</option>
                        <option value="Furniture">🪑 Furniture</option>
                        <option value="General">📦 General</option>
                        <option value="Other">📋 Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={maintenanceData.priority}
                        onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value })}
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🔴 High</option>
                        <option value="Urgent">🔥 Urgent</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={maintenanceData.description}
                        onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                        placeholder="Additional notes about this maintenance..."
                        rows="3"
                      />
                    </div>

                    {/* Cost Summary */}
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #dcfce7',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '12px'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                        💰 EXPENSE CALCULATION:
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#22c55e' }}>
                        Quantity: {usageData.quantityUsed || 0} × ₱{parseFloat(editingItem?.price || 0).toFixed(2)}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>
                        Total: ₱{(parseInt(usageData.quantityUsed || 0) * parseFloat(editingItem?.price || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsUsageModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmitUsage}>Record Usage</button>
          </div>
        </Modal>
      )}

      {confirmationModal.isOpen && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
        />
      )}
    </div>
  );
};

export default InventoryManagement;