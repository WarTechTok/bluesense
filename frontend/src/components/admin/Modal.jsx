// ============================================
// MODAL COMPONENT
// ============================================
// Reusable modal dialog for forms and confirmations
// Features: Overlay with fade-in animation, slide-in modal
// Supports: Form submission with onSubmit callback
// Optional footer with Cancel and Submit buttons
// Click outside modal to close (overlay click)

import React from 'react';
import './Modal.css';

// ============================================
// MODAL - COMPONENT RENDER
// ============================================
// Props:
//   - isOpen: Boolean to show/hide modal
//   - title: Modal header text
//   - onClose: Callback when close button or overlay clicked
//   - children: Modal body content (form fields, text, etc.)
//   - onSubmit: Optional callback for Submit button click
// Behavior:
//   - Only renders if isOpen = true
//   - Click outside modal (overlay) triggers onClose
//   - Shows Submit/Cancel buttons only if onSubmit provided
const Modal = ({ isOpen, title, onClose, children, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {onSubmit ? (
          <div className="modal-footer">
            <button type="button" className="btn-cancel-modal" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-submit" onClick={onSubmit}>Save</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;
