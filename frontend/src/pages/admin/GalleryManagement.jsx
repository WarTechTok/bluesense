// frontend/src/pages/admin/GalleryManagement.jsx
// ============================================
// GALLERY MANAGEMENT - Upload, reorder (drag & drop), edit, delete
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAllGalleryImagesAdmin,
  uploadGalleryImage,
  updateGalleryImage,
  reorderGalleryImages,
  deleteGalleryImage,
} from '../../services/admin/gallery';
import './GalleryManagement.css';

// ── Confirmation Modal ───────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="gm-overlay" onClick={onCancel}>
    <div className="gm-modal gm-confirm-modal" onClick={(e) => e.stopPropagation()}>
      <div className="gm-modal-header">
        <h3>{title}</h3>
        <button className="gm-close-btn" onClick={onCancel}>✕</button>
      </div>
      <div className="gm-modal-body">
        <p>{message}</p>
      </div>
      <div className="gm-modal-footer">
        <button className="gm-btn gm-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="gm-btn gm-btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────
const EditModal = ({ image, onSave, onClose, loading }) => {
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description || '');
  const [isActive, setIsActive] = useState(image.isActive);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(image._id, { title: title.trim(), description: description.trim(), isActive });
  };

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gm-modal-header">
          <h3>Edit Image</h3>
          <button className="gm-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="gm-modal-body">
          <img src={image.imageUrl} alt={image.title} className="gm-edit-preview" />
          <div className="gm-form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="gm-input"
              placeholder="e.g. Swimming Pool"
              maxLength={100}
            />
          </div>
          <div className="gm-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="gm-input gm-textarea"
              placeholder="Short caption for the image…"
              maxLength={300}
              rows={3}
            />
          </div>
          <div className="gm-form-group gm-toggle-row">
            <label>Visible on gallery page</label>
            <button
              type="button"
              className={`gm-toggle ${isActive ? 'gm-toggle-on' : ''}`}
              onClick={() => setIsActive(!isActive)}
            >
              <span className="gm-toggle-knob" />
            </button>
          </div>
        </div>
        <div className="gm-modal-footer">
          <button className="gm-btn gm-btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="gm-btn gm-btn-primary"
            onClick={handleSave}
            disabled={loading || !title.trim()}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Upload Panel ─────────────────────────────────────────────
const UploadPanel = ({ onUpload, uploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
    // Auto-fill title from filename if empty
    if (!title) {
      const name = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    await onUpload(file, title.trim(), description.trim());
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="gm-upload-panel">
      <h2 className="gm-section-title">Upload New Image</h2>

      {/* Drop zone */}
      <div
        className={`gm-dropzone ${dragOver ? 'gm-dropzone-active' : ''} ${preview ? 'gm-dropzone-has-preview' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="gm-drop-preview">
            <img src={preview} alt="preview" />
            <button
              className="gm-remove-preview"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="gm-drop-prompt">
            <div className="gm-drop-icon">
              <i className="fas fa-cloud-upload-alt" />
            </div>
            <p>Drop an image here or <span>browse</span></p>
            <p className="gm-drop-hint">JPG, PNG, WebP — max 5 MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Fields */}
      <div className="gm-form-group">
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="gm-input"
          placeholder="e.g. Swimming Pool"
          maxLength={100}
        />
      </div>
      <div className="gm-form-group">
        <label>Description <span className="gm-optional">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="gm-input gm-textarea"
          placeholder="Short caption shown on hover…"
          maxLength={300}
          rows={2}
        />
      </div>

      <button
        className="gm-btn gm-btn-primary gm-upload-btn"
        onClick={handleSubmit}
        disabled={!file || !title.trim() || uploading}
      >
        {uploading ? (
          <><i className="fas fa-spinner fa-spin" /> Uploading…</>
        ) : (
          <><i className="fas fa-upload" /> Upload Image</>
        )}
      </button>
    </div>
  );
};

// ── Draggable Image Card ─────────────────────────────────────
const ImageCard = ({
  image, index,
  onEdit, onDelete,
  onDragStart, onDragOver, onDrop, onDragEnd,
  isDraggedOver,
}) => (
  <div
    className={`gm-card ${isDraggedOver ? 'gm-card-drag-over' : ''} ${!image.isActive ? 'gm-card-inactive' : ''}`}
    draggable
    onDragStart={() => onDragStart(index)}
    onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
    onDrop={() => onDrop(index)}
    onDragEnd={onDragEnd}
  >
    <div className="gm-card-drag-handle">
      <i className="fas fa-grip-vertical" />
    </div>
    <div className="gm-card-img-wrap">
      <img src={image.imageUrl} alt={image.title} loading="lazy" />
      {!image.isActive && <div className="gm-card-hidden-badge">Hidden</div>}
    </div>
    <div className="gm-card-info">
      <p className="gm-card-title">{image.title}</p>
      {image.description && <p className="gm-card-desc">{image.description}</p>}
    </div>
    <div className="gm-card-actions">
      <button className="gm-icon-btn gm-icon-btn-edit" onClick={() => onEdit(image)} title="Edit">
        <i className="fas fa-pencil-alt" />
      </button>
      <button className="gm-icon-btn gm-icon-btn-delete" onClick={() => onDelete(image)} title="Delete">
        <i className="fas fa-trash" />
      </button>
    </div>
    <div className="gm-card-order">#{index + 1}</div>
  </div>
);

// ── Main Component ───────────────────────────────────────────
const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Drag state
  const dragIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const reorderTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllGalleryImagesAdmin();
      setImages(data);
    } catch (err) {
      showToast('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // ── Upload ───────────────────────────────
  const handleUpload = async (file, title, description) => {
    setUploading(true);
    try {
      const newImage = await uploadGalleryImage(file, title, description);
      setImages((prev) => [...prev, newImage]);
      showToast(`"${newImage.title}" uploaded successfully`);
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Edit ─────────────────────────────────
  const handleEditSave = async (id, updates) => {
    setEditLoading(true);
    try {
      const updated = await updateGalleryImage(id, updates);
      setImages((prev) => prev.map((img) => (img._id === id ? updated : img)));
      setEditTarget(null);
      showToast('Image updated');
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ───────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteGalleryImage(deleteTarget._id);
      setImages((prev) => prev.filter((img) => img._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast('Image deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Drag & Drop Reorder ──────────────────
  const handleDragStart = (index) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...images];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    setImages(reordered);

    // Debounce the API call so rapid drags don't hammer the server
    clearTimeout(reorderTimeoutRef.current);
    reorderTimeoutRef.current = setTimeout(async () => {
      try {
        await reorderGalleryImages(reordered.map((img) => img._id));
        showToast('Order saved');
      } catch (err) {
        showToast('Failed to save order', 'error');
        fetchImages(); // Re-fetch to restore true state
      }
    }, 600);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const activeCount = images.filter((i) => i.isActive).length;

  return (
    <div className="management-page gm-page">

      {/* Toast */}
      {toast && (
        <div className={`gm-toast gm-toast-${toast.type}`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Gallery Management</h1>
          <p className="gm-subtitle">
            {images.length} image{images.length !== 1 ? 's' : ''} total · {activeCount} visible
          </p>
        </div>
      </div>

      <div className="gm-layout">
        {/* Left: Upload Panel */}
        <aside className="gm-sidebar">
          <UploadPanel onUpload={handleUpload} uploading={uploading} />

          <div className="gm-hint-box">
            <i className="fas fa-info-circle" />
            <div>
              <strong>Drag to reorder</strong>
              <p>Drag the grip handle on any card to change the display order on the Gallery page.</p>
            </div>
          </div>
        </aside>

        {/* Right: Image Grid */}
        <main className="gm-grid-area">
          <h2 className="gm-section-title">
            All Images
            <span className="gm-section-badge">{images.length}</span>
          </h2>

          {loading ? (
            <div className="gm-loading">
              <div className="gm-spinner" />
              <p>Loading images…</p>
            </div>
          ) : images.length === 0 ? (
            <div className="gm-empty">
              <i className="fas fa-images" />
              <p>No images yet. Upload your first gallery image to get started.</p>
            </div>
          ) : (
            <div className="gm-grid">
              {images.map((image, index) => (
                <ImageCard
                  key={image._id}
                  image={image}
                  index={index}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDraggedOver={dragOverIndex === index && dragIndexRef.current !== index}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          image={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Image"
          message={`Delete "${deleteTarget.title}"? This will permanently remove it from Cloudinary and cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default GalleryManagement;