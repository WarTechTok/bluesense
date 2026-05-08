// frontend/src/pages/admin/PackageManagement.jsx
// ============================================
// PACKAGE MANAGEMENT - Admin only with multi-image upload
// ============================================

import React, { useState, useEffect } from "react";
import * as packageApi from "../../services/admin/packages";
import { refreshAllData } from "../../constants/packages";
import PackageImageUploader from "../../components/admin/PackageImageUploader";
import "./PackageManagement.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOasis, setSelectedOasis] = useState("Oasis 1");
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  // ── Images handler ───────────────────────────────────────
  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
      // Keep legacy `image` field synced to first image
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

  // ── Pricing ──────────────────────────────────────────────
  const handlePricingChange = (session, paxLevel, dayType, value) => {
    const newPricing = { ...formData.pricing };
    const numValue = parseInt(value) || 0;

    if (isPackageC() && paxLevel) {
      if (!newPricing[paxLevel]) newPricing[paxLevel] = {};
      if (!newPricing[paxLevel][session]) newPricing[paxLevel][session] = { weekday: 0, weekend: 0 };
      newPricing[paxLevel][session].weekday = numValue;
    } else {
      if (!newPricing[session]) newPricing[session] = { weekday: 0, weekend: 0 };
      newPricing[session][dayType] = numValue;
    }

    setFormData({ ...formData, pricing: newPricing });
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
      alert("Package name is required");
      return;
    }

    try {
      const packageData = {
        ...formData,
        // Ensure legacy image field mirrors first in array
        image: formData.images[0] || formData.image || "",
      };

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
      alert(`Package ${editingPackage ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Error saving package: " + error.message);
    }
  };

  // ── Edit ─────────────────────────────────────────────────
  const handleEdit = (pkg) => {
    setEditingPackage(pkg);

    let pricingData = pkg.pricing || {};

    if (pkg.name === "Package C") {
      if (!pricingData["50pax"]) pricingData["50pax"] = {};
      if (!pricingData["100pax"]) pricingData["100pax"] = {};
      ["Day", "Night", "22hrs"].forEach((session) => {
        if (!pricingData["50pax"][session]) pricingData["50pax"][session] = { weekday: 0 };
        if (!pricingData["100pax"][session]) pricingData["100pax"][session] = { weekday: 0 };
      });
    }

    // Build images array — use pkg.images if available, else fall back to legacy pkg.image
    let existingImages = [];
    if (pkg.images && pkg.images.length > 0) {
      existingImages = pkg.images;
    } else if (pkg.image) {
      // Legacy single image — wrap in array (resolve relative URLs)
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
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      try {
        await packageApi.deletePackage(pkg._id);
        await refreshAllData();
        fetchPackages();
        alert("Package deleted successfully!");
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Error deleting package");
      }
    }
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
      const fiftyPaxPrice = pkg.pricing?.["50pax"]?.Day?.weekday || 0;
      return `₱${fiftyPaxPrice.toLocaleString()}`;
    }
    const firstPrice = Object.values(pkg.pricing || {})[0]?.weekday || 0;
    return `₱${firstPrice.toLocaleString()}`;
  };

  // ── Pricing fields (unchanged logic) ────────────────────
  const renderPricingFields = () => {
    if (isPackageC()) {
      const minPax = formData.minCapacity || 50;
      const maxPax = formData.maxCapacity || 100;

      return (
        <div className="form-section">
          <h4>Pricing (₱)</h4>
          <div className="pricing-group">
            <h5 style={{ margin: "16px 0 8px 0", color: "#0284c7" }}>📊 PAX-Based Pricing</h5>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
              Based on min capacity ({minPax} PAX) and max capacity ({maxPax} PAX)
            </p>

            {[minPax, maxPax].map((pax) => (
              <div key={pax} style={{ marginBottom: "16px" }}>
                <h6 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>{pax} PAX</h6>
                <div className="pricing-table">
                  <div className="pricing-header">
                    <div className="pricing-cell">Session</div>
                    <div className="pricing-cell">Price</div>
                  </div>
                  {["Day", "Night", "22hrs"].map((session) =>
                    formData.availableSessions.includes(session) && (
                      <div key={session} className="pricing-row">
                        <div className="pricing-cell">{session}</div>
                        <div className="pricing-cell">
                          <input
                            type="number"
                            value={formData.pricing[`${pax}pax`]?.[session]?.weekday || ""}
                            onChange={(e) => handlePricingChange(session, `${pax}pax`, "weekday", e.target.value)}
                            placeholder={`Price for ${pax} PAX`}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-group" style={{ marginTop: "24px" }}>
            <h5 style={{ margin: "0 0 8px 0", color: "#f59e0b" }}>📅 Weekday / Weekend Pricing (Alternative)</h5>
            <div className="pricing-table">
              <div className="pricing-header">
                <div className="pricing-cell">Session</div>
                <div className="pricing-cell">Monday - Thursday</div>
                <div className="pricing-cell">Friday - Sunday</div>
              </div>
              {["Day", "Night", "22hrs"].map((session) =>
                formData.availableSessions.includes(session) && (
                  <div key={session} className="pricing-row">
                    <div className="pricing-cell">{session}</div>
                    <div className="pricing-cell">
                      <input type="number" value={formData.pricing[session]?.weekday || ""} onChange={(e) => handlePricingChange(session, null, "weekday", e.target.value)} placeholder="Weekday" />
                    </div>
                    <div className="pricing-cell">
                      <input type="number" value={formData.pricing[session]?.weekend || ""} onChange={(e) => handlePricingChange(session, null, "weekend", e.target.value)} placeholder="Weekend" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="form-section">
        <h4>Pricing (₱)</h4>
        <div className="pricing-table">
          <div className="pricing-header">
            <div className="pricing-cell">Session</div>
            <div className="pricing-cell">Monday - Thursday</div>
            <div className="pricing-cell">Friday - Sunday</div>
          </div>
          {["Day", "Night", "22hrs"].map((session) =>
            formData.availableSessions.includes(session) && (
              <div key={session} className="pricing-row">
                <div className="pricing-cell">{session}</div>
                <div className="pricing-cell">
                  <input type="number" value={formData.pricing[session]?.weekday || ""} onChange={(e) => handlePricingChange(session, null, "weekday", e.target.value)} placeholder="Weekday" />
                </div>
                <div className="pricing-cell">
                  <input type="number" value={formData.pricing[session]?.weekend || ""} onChange={(e) => handlePricingChange(session, null, "weekend", e.target.value)} placeholder="Weekend" />
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

                {/* Show first image or multi-image count badge */}
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
                    {pkg.name === "Package C" ? "for 50 PAX" : "weekday rate"}
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
          <div className="modal-container package-modal" onClick={(e) => e.stopPropagation()}>
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

                {/* ── MULTI-IMAGE UPLOAD ── */}
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

                {/* Pricing */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;