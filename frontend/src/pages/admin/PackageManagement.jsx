// frontend/src/pages/admin/PackageManagement.jsx
// ============================================
// PACKAGE MANAGEMENT - Admin only with multi-image upload
// ============================================

import React, { useState, useEffect } from "react";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import * as packageApi from "../../services/admin/packages";
import { refreshAllData } from "../../constants/packages";
import PackageImageUploader from "../../components/admin/PackageImageUploader";
import Modal from "../../components/admin/Modal";
import "./PackageManagement.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOasis, setSelectedOasis] = useState("Oasis 1");
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
  const [formData, setFormData] = useState({
    oasis: "Oasis 1",
    name: "",
    description: "",
    maxCapacity: 20,
    minCapacity: 0,
    inclusions: [],
    pricing: {},
    availableSessions: ["Day", "Night"],
    displayOrder: 1,
    isActive: true,
    image: "",
    images: [],
  });
  const [inclusionInput, setInclusionInput] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageApi.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPackageC = () => formData.name === "Package C";

  const showConfirmationModal = (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      confirmText,
      cancelText
    });
  };

  // ── Images handler ───────────────────────────────────────
  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
      image: newImages[0] || "",
    }));
  };

  // ── Inclusions ───────────────────────────────────────────
  const handleAddInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({ ...formData, inclusions: [...formData.inclusions, inclusionInput.trim()] });
      setInclusionInput("");
    }
  };

  const handleRemoveInclusion = (index) => {
    const newInclusions = [...formData.inclusions];
    newInclusions.splice(index, 1);
    setFormData({ ...formData, inclusions: newInclusions });
  };

  // ── SIMPLIFIED PRICING (no weekday/weekend) ──────────────
  const handlePricingChange = (session, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [session]: numValue },
    }));
  };

  const handlePaxPricingChange = (paxLevel, session, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [paxLevel]: {
          ...prev.pricing[paxLevel],
          [session]: numValue,
        },
      },
    }));
  };

  const handleSessionToggle = (session) => {
    const current = [...formData.availableSessions];
    if (current.includes(session)) {
      setFormData({ ...formData, availableSessions: current.filter((s) => s !== session) });
    } else {
      setFormData({ ...formData, availableSessions: [...current, session] });
    }
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.name) {
      showConfirmationModal('Validation Error', 'Package name is required', null, 'OK');
      return;
    }

    try {
      let packageData = {
        ...formData,
        image: formData.images[0] || formData.image || "",
      };

      // For Package C, ensure pricing structure uses dynamic pax values
      if (isPackageC()) {
        const minPax = formData.minCapacity || 50;
        const maxPax = formData.maxCapacity || 100;
        
        packageData.pricing = {
          [`${minPax}pax`]: {
            Day: formData.pricing[`${minPax}pax`]?.Day || 0,
            Night: formData.pricing[`${minPax}pax`]?.Night || 0,
            "22hrs": formData.pricing[`${minPax}pax`]?.["22hrs"] || 0
          },
          [`${maxPax}pax`]: {
            Day: formData.pricing[`${maxPax}pax`]?.Day || 0,
            Night: formData.pricing[`${maxPax}pax`]?.Night || 0,
            "22hrs": formData.pricing[`${maxPax}pax`]?.["22hrs"] || 0
          }
        };
      }

      console.log("Submitting package data:", JSON.stringify(packageData, null, 2));

      if (editingPackage) {
        await packageApi.updatePackage(editingPackage._id, packageData);
      } else {
        await packageApi.createPackage(packageData);
      }

      await refreshAllData();
      setShowModal(false);
      fetchPackages();
      resetForm();
      showConfirmationModal('Success', `Package ${editingPackage ? "updated" : "created"} successfully!`, null, 'OK');
    } catch (error) {
      console.error("Error saving package:", error);
      showConfirmationModal('Error', "Error saving package: " + (error.response?.data?.error || error.message), null, 'OK');
    }
  };

  // ── Edit ─────────────────────────────────────────────────
  const handleEdit = (pkg) => {
    setEditingPackage(pkg);

    let pricingData = {};

    if (pkg.name === "Package C") {
      // Load pricing dynamically based on minCapacity and maxCapacity
      pricingData = pkg.pricing || {};
      const minPax = pkg.minCapacity || 50;
      const maxPax = pkg.maxCapacity || 100;
      
      // Ensure the dynamic keys exist
      if (!pricingData[`${minPax}pax`]) pricingData[`${minPax}pax`] = {};
      if (!pricingData[`${maxPax}pax`]) pricingData[`${maxPax}pax`] = {};
      
      // Initialize all sessions to 0 if missing
      ["Day", "Night", "22hrs"].forEach(session => {
        if (!pricingData[`${minPax}pax`][session]) pricingData[`${minPax}pax`][session] = 0;
        if (!pricingData[`${maxPax}pax`][session]) pricingData[`${maxPax}pax`][session] = 0;
      });
    } else {
      // Regular packages: load session prices (they may be objects or numbers)
      const rawPricing = pkg.pricing || {};
      for (const [key, val] of Object.entries(rawPricing)) {
        if (typeof val === "object" && val !== null) {
          // Convert old weekday/weekend to single number (use weekday)
          pricingData[key] = val.weekday || val.weekend || 0;
        } else if (typeof val === "number") {
          pricingData[key] = val;
        } else {
          pricingData[key] = 0;
        }
      }
    }

    // Build images array
    let existingImages = [];
    if (pkg.images && pkg.images.length > 0) {
      existingImages = pkg.images;
    } else if (pkg.image) {
      const imgUrl = pkg.image.startsWith("http") ? pkg.image : `${API_BASE_URL}${pkg.image}`;
      existingImages = [imgUrl];
    }

    setFormData({
      oasis: pkg.oasis,
      name: pkg.name,
      description: pkg.description || "",
      maxCapacity: pkg.maxCapacity || 20,
      minCapacity: pkg.minCapacity || 0,
      inclusions: pkg.inclusions || [],
      pricing: pricingData,
      availableSessions: pkg.availableSessions || ["Day", "Night"],
      displayOrder: pkg.displayOrder || 1,
      isActive: pkg.isActive !== false,
      image: pkg.image || "",
      images: existingImages,
    });

    setShowModal(true);
  };

  const handleDelete = async (pkg) => {
    showConfirmationModal(
      'Delete Package',
      `Are you sure you want to delete "${pkg.name}"?`,
      async () => {
        try {
          await packageApi.deletePackage(pkg._id);
          await refreshAllData();
          fetchPackages();
          showConfirmationModal('Success', 'Package deleted successfully!', null, 'OK');
        } catch (error) {
          console.error("Error deleting package:", error);
          showConfirmationModal('Error', 'Error deleting package', null, 'OK');
        }
      },
      'Yes, Delete',
      'Cancel'
    );
  };

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      oasis: "Oasis 1",
      name: "",
      description: "",
      maxCapacity: 20,
      minCapacity: 0,
      inclusions: [],
      pricing: {},
      availableSessions: ["Day", "Night"],
      displayOrder: 1,
      isActive: true,
      image: "",
      images: [],
    });
    setInclusionInput("");
  };

  const getCapacityDisplay = (pkg) => {
    if (pkg.minCapacity && pkg.minCapacity > 0) return `${pkg.minCapacity} - ${pkg.maxCapacity} pax`;
    return `Up to ${pkg.maxCapacity} pax`;
  };

  const getPricingPreview = (pkg) => {
    if (pkg.name === "Package C") {
      const minPax = pkg.minCapacity || 50;
      const price = pkg.pricing?.[`${minPax}pax`]?.Day || 0;
      return `₱${price.toLocaleString()}`;
    }
    const firstPrice = Object.values(pkg.pricing || {})[0] || 0;
    // If it's an object with weekday/weekend, extract the number
    const price = typeof firstPrice === 'object' ? (firstPrice.weekday || firstPrice.weekend || 0) : firstPrice;
    return `₱${price.toLocaleString()}`;
  };

  // ── SIMPLIFIED PRICING FIELDS (no weekday/weekend) ────────
  const renderPricingFields = () => {
    if (isPackageC()) {
      const minPax = formData.minCapacity || 50;
      const maxPax = formData.maxCapacity || 100;

      return (
        <div className="form-section">
          <h4>Pricing (₱) — PAX-Based</h4>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
            Set price for {minPax} PAX and {maxPax} PAX tiers
          </p>

          {[minPax, maxPax].map((pax) => (
            <div key={pax} style={{ marginBottom: "20px" }}>
              <h6 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>{pax} PAX</h6>
              <div className="pricing-table">
                <div className="pricing-header">
                  <div className="pricing-cell">Session</div>
                  <div className="pricing-cell">Price (₱)</div>
                </div>
                {["Day", "Night", "22hrs"].map((session) =>
                  formData.availableSessions.includes(session) && (
                    <div key={session} className="pricing-row">
                      <div className="pricing-cell">{session}</div>
                      <div className="pricing-cell">
                        <input
                          type="number"
                          value={formData.pricing[`${pax}pax`]?.[session] || ""}
                          onChange={(e) => handlePaxPricingChange(`${pax}pax`, session, e.target.value)}
                          placeholder={`Price for ${pax} PAX`}
                          min="0"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Regular packages - simplified (single price per session)
    return (
      <div className="form-section">
        <h4>Pricing per Session (₱)</h4>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
          Same price applies to all days of the week
        </p>
        <div className="pricing-table">
          <div className="pricing-header">
            <div className="pricing-cell">Session</div>
            <div className="pricing-cell">Price (₱)</div>
          </div>
          {["Day", "Night", "22hrs"].map((session) =>
            formData.availableSessions.includes(session) && (
              <div key={session} className="pricing-row">
                <div className="pricing-cell">{session}</div>
                <div className="pricing-cell">
                  <input
                    type="number"
                    value={formData.pricing?.[session] ?? ""}
                    onChange={(e) => handlePricingChange(session, e.target.value)}
                    placeholder="Price"
                    min="0"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const filteredPackages = packages.filter((p) => p.oasis === selectedOasis);

  // ── Render ───────────────────────────────────────────────
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
          {["Oasis 1", "Oasis 2"].map((oasis) => (
            <button
              key={oasis}
              className={`oasis-tab ${selectedOasis === oasis ? "active" : ""}`}
              onClick={() => setSelectedOasis(oasis)}
            >
              <i className={`fas fa-${oasis === "Oasis 1" ? "water" : "palm-tree"}`}></i> {oasis}
            </button>
          ))}
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
              <div key={pkg._id} className={`package-card ${!pkg.isActive ? "inactive" : ""}`}>
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

                <div className="package-image">
                  {(pkg.images?.length > 0 || pkg.image) ? (
                    <div className="pkg-card-img-wrap">
                      <img
                        src={pkg.images?.[0] || (pkg.image?.startsWith("http") ? pkg.image : `${API_BASE_URL}${pkg.image}`)}
                        alt={pkg.name}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      {pkg.images?.length > 1 && (
                        <span className="img-count-badge">
                          <i className="fas fa-images"></i> {pkg.images.length}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pkg-card-img-placeholder">
                      <i className="fas fa-image"></i>
                      <span>No image</span>
                    </div>
                  )}
                </div>

                <p className="package-description">{pkg.description}</p>

                <div className="package-details">
                  <div className="detail-item">
                    <span className="label">Capacity:</span>
                    <span className="value">{getCapacityDisplay(pkg)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sessions:</span>
                    <span className="value">{pkg.availableSessions?.join(", ")}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${pkg.isActive ? "active" : "inactive"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="package-pricing-preview">
                  <div className="pricing-preview-title">Starting from</div>
                  <div className="pricing-preview-amount">{getPricingPreview(pkg)}</div>
                  <div className="pricing-preview-note">
                    {pkg.name === "Package C" ? `for ${pkg.minCapacity || 50} PAX` : "per session"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h3>{editingPackage ? "Edit Package" : "Add New Package"}</h3>
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
                    <label>Minimum Capacity</label>
                    <input type="number" value={formData.minCapacity} onChange={(e) => setFormData({ ...formData, minCapacity: parseInt(e.target.value) })} min="0" />
                    <small>Leave 0 for no minimum</small>
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} min="1" />
                  </div>
                </div>
              </div>

              {/* MULTI-IMAGE UPLOAD */}
              <div className="form-section">
                <h4>Package Images</h4>
                <p className="section-hint">
                  Upload up to 10 images. The first image is used as the cover photo.
                  Drag thumbnails to reorder.
                </p>
                <PackageImageUploader
                  images={formData.images}
                  onChange={handleImagesChange}
                />
              </div>

              {/* Sessions */}
              <div className="form-section">
                <h4>Available Sessions</h4>
                <div className="checkbox-group">
                  {[
                    { key: "Day", label: "Day Session (8AM - 5PM)" },
                    { key: "Night", label: "Night Session (8PM - 6AM)" },
                    { key: "22hrs", label: "22-Hour Session" },
                  ].map(({ key, label }) => (
                    <label key={key} className="checkbox-label">
                      <input type="checkbox" checked={formData.availableSessions.includes(key)} onChange={() => handleSessionToggle(key)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing - Simplified */}
              {renderPricingFields()}

              {/* Inclusions */}
              <div className="form-section">
                <h4>Inclusions</h4>
                <div className="inclusions-list">
                  {formData.inclusions.map((inc, idx) => (
                    <div key={idx} className="inclusion-tag">
                      <span>{inc}</span>
                      <button type="button" onClick={() => handleRemoveInclusion(idx)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-inclusion">
                  <input
                    type="text"
                    value={inclusionInput}
                    onChange={(e) => setInclusionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInclusion())}
                    placeholder="Add an inclusion (e.g., Free WiFi)"
                  />
                  <button type="button" onClick={handleAddInclusion}>
                    <i className="fas fa-plus"></i> Add
                  </button>
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
            <button className="btn-primary" onClick={handleSubmit}>
              {editingPackage ? "Update" : "Create"} Package
            </button>
          </div>
        </Modal>
      )}

      {confirmationModal.isOpen && (
        <ConfirmationModal
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
        />
      )}
    </div>
  );
};

export default PackageManagement;