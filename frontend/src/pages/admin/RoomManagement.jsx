import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/admin/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as adminApi from '../../services/admin';
import { validateRoom } from '../../utils/adminValidation';
import './ManagementPages.css';
import './RoomCards.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoomForStaff, setSelectedRoomForStaff] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('Cleaning');
  const [staffNotes, setStaffNotes] = useState('');
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
    capacity: '',
    description: '',
    status: 'Available',
    oasis: 'Oasis 1',
    packageName: '',
    image: '',
    imageFile: null,
    appliances: ''
  });

  const fetchRooms = useCallback(async () => {
    try {
      const data = await adminApi.getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showFrontModalError('Error', 'Failed to fetch rooms');
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await adminApi.getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }, []);

  const fetchInspectionReports = useCallback(async () => {
    try {
      const reports = await adminApi.getInspectionReport();
      setInspectionReports(Array.isArray(reports) ? reports : []);
    } catch (error) {
      console.error('Error fetching pending inspection reports:', error);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchStaff();
    fetchInspectionReports();

    const refreshInterval = window.setInterval(() => {
      fetchRooms();
      fetchInspectionReports();
    }, 5000);

    return () => window.clearInterval(refreshInterval);
  }, [fetchRooms, fetchStaff, fetchInspectionReports]);

  const showConfirmationModal = (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        try {
          if (onConfirm) await onConfirm();
        } finally {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      confirmText,
      cancelText
    });
  };

  const showFrontModalError = (title, message) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Close'
    });
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        description: room.description,
        status: room.status,
        oasis: room.oasis || 'Oasis 1',
        packageName: room.packageName || '',
        image: room.image || '',
        imageFile: null,
        appliances: room.appliances ? room.appliances.join(', ') : ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        capacity: '',
        description: '',
        status: 'Available',
        oasis: 'Oasis 1',
        packageName: '',
        image: '',
        imageFile: null,
        appliances: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Guard: block submission if a selected image exceeds 100 MB
      if (formData.imageFile && formData.imageFile.size > 100 * 1024 * 1024) {
        setFormData(prev => ({ ...prev, imageFile: null }));
        showFrontModalError(
          'Validation Error',
          'Image size must be less than 100MB. Please compress your image.'
        );
        return;
      }

      // Remove price from validation
      const validation = validateRoom({ ...formData, price: 0 });
      if (!validation.isValid) {
        showFrontModalError('Validation Error', validation.error);
        return;
      }

      // Convert appliances string to array
      let roomData = {
        name: formData.name,
        capacity: formData.capacity,
        description: formData.description,
        status: formData.status,
        oasis: formData.oasis,
        packageName: formData.packageName,
        appliances: formData.appliances
          ? formData.appliances.split(',').map(a => a.trim()).filter(a => a !== '')
          : []
      };

      // Handle file upload if a new file is selected
      if (formData.imageFile) {
        try {
          const uploadRes = await adminApi.uploadRoomImage(formData.imageFile);
          roomData.image = uploadRes.imagePath;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          showFrontModalError('Error', 'Failed to upload image. Please try again.');
          return; // Block submission — do not save the room without its intended image
        }
      } else {
        // Keep existing image if no new file selected
        roomData.image = formData.image;
      }

      if (editingRoom) {
        await adminApi.updateRoom(editingRoom._id, roomData);
      } else {
        await adminApi.createRoom(roomData);
      }
      setIsModalOpen(false);
      fetchRooms();
      showFrontModalError('Success', 'Room saved successfully!');
    } catch (error) {
      console.error('Error saving room:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error saving room';
      showFrontModalError('Error', errorMsg);
    }
  };

  const handleDelete = async (id) => {
    showConfirmationModal(
      'Delete Room',
      'Are you sure you want to delete this room?',
      async () => {
        try {
          await adminApi.deleteRoom(id);
          fetchRooms();
          showConfirmationModal('Success', 'Room deleted successfully!', null, 'OK');
        } catch (error) {
          console.error('Error deleting room:', error);
          const errorMsg = error.response?.data?.error || error.message || 'Error deleting room';
          showFrontModalError('Error', errorMsg);
        }
      },
      'Yes, Delete',
      'Cancel'
    );
  };

  const handleOpenStaffModal = (room) => {
    setSelectedRoomForStaff(room);
    setSelectedStaffId('');
    setSelectedTaskType('Cleaning');
    setStaffNotes('');
    setIsStaffModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      showFrontModalError('Validation Error', 'Please select a staff member');
      return;
    }

    try {
      const taskDescription = staffNotes.trim() || `${selectedTaskType} task for the room`;

      await adminApi.assignStaffToRoom(selectedRoomForStaff._id, {
        staffId: selectedStaffId,
        taskType: selectedTaskType,
        notes: taskDescription
      });
      setIsStaffModalOpen(false);
      fetchRooms();
      showFrontModalError('Success', 'Staff assigned successfully!');
    } catch (error) {
      console.error('Error assigning staff:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error assigning staff';
      showFrontModalError('Error', errorMsg);
    }
  };

  const getInspectionForAssignment = (roomId, staffId) =>
    inspectionReports.find((report) =>
      report.roomId === roomId?.toString() && report.inspectedById === staffId?.toString()
    );

  const handleCloseInspectionReport = async (inspection) => {
    try {
      await adminApi.reviewInspectionReport(inspection._id);
      setSelectedInspection(null);
      await Promise.all([fetchRooms(), fetchInspectionReports()]);
    } catch (error) {
      console.error('Error closing inspection report:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to close inspection report';
      showFrontModalError('Error', errorMsg);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('[handleImageChange] File selected:', file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type})` : 'none');

    if (file) {
      if (!file.type.startsWith('image/')) {
        console.log('[handleImageChange] Rejected: not an image type');
        e.target.value = '';
        showFrontModalError('Validation Error', 'Please select a valid image file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        console.log('[handleImageChange] Rejected: file too large:', file.size, 'bytes');
        e.target.value = '';
        showFrontModalError('Validation Error', 'Image size must be less than 100MB');
        return;
      }
      console.log('[handleImageChange] Accepted file');
      setFormData({ ...formData, imageFile: file });
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Rooms</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Room</button>
      </div>

      {/* Room Cards View */}
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room._id} className="room-card">
            {/* Room Image */}
            <div className="room-image-wrap">
              {room.image ? (
                <img
                  src={room.image}
                  alt={room.name}
                  className="room-img"
                  onError={(e) => {
                    // Swap to placeholder on any load failure (broken local path, etc.)
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="room-img-placeholder"
                style={{ display: room.image ? 'none' : 'flex' }}
              >
                <span style={{ fontSize: '2rem' }}>🏊</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>No image</span>
              </div>
            </div>
            
            {/* Room Info */}
            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="oasis-badge">{room.oasis} - {room.packageName || 'General'}</p>
              <p className="description">{room.description}</p>
              
              {/* Stats - Price removed */}
              <div className="room-stats">
                <div className="stat">
                  <span className="label">Capacity:</span>
                  <span className="value">{room.capacity} pax</span>
                </div>
                <div className="stat">
                  <span className="label">Status:</span>
                  <span className={`status-badge status-${room.status.toLowerCase()}`}>{room.status}</span>
                </div>
              </div>

              {/* Appliances */}
              {room.appliances && room.appliances.length > 0 && (
                <div className="appliances">
                  <h4>🏠 Appliances & Amenities</h4>
                  <div className="appliance-list">
                    {room.appliances.map((appliance, idx) => (
                      <span key={idx} className="appliance-tag">✓ {appliance}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="room-actions">
                <button className="btn-secondary btn-small" onClick={() => handleOpenModal(room)}>Edit</button>
                <button 
                  className="btn-danger btn-small" 
                  onClick={() => handleDelete(room._id, room.name)}
                >
                  Delete
                </button>
                <button 
                  className="btn-primary btn-small" 
                  onClick={() => handleOpenStaffModal(room)}
                >
                  👥 Assign Staff
                </button>
              </div>

              {/* Assigned Staff */}
              {room.assignedStaff && room.assignedStaff.length > 0 && (
                <div className="assigned-staff">
                  <h5>👤 Assigned Staff</h5>
                  {room.assignedStaff.map((assignment, idx) => (
                    <div key={assignment.staffId?._id || idx} className="staff-assignment">
                      <span>{assignment.staffId?.name || 'Unknown'}</span>
                      {(() => {
                        const inspection = getInspectionForAssignment(
                          room._id,
                          assignment.staffId?._id
                        );
                        return (
                          <button
                            className="btn-small btn-secondary"
                            disabled={!inspection}
                            title={inspection ? 'View submitted inspection report' : 'Waiting for staff to submit an inspection report'}
                            onClick={() => inspection && setSelectedInspection(inspection)}
                          >
                            {inspection ? 'View Details' : 'Waiting for Report'}
                          </button>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h3>{editingRoom ? '✎ Edit Room' : '➕ Add New Room'}</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <form className="form landscape">
              <div className="form-group">
                <label>Room Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity <span className="required-asterisk">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              {/* Price field removed */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status <span className="required-asterisk">*</span></label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>
              <div className="form-group">
                <label>Oasis <span className="required-asterisk">*</span></label>
                <select
                  value={formData.oasis}
                  onChange={(e) => setFormData({ ...formData, oasis: e.target.value })}
                  required
                >
                  <option value="Oasis 1">Oasis 1</option>
                  <option value="Oasis 2">Oasis 2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g., Package 2, Package B, Package 5+"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Room Image</label>
                {/* Show current saved image (Cloudinary URL or legacy path) */}
                {formData.image && !formData.imageFile && (
                  <div className="current-image">
                    <img
                      src={formData.image}
                      alt="Current room"
                      style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* Shown only if image fails to load (old relative path) */}
                    <p style={{ display: 'none', fontSize: '0.8rem', color: '#ef4444', margin: '4px 0' }}>
                      ⚠️ Existing image path is no longer valid — please re-upload.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '6px 0 0' }}>
                      Current image · <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                        onClick={() => setFormData({ ...formData, image: '', imageFile: null })}
                      >Remove</button>
                    </p>
                  </div>
                )}
                {/* Preview of newly selected (not yet uploaded) file */}
                {formData.imageFile && (
                  <div className="current-image">
                    <img
                      src={URL.createObjectURL(formData.imageFile)}
                      alt="New room preview"
                      style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #10b981' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#10b981', margin: '6px 0 0' }}>
                      ✓ New image selected (will upload on save) · <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                        onClick={() => setFormData({ ...formData, imageFile: null })}
                      >Cancel</button>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: (formData.image || formData.imageFile) ? '10px' : '0' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  Supported: JPG, PNG, WebP · Max 100 MB
                </p>
              </div>
              <div className="form-group">
                <label>Appliances & Amenities</label>
                <textarea
                  placeholder="Enter appliances separated by commas&#10;e.g., Air Conditioning, Smart TV, WiFi, Fridge"
                  value={formData.appliances}
                  onChange={(e) => setFormData({ ...formData, appliances: e.target.value })}
                  rows="4"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>{editingRoom ? 'Update' : 'Create'} Room</button>
          </div>
        </Modal>
      )}

      {isStaffModalOpen && (
        <Modal onClose={() => setIsStaffModalOpen(false)}>
          <div className="modal-header">
            <h3>👥 Assign Staff to {selectedRoomForStaff?.name || 'Room'}</h3>
            <button className="modal-close" onClick={() => setIsStaffModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <form className="form">
              <div className="form-group">
                <label>Select Staff Member (Housekeeper) *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Housekeeper --</option>
                  {staff.filter(member => member.position === 'Housekeeper').map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.staffId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task Type *</label>
                <select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value)}
                  required
                >
                  <option value="Cleaning">🧹 Cleaning</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Inspection">🔍 Inspection</option>
                  <option value="Setup">⚙️ Setup</option>
                  <option value="Repair">🛠️ Repair</option>
                  <option value="Other">📋 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>What specific task should the housekeeper do? *</label>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g., Deep clean the bathroom, replace towels, and restock toiletries"
                  rows="3"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsStaffModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAssignStaff}>Assign Staff</button>
          </div>
        </Modal>
      )}

      {/* ── Inspection Report Modal ─────────────────────────────────────── */}
      {selectedInspection && (
        <Modal onClose={() => setSelectedInspection(null)}>

          {/* Header */}
          <div className="modal-header irm-modal-header">
            <div className="irm-header-meta">
              <span className="irm-badge">Inspection Report</span>
              <h3 className="irm-title">Room Review</h3>
            </div>
            <button className="modal-close" onClick={() => setSelectedInspection(null)}>✕</button>
          </div>

          {/* Scrollable body */}
          <div className="modal-body irm-body">

            {/* Proof image banner */}
            <div className="irm-image-banner">
              {selectedInspection.proofImages?.length > 0 ? (
                <div className="irm-image-strip">
                  {selectedInspection.proofImages.map((img, i) => (
                    <a key={`${img}-${i}`} href={img} target="_blank" rel="noreferrer" className="irm-image-thumb">
                      <img src={img} alt={`Proof ${i + 1}`} />
                      <span className="irm-expand-hint">↗ Full size</span>
                    </a>
                  ))}
                </div>
              ) : selectedInspection.proofImage ? (
                <a href={selectedInspection.proofImage} target="_blank" rel="noreferrer" className="irm-image-single">
                  <img src={selectedInspection.proofImage} alt="Inspection proof" />
                  <span className="irm-expand-hint">↗ Full size</span>
                </a>
              ) : (
                <div className="irm-no-image">
                  <span>🖼️</span>
                  <p>No proof image submitted</p>
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="irm-section">
              <p className="irm-section-title">Overview</p>
              <div className="irm-grid irm-grid--3">
                <div className="irm-card">
                  <span className="irm-label">Room</span>
                  <span className="irm-value">{selectedInspection.roomName || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Inspected by</span>
                  <span className="irm-value">{selectedInspection.inspectedBy || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Date</span>
                  <span className="irm-value irm-value--sm">
                    {selectedInspection.date ? new Date(selectedInspection.date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Status</span>
                  <span className={`irm-status-chip irm-status--${(selectedInspection.status || 'submitted').toLowerCase()}`}>
                    {selectedInspection.status || 'Submitted'}
                  </span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Rating</span>
                  <span className="irm-value irm-value--accent">
                    {selectedInspection.rating ?? 'N/A'}<span className="irm-value--muted"> / 10</span>
                  </span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Room status before</span>
                  <span className="irm-value">{selectedInspection.roomStatusBeforeInspection || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Task */}
            <div className="irm-section">
              <p className="irm-section-title">Task</p>
              <div className="irm-grid irm-grid--2">
                <div className="irm-card">
                  <span className="irm-label">Type</span>
                  <span className="irm-value">{selectedInspection.task?.title || selectedInspection.task?.taskType || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Description</span>
                  <span className="irm-value irm-value--normal">{selectedInspection.task?.description || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="irm-section">
              <p className="irm-section-title">Condition</p>
              <div className="irm-grid irm-grid--3">
                <div className="irm-card">
                  <span className="irm-label">Cleanliness</span>
                  <span className="irm-value">{selectedInspection.cleanliness || selectedInspection.condition || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Furniture</span>
                  <span className="irm-value">{selectedInspection.furnitureCondition || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Cleaning needed</span>
                  <span className="irm-value">{selectedInspection.cleaningNeeded || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Electricity</span>
                  <span className="irm-value">{selectedInspection.electricityStatus || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Plumbing</span>
                  <span className="irm-value">{selectedInspection.plumbingStatus || 'N/A'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Maintenance required</span>
                  <span className="irm-value">{selectedInspection.maintenanceRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Damage & Maintenance */}
            <div className="irm-section">
              <p className="irm-section-title">Damage &amp; Maintenance</p>
              <div className="irm-grid irm-grid--2">
                <div className="irm-card">
                  <span className="irm-label">Damage found</span>
                  <span className="irm-value">{selectedInspection.damageFound || 'No'}</span>
                </div>
                <div className="irm-card">
                  <span className="irm-label">Items needed</span>
                  <span className="irm-value irm-value--normal">{selectedInspection.itemsNeeded || 'None'}</span>
                </div>
                <div className="irm-card irm-card--span2">
                  <span className="irm-label">Damage description</span>
                  <span className="irm-value irm-value--normal">{selectedInspection.damageDescription || 'None'}</span>
                </div>
                <div className="irm-card irm-card--span2">
                  <span className="irm-label">Maintenance notes</span>
                  <span className="irm-value irm-value--normal">{selectedInspection.maintenanceNotes || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Additional notes */}
            {selectedInspection.notes && selectedInspection.notes !== 'None' && (
              <div className="irm-section">
                <p className="irm-section-title">Additional Notes</p>
                <p className="irm-notes-block">{selectedInspection.notes}</p>
              </div>
            )}

          </div>{/* end modal-body */}

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setSelectedInspection(null)}>
              Close
            </button>
            <button className="irm-btn-confirm" onClick={() => handleCloseInspectionReport(selectedInspection)}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
                <path d="M12.5 3.5L6 10.5L2.5 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Mark Reviewed &amp; Remove Staff
            </button>
          </div>

        </Modal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />
    </div>
  );
};

export default RoomManagement;