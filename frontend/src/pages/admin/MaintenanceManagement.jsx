// frontend/src/pages/admin/MaintenanceManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../../services/admin/adminApi';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import './ManagementPages.css';

const MaintenanceManagement = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unitCost: 0, supplier: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    amount: '',
    priority: 'Medium',
    status: 'Pending',
    vendor: '',
    invoiceNumber: '',
    laborHours: 0,
    notes: '',
    partsNeeded: []
  });

  const categories = ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Equipment', 'Furniture', 'General', 'Emergency', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent', 'Emergency'];
  const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Fetch maintenance records and stats
  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterCategory) filters.category = filterCategory;
      if (filterPriority) filters.priority = filterPriority;

      console.log('📡 Fetching maintenance with token:', localStorage.getItem('token')?.substring(0, 50) + '...');
      const data = await adminApi.getAllMaintenance(filters);
      const statsData = await adminApi.getMaintenanceStats();
      
      setMaintenance(data);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Full error fetching maintenance:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.error || error.message || 'Error fetching maintenance records';
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterPriority]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        title: record.title,
        description: record.description,
        category: record.category,
        amount: record.amount,
        priority: record.priority,
        status: record.status,
        vendor: record.vendor || '',
        invoiceNumber: record.invoiceNumber || '',
        laborHours: record.laborHours || 0,
        notes: record.notes || '',
        partsNeeded: record.partsNeeded?.map((p, idx) => ({ ...p, id: idx })) || []
      });
    } else {
      setEditingRecord(null);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        amount: '',
        priority: 'Medium',
        status: 'Pending',
        vendor: '',
        invoiceNumber: '',
        laborHours: 0,
        notes: '',
        partsNeeded: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        alert('Title is required');
        return;
      }
      if (!formData.amount || formData.amount <= 0) {
        alert('Amount must be greater than 0');
        return;
      }

      if (editingRecord) {
        await adminApi.updateMaintenance(editingRecord._id, formData);
        alert('✅ Maintenance record updated successfully!');
      } else {
        await adminApi.createMaintenance(formData);
        alert('✅ Maintenance record created successfully!');
      }
      setIsModalOpen(false);
      fetchMaintenance();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      alert('❌ Error saving maintenance record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await adminApi.deleteMaintenance(id);
        alert('✅ Maintenance record deleted successfully!');
        fetchMaintenance();
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        alert('❌ Error deleting maintenance record');
      }
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await adminApi.markMaintenanceComplete(id, { completedDate: new Date() });
      alert('✅ Maintenance marked as completed!');
      fetchMaintenance();
    } catch (error) {
      console.error('Error marking complete:', error);
      alert('❌ Error marking maintenance as completed');
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert('Please enter item name');
      return;
    }
    if (newItem.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    if (newItem.unitCost < 0) {
      alert('Unit cost cannot be negative');
      return;
    }

    setFormData({
      ...formData,
      partsNeeded: [
        ...formData.partsNeeded,
        { ...newItem, id: Date.now() }
      ]
    });
    setNewItem({ name: '', quantity: 1, unitCost: 0, supplier: '' });
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      partsNeeded: formData.partsNeeded.filter(item => item.id !== itemId)
    });
  };

  const calculateItemsCost = () => {
    return formData.partsNeeded.reduce((total, item) => total + (item.quantity * item.unitCost), 0);
  };

  const calculateTotalAmount = () => {
    const laborCost = (formData.laborHours || 0) * 500; // Assuming ₱500 per hour
    const itemsCost = calculateItemsCost();
    return laborCost + itemsCost;
  };

  const columns = [
    {
      key: 'maintenanceId',
      label: 'ID',
      render: (value) => <span style={{ fontWeight: '600', color: '#0284c7' }}>{value}</span>
    },
    { key: 'title', label: 'Title' },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <span style={{
          background: '#f0f9ff',
          color: '#0284c7',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `₱${value.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          'Pending': '#f59e0b',
          'In Progress': '#3b82f6',
          'Completed': '#10b981',
          'Cancelled': '#ef4444'
        };
        return (
          <span style={{
            background: colors[value] || '#gray',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => {
        const colors = {
          'Low': '#10b981',
          'Medium': '#f59e0b',
          'High': '#ef4444',
          'Urgent': '#dc2626',
          'Emergency': '#7c2d12'
        };
        return (
          <span style={{
            background: colors[value] || '#gray',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'partsNeeded',
      label: 'Items',
      render: (value, record) => {
        const itemsCount = record.partsNeeded?.length || 0;
        if (itemsCount === 0) return <span style={{ color: '#94a3b8' }}>—</span>;
        
        const itemsCost = record.partsNeeded.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
        return (
          <div style={{ fontSize: '0.8rem' }}>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#0284c7' }}>
              📦 {itemsCount} item{itemsCount !== 1 ? 's' : ''}
            </p>
            <p style={{ margin: '0', color: '#10b981', fontWeight: '600' }}>
              ₱{itemsCost.toLocaleString()}
            </p>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {record.status !== 'Completed' && (
            <button
              onClick={() => handleMarkComplete(record._id)}
              style={{
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}
            >
              ✓ Complete
            </button>
          )}
          <button
            onClick={() => handleOpenModal(record)}
            style={{
              padding: '4px 8px',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}
          >
            ✎ Edit
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            style={{
              padding: '4px 8px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}
          >
            🗑 Delete
          </button>
        </div>
      )
    }
  ];

  // Calculate total expenses by category
  const expenseByCategory = stats?.byCategory || [];
  const totalExpenses = stats?.totalExpenses || 0;
  const pendingAmount = stats?.pendingPayments?.total || 0;

  if (loading) {
    return (
      <div className="management-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading maintenance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>🔧 Maintenance Management</h1>
        <button
          className="btn-primary"
          onClick={() => handleOpenModal()}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          + Add Maintenance
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0284c7', margin: '8px 0' }}>
            ₱{totalExpenses.toLocaleString()}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{maintenance.length} records</span>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ef4444', margin: '8px 0' }}>
            ₱{pendingAmount.toLocaleString()}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stats?.pendingPayments?.count || 0} items</span>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981', margin: '8px 0' }}>
            {maintenance.filter(m => m.status === 'Completed').length}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>this month</span>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#3b82f6', margin: '8px 0' }}>
            {maintenance.filter(m => m.status === 'In Progress').length}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ongoing tasks</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Status</label>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Expense Breakdown Chart */}
      {expenseByCategory.length > 0 && (
        <div className="sales-table-container" style={{ marginBottom: '24px' }}>
          <h3>📊 Expense Breakdown by Category</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            {expenseByCategory.map(item => (
              <div key={item._id} style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                  {item._id}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '600', color: '#0284c7' }}>
                  ₱{item.total.toLocaleString()}
                </p>
                <p style={{ margin: '0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {item.count} records
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="sales-table-container">
        <h3>📋 Maintenance Records</h3>
        <DataTable columns={columns} data={maintenance} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h3>{editingRecord ? '✎ Edit Maintenance' : '➕ Add New Maintenance'}</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Pool Filter Replacement"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the maintenance work"
                rows="3"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (PHP) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Vendor/Contractor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g., ABC Plumbing Services"
                />
              </div>

              <div className="form-group">
                <label>Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="e.g., INV-001"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Labor Hours</label>
              <input
                type="number"
                value={formData.laborHours}
                onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                placeholder="Hours spent"
                min="0"
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows="3"
              />
            </div>

            {/* MATERIALS & ITEMS SECTION */}
            <div className="form-group full-width" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>
                🛒 Materials & Items Purchased
              </h4>

              {/* Add New Item Form */}
              <div style={{
                background: '#f0f9ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #0284c7',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: '600', color: '#0284c7' }}>
                  ➕ Add New Item
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Unit Cost"
                    min="0"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{
                      padding: '8px 12px',
                      background: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    + Add
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Supplier (optional)"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* List of Added Items */}
              {formData.partsNeeded.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ margin: '0 0 12px', color: '#334155', fontSize: '0.9rem', fontWeight: '600' }}>
                    📦 Added Items ({formData.partsNeeded.length})
                  </h5>
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc'
                  }}>
                    {formData.partsNeeded.map((item, idx) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderBottom: idx < formData.partsNeeded.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
                            {item.name}
                          </p>
                          <p style={{ margin: '0', fontSize: '0.8rem', color: '#64748b' }}>
                            Qty: {item.quantity} × ₱{item.unitCost.toLocaleString()} = <span style={{ fontWeight: '600', color: '#0284c7' }}>₱{(item.quantity * item.unitCost).toLocaleString()}</span>
                            {item.supplier && <span style={{ marginLeft: '8px', color: '#94a3b8' }}>({item.supplier})</span>}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          style={{
                            padding: '6px 10px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            marginLeft: '8px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #0284c7'
                  }}>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#0284c7', fontWeight: '600' }}>
                      💰 Items Total Cost: ₱{calculateItemsCost().toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Cost Calculation */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '2px solid #10b981'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Labor Cost (@ ₱500/hr)</p>
                    <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', color: '#10b981' }}>
                      ₱{((formData.laborHours || 0) * 500).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Materials Cost</p>
                    <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', color: '#10b981' }}>
                      ₱{calculateItemsCost().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{
                  paddingTop: '8px',
                  borderTop: '1px solid #86efac',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr'
                }}>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#15803d' }}>Current Total</p>
                    <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: '700', color: '#15803d' }}>
                      ₱{calculateTotalAmount().toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: calculateTotalAmount() })}
                      style={{
                        padding: '6px 12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      📋 Auto-Fill Amount
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              style={{ background: '#0284c7', color: 'white', padding: '8px 20px' }}
            >
              {editingRecord ? 'Update' : 'Create'} Maintenance
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceManagement;
