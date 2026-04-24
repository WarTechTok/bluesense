// frontend/src/pages/admin/PackageManagement.jsx
// ============================================
// PACKAGE MANAGEMENT - Admin only with image upload
// ============================================

import React, { useState, useEffect } from 'react';
import * as packageApi from '../../services/admin/packages';
import './PackageManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOasis, setSelectedOasis] = useState('Oasis 1');
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    oasis: 'Oasis 1',
    name: '',
    description: '',
    maxCapacity: 20,
    minCapacity: 0,
    inclusions: [],
    pricing: {},
    availableSessions: ['Day', 'Night'],
    displayOrder: 1,
    isActive: true,
    image: ''
  });
  const [inclusionInput, setInclusionInput] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageApi.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;
    
    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/packages/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
      return formData.image;
    } catch (error) {
      console.error('Error uploading image:', error);
      return formData.image;
    }
  };

  const handleAddInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, inclusionInput.trim()]
      });
      setInclusionInput('');
    }
  };

  const handleRemoveInclusion = (index) => {
    const newInclusions = [...formData.inclusions];
    newInclusions.splice(index, 1);
    setFormData({ ...formData, inclusions: newInclusions });
  };

  const handlePricingChange = (session, dayType, value) => {
    const newPricing = { ...formData.pricing };
    if (!newPricing[session]) newPricing[session] = { weekday: 0, weekend: 0 };
    newPricing[session][dayType] = parseInt(value) || 0;
    setFormData({ ...formData, pricing: newPricing });
  };

  const handleSessionToggle = (session) => {
    const current = [...formData.availableSessions];
    if (current.includes(session)) {
      setFormData({ ...formData, availableSessions: current.filter(s => s !== session) });
    } else {
      setFormData({ ...formData, availableSessions: [...current, session] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Package name is required');
      return;
    }
    
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const packageData = { ...formData, image: imageUrl };
      
      if (editingPackage) {
        await packageApi.updatePackage(editingPackage._id, packageData);
      } else {
        await packageApi.createPackage(packageData);
      }
      setShowModal(false);
      fetchPackages();
      resetForm();
      alert(`Package ${editingPackage ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Error saving package: ' + error.message);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      oasis: pkg.oasis,
      name: pkg.name,
      description: pkg.description || '',
      maxCapacity: pkg.maxCapacity || 20,
      minCapacity: pkg.minCapacity || 0,
      inclusions: pkg.inclusions || [],
      pricing: pkg.pricing || {},
      availableSessions: pkg.availableSessions || ['Day', 'Night'],
      displayOrder: pkg.displayOrder || 1,
      isActive: pkg.isActive !== false,
      image: pkg.image || ''
    });
    setImagePreview(pkg.image ? `${API_BASE_URL}${pkg.image}` : null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (pkg) => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      try {
        await packageApi.deletePackage(pkg._id);
        fetchPackages();
        alert('Package deleted successfully!');
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error deleting package');
      }
    }
  };

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      oasis: 'Oasis 1',
      name: '',
      description: '',
      maxCapacity: 20,
      minCapacity: 0,
      inclusions: [],
      pricing: {},
      availableSessions: ['Day', 'Night'],
      displayOrder: 1,
      isActive: true,
      image: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setInclusionInput('');
  };

  const getCapacityDisplay = (pkg) => {
    if (pkg.minCapacity && pkg.minCapacity > 0) {
      return `${pkg.minCapacity} - ${pkg.maxCapacity} pax`;
    }
    return `Up to ${pkg.maxCapacity} pax`;
  };

  const filteredPackages = packages.filter(p => p.oasis === selectedOasis);

  return (
    <div className="package-management">
      <div className="package-hero">
        <div className="package-hero-content">
          <span className="hero-badge">Admin Panel</span>
          <h1>Package Management</h1>
          <p>Manage package prices, descriptions, images, and inclusions</p>
        </div>
      </div>

      <div className="package-container">
        <div className="oasis-selector">
          <button 
            className={`oasis-tab ${selectedOasis === 'Oasis 1' ? 'active' : ''}`}
            onClick={() => setSelectedOasis('Oasis 1')}
          >
            <i className="fas fa-water"></i> Oasis 1
          </button>
          <button 
            className={`oasis-tab ${selectedOasis === 'Oasis 2' ? 'active' : ''}`}
            onClick={() => setSelectedOasis('Oasis 2')}
          >
            <i className="fas fa-palm-tree"></i> Oasis 2
          </button>
        </div>

        <div className="package-actions-bar">
          <button className="btn-add-package" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="fas fa-plus"></i> Add New Package
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading packages...</p>
          </div>
        ) : (
          <div className="packages-grid">
            {filteredPackages.map((pkg) => (
              <div key={pkg._id} className={`package-card ${!pkg.isActive ? 'inactive' : ''}`}>
                <div className="package-header">
                  <div className="package-badge">{pkg.name}</div>
                  <div className="package-actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(pkg)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(pkg)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                {pkg.image && (
                  <div className="package-image">
                    <img src={`${API_BASE_URL}${pkg.image}`} alt={pkg.name} />
                  </div>
                )}
                <p className="package-description">{pkg.description}</p>
                
                <div className="package-details">
                  <div className="detail-item">
                    <span className="label">Capacity:</span>
                    <span className="value">{getCapacityDisplay(pkg)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sessions:</span>
                    <span className="value">{pkg.availableSessions?.join(', ')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${pkg.isActive ? 'active' : 'inactive'}`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="package-pricing-preview">
                  <div className="pricing-preview-title">Starting from</div>
                  <div className="pricing-preview-amount">
                    ₱{Object.values(pkg.pricing || {})[0]?.weekday?.toLocaleString() || '0'}
                  </div>
                  <div className="pricing-preview-note">weekday rate</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container package-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPackage ? 'Edit Package' : 'Add New Package'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <form className="package-form">
                {/* Basic Info */}
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Oasis *</label>
                      <select value={formData.oasis} onChange={(e) => setFormData({ ...formData, oasis: e.target.value })}>
                        <option value="Oasis 1">Oasis 1</option>
                        <option value="Oasis 2">Oasis 2</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Package Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Package 1" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" placeholder="Brief description of the package" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Capacity *</label>
                      <input type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })} min="1" />
                    </div>
                    <div className="form-group">
                      <label>Minimum Capacity (if required)</label>
                      <input type="number" value={formData.minCapacity} onChange={(e) => setFormData({ ...formData, minCapacity: parseInt(e.target.value) })} min="0" />
                      <small>Leave 0 for no minimum requirement</small>
                    </div>
                    <div className="form-group">
                      <label>Display Order</label>
                      <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} min="1" />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-section">
                  <h4>Package Image</h4>
                  <div className="image-upload-container">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Package preview" />
                        <button type="button" className="remove-image-btn" onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData({ ...formData, image: '' });
                        }}>
                          <i className="fas fa-times"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-area">
                        <label className="image-upload-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Click to upload package image</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                        </label>
                        <p className="image-hint">Recommended size: 800x600px, Max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Sessions */}
                <div className="form-section">
                  <h4>Available Sessions</h4>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableSessions.includes('Day')} onChange={() => handleSessionToggle('Day')} />
                      <span>Day Session (8AM - 5PM)</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableSessions.includes('Night')} onChange={() => handleSessionToggle('Night')} />
                      <span>Night Session (8PM - 6AM)</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.availableSessions.includes('22hrs')} onChange={() => handleSessionToggle('22hrs')} />
                      <span>22-Hour Session</span>
                    </label>
                  </div>
                </div>

                {/* Pricing */}
                <div className="form-section">
                  <h4>Pricing (₱)</h4>
                  <div className="pricing-table">
                    <div className="pricing-header">
                      <div className="pricing-cell">Session</div>
                      <div className="pricing-cell">Monday - Thursday</div>
                      <div className="pricing-cell">Friday - Sunday</div>
                    </div>
                    {['Day', 'Night', '22hrs'].map(session => (
                      formData.availableSessions.includes(session) && (
                        <div key={session} className="pricing-row">
                          <div className="pricing-cell">{session}</div>
                          <div className="pricing-cell">
                            <input type="number" value={formData.pricing[session]?.weekday || ''} onChange={(e) => handlePricingChange(session, 'weekday', e.target.value)} placeholder="Weekday" />
                          </div>
                          <div className="pricing-cell">
                            <input type="number" value={formData.pricing[session]?.weekend || ''} onChange={(e) => handlePricingChange(session, 'weekend', e.target.value)} placeholder="Weekend" />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Inclusions */}
                <div className="form-section">
                  <h4>Inclusions</h4>
                  <div className="inclusions-list">
                    {formData.inclusions.map((inc, idx) => (
                      <div key={idx} className="inclusion-tag">
                        <span>{inc}</span>
                        <button type="button" onClick={() => handleRemoveInclusion(idx)}><i className="fas fa-times"></i></button>
                      </div>
                    ))}
                  </div>
                  <div className="add-inclusion">
                    <input type="text" value={inclusionInput} onChange={(e) => setInclusionInput(e.target.value)} placeholder="Add an inclusion (e.g., Free WiFi)" />
                    <button type="button" onClick={handleAddInclusion}><i className="fas fa-plus"></i> Add</button>
                  </div>
                </div>

                {/* Status */}
                <div className="form-section">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                    <span>Active (visible to customers)</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>{editingPackage ? 'Update' : 'Create'} Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;