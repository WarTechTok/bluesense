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
//   - onClose: Callback when close button or overlay clicked
//   - children: Full modal content including header, body, and footer
// Behavior:
//   - Renders modal overlay with click-to-close on backdrop
//   - Children should contain complete modal structure (header, body, footer)
//   - Click outside modal (overlay) triggers onClose
const Modal = ({ onClose, children }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
