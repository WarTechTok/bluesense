// src/components/admin/PackageImageUploader.jsx
// ============================================
// MULTI-IMAGE UPLOADER - Drag & drop, reorder, delete
// ============================================

import React, { useState, useRef, useCallback } from "react";
import "./PackageImageUploader.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const PackageImageUploader = ({ images = [], onChange, packageId, onAlert }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Helper to show alerts as modals if parent provides handler, otherwise use alert
  const showAlert = (title, message) => {
    if (onAlert) {
      onAlert(title, message);
    } else {
      alert(message);
    }
  };

  // ── Upload files to backend ──────────────────────────────
  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const remaining = 10 - images.length;
    if (remaining <= 0) {
      showAlert("Upload Limit", "Maximum 10 images per package.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    const validFiles = filesToUpload.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      validFiles.forEach((f) => formData.append("images", f));

      // Simulate progress with XHR for UX feel
      const simulateProgress = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 12, 85));
      }, 200);

      const res = await fetch(`${API_BASE_URL}/api/admin/packages/upload-images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(simulateProgress);
      setUploadProgress(100);

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const newImages = [...images, ...data.imageUrls];
      onChange(newImages);
    } catch (err) {
      console.error("Upload error:", err);
      showAlert("Upload Error", "Image upload failed. Please try again.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 600);
    }
  }, [images, onChange]);

  // ── Drop zone handlers ───────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  // ── Reorder via drag ─────────────────────────────────────
  const handleThumbDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleThumbDragOver = (e, index) => {
    e.preventDefault();
    if (index !== draggedIndex) setDragOverIndex(index);
  };

  const handleThumbDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleThumbDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  // ── Lightbox ─────────────────────────────────────────────
  const handleLightboxNav = (dir) => {
    setLightboxIndex((prev) =>
      (prev + dir + images.length) % images.length
    );
  };

  return (
    <div className="pkg-uploader">
      {/* Drop zone */}
      <div
        className={`pkg-dropzone ${dragOver ? "drag-over" : ""} ${images.length >= 10 ? "at-limit" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => images.length < 10 && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="pkg-upload-progress">
            <div className="progress-ring">
              <svg viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" />
                <circle
                  cx="22" cy="22" r="18"
                  style={{ strokeDashoffset: `${113 - (uploadProgress / 100) * 113}px` }}
                />
              </svg>
              <span>{uploadProgress}%</span>
            </div>
            <p>Uploading images…</p>
          </div>
        ) : (
          <>
            <div className="dropzone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {images.length >= 10 ? (
              <p className="dropzone-limit">Maximum 10 images reached</p>
            ) : (
              <>
                <p className="dropzone-primary">
                  <strong>Drag & drop images here</strong>
                </p>
                <p className="dropzone-secondary">
                  or <span className="dropzone-link">click to browse</span>
                </p>
                <p className="dropzone-hint">
                  PNG, JPG, WEBP · Max 5MB each · {10 - images.length} slot{10 - images.length !== 1 ? "s" : ""} remaining
                </p>
              </>
            )}
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {/* Thumbnail gallery */}
      {images.length > 0 && (
        <div className="pkg-gallery">
          <div className="pkg-gallery-header">
            <span className="gallery-label">
              {images.length} image{images.length !== 1 ? "s" : ""}
              {images.length > 1 && " · drag to reorder · first image is the cover"}
            </span>
          </div>
          <div className="pkg-thumbs">
            {images.map((url, index) => (
              <div
                key={url + index}
                className={`pkg-thumb ${index === 0 ? "primary" : ""} ${draggedIndex === index ? "dragging" : ""} ${dragOverIndex === index ? "drop-target" : ""}`}
                draggable
                onDragStart={(e) => handleThumbDragStart(e, index)}
                onDragOver={(e) => handleThumbDragOver(e, index)}
                onDrop={(e) => handleThumbDrop(e, index)}
                onDragEnd={handleThumbDragEnd}
              >
                <img
                  src={url}
                  alt={`Package ${index + 1}`}
                  onClick={() => setLightboxIndex(index)}
                />
                {index === 0 && (
                  <span className="primary-badge">Cover</span>
                )}
                <div className="thumb-actions">
                  <button
                    type="button"
                    className="thumb-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    title="Remove image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="thumb-view"
                    onClick={() => setLightboxIndex(index)}
                    title="View full size"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="thumb-drag-handle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
                  </svg>
                </div>
              </div>
            ))}

            {/* Add more slot */}
            {images.length < 10 && (
              <div
                className="pkg-thumb add-more"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round"/>
                </svg>
                <span>Add more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="pkg-lightbox"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lb-close" onClick={() => setLightboxIndex(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button className="lb-nav lb-prev" onClick={() => handleLightboxNav(-1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="lb-nav lb-next" onClick={() => handleLightboxNav(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}

            <img src={images[lightboxIndex]} alt={`Full view ${lightboxIndex + 1}`} />

            <div className="lb-counter">
              {lightboxIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <div className="lb-thumbs">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Thumbnail view`}
                    className={i === lightboxIndex ? "active" : ""}
                    onClick={() => setLightboxIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageImageUploader;