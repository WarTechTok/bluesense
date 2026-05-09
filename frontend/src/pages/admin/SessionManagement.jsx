// frontend/src/pages/admin/SessionManagement.jsx
// ============================================
// SESSION MANAGEMENT - Admin only
// Manage session times and downpayment amounts
// ============================================

import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as sessionApi from '../../services/admin/sessions';
import './SessionManagement.css';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
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
    name: '',
    displayName: '',
    startTime: '',
    endTime: '',
    description: '',
    downpaymentAmount: 3000,
    isActive: true
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionApi.getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      showConfirmationModal('Validation Error', 'Session name, start time, and end time are required', null, 'OK');
      return;
    }
    
    try {
      if (editingSession) {
        await sessionApi.updateSession(editingSession._id, formData);
      } else {
        await sessionApi.createSession(formData);
      }
      setShowModal(false);
      fetchSessions();
      resetForm();
      showConfirmationModal('Success', `Session ${editingSession ? 'updated' : 'created'} successfully!`, null, 'OK');
    } catch (error) {
      console.error('Error saving session:', error);
      showConfirmationModal('Error', 'Error saving session: ' + error.message, null, 'OK');
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      displayName: session.displayName,
      startTime: session.startTime,
      endTime: session.endTime,
      description: session.description || '',
      downpaymentAmount: session.downpaymentAmount,
      isActive: session.isActive !== false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSession(null);
    setFormData({
      name: '',
      displayName: '',
      startTime: '',
      endTime: '',
      description: '',
      downpaymentAmount: 3000,
      isActive: true
    });
  };

  const getSessionIcon = (name) => {
    switch(name) {
      case 'Day': return 'fas fa-sun';
      case 'Night': return 'fas fa-moon';
      case '22hrs': return 'fas fa-clock';
      default: return 'fas fa-calendar';
    }
  };

  return (
    <div className="session-management">
      {/* Hero Section */}
      <div className="session-hero">
        <div className="session-hero-content">
          <span className="hero-badge">Admin Panel</span>
          <h1>Session Management</h1>
          <p>Manage session times and downpayment amounts</p>
        </div>
      </div>

      <div className="session-container">
        {/* Sessions Grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading sessions...</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div key={session._id} className={`session-card ${!session.isActive ? 'inactive' : ''}`}>
                <div className="session-header">
                  <div className="session-icon">
                    <i className={getSessionIcon(session.name)}></i>
                  </div>
                  <div className="session-info">
                    <h3 className="session-name">{session.displayName}</h3>
                    <p className="session-time">{session.startTime} - {session.endTime}</p>
                  </div>
                  <div className="session-actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(session)}>
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div className="session-details">
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{session.description || 'No description'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Downpayment:</span>
                    <span className="value price">₱{session.downpaymentAmount?.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${session.isActive ? 'active' : 'inactive'}`}>
                      {session.isActive ? 'Active' : 'Inactive'}
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
          <div className="modal-container session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <form className="session-form">
                <div className="form-group">
                  <label>Session Name *</label>
                  <select value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}>
                    <option value="">Select Session</option>
                    <option value="Day">Day Session</option>
                    <option value="Night">Night Session</option>
                    <option value="22hrs">22-Hour Session</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} placeholder="e.g., Day Session" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time (24hr) *</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Time (24hr) *</label>
                    <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" placeholder="Session description" />
                </div>

                <div className="form-group">
                  <label>Downpayment Amount (₱)</label>
                  <input type="number" value={formData.downpaymentAmount} onChange={(e) => setFormData({ ...formData, downpaymentAmount: parseInt(e.target.value) })} min="0" step="500" />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                    <span>Active (available for booking)</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>{editingSession ? 'Update' : 'Create'} Session</button>
            </div>
          </div>
        </div>
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

export default SessionManagement;