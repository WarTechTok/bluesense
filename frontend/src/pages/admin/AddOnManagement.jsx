// frontend/src/pages/admin/AddOnManagement.jsx
// ============================================
// ADD-ON MANAGEMENT - Admin only
// Manage karaoke, stove prices, and other add-ons
// ============================================

import React, { useState, useEffect } from 'react';
import * as addonApi from '../../services/admin/addons';
import './AddOnManagement.css';

const AddOnManagement = () => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddon, setEditingAddon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    availableForSessions: ['All'],
    isActive: true,
    displayOrder: 1
  });

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const data = await addonApi.getAllAddons();
      setAddons(data);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0) {
      alert('Name and price are required');
      return;
    }
    
    try {
      if (editingAddon) {
        await addonApi.updateAddon(editingAddon._id, formData);
      } else {
        await addonApi.createAddon(formData);
      }
      setShowModal(false);
      fetchAddons();
      resetForm();
      alert(`Add-on ${editingAddon ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving add-on:', error);
      alert('Error saving add-on: ' + error.message);
    }
  };

  const handleEdit = (addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name,
      description: addon.description || '',
      price: addon.price,
      availableForSessions: addon.availableForSessions || ['All'],
      isActive: addon.isActive !== false,
      displayOrder: addon.displayOrder || 1
    });
    setShowModal(true);
  };

  const handleDelete = async (addon) => {
    if (window.confirm(`Are you sure you want to delete "${addon.name}"?`)) {
      try {
        await addonApi.deleteAddon(addon._id);
        fetchAddons();
        alert('Add-on deleted successfully!');
      } catch (error) {
        console.error('Error deleting add-on:', error);
        alert('Error deleting add-on');
      }
    }
  };

  const resetForm = () => {
    setEditingAddon(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      availableForSessions: ['All'],
      isActive: true,
      displayOrder: 1
    });
  };

  const handleSessionToggle = (session) => {
    const current = [...formData.availableForSessions];
    if (current.includes(session)) {
      setFormData({ ...formData, availableForSessions: current.filter(s => s !== session) });
    } else {
      setFormData({ ...formData, availableForSessions: [...current, session] });
    }
  };

  return (
    <div className="addon-management">
      {/* Hero Section */}
      <div className="addon-hero">
        <div className="addon-hero-content">
          <span className="hero-badge">Admin Panel</span>
          <h1>Add-on Management</h1>
          <p>Manage karaoke, stove, and other add-on prices</p>
        </div>
      </div>

      <div className="addon-container">
        {/* Add Button */}
        <div className="addon-actions-bar">
          <button className="btn-add-addon" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="fas fa-plus"></i> Add New Add-on
          </button>
        </div>

        {/* Add-ons Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading add-ons...</p>
          </div>
        ) : (
          <div className="addons-grid">
            {addons.map((addon) => (
              <div key={addon._id} className={`addon-card ${!addon.isActive ? 'inactive' : ''}`}>
                <div className="addon-header">
                  <div className="addon-icon">
                    <i className="fas fa-cube"></i>
                  </div>
                  <div className="addon-info">
                    <h3 className="addon-name">{addon.name}</h3>
                    <p className="addon-description">{addon.description || 'No description'}</p>
                  </div>
                  <div className="addon-actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(addon)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(addon)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="addon-details">
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value price">₱{addon.price.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Available For:</span>
                    <span className="value">{addon.availableForSessions?.join(', ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${addon.isActive ? 'active' : 'inactive'}`}>
                      {addon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container addon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAddon ? 'Edit Add-on' : 'Add New Add-on'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <form className="addon-form">
                <div className="form-group">
                  <label>Add-on Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Karaoke, Stove" />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" placeholder="Brief description" />
                </div>

                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} min="0" step="100" />
                </div>

                <div className="form-group">
                  <label>Available For Sessions</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableForSessions.includes('All')} onChange={() => handleSessionToggle('All')} />
                      <span>All Sessions</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableForSessions.includes('Day')} onChange={() => handleSessionToggle('Day')} />
                      <span>Day Session</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableForSessions.includes('Night')} onChange={() => handleSessionToggle('Night')} />
                      <span>Night Session</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableForSessions.includes('22hrs')} onChange={() => handleSessionToggle('22hrs')} />
                      <span>22-Hour Session</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} min="1" />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                    <span>Active (visible to customers)</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>{editingAddon ? 'Update' : 'Create'} Add-on</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOnManagement;