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
      showConfirmationModal('Error', 'Failed to fetch rooms', null, 'OK');
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

  useEffect(() => {
    fetchRooms();
    fetchStaff();
  }, [fetchRooms, fetchStaff]);

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
      // Remove price from validation
      const validation = validateRoom({ ...formData, price: 0 });
      if (!validation.isValid) {
        showConfirmationModal('Validation Error', validation.error, null, 'OK');
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
          showConfirmationModal('Error', 'Failed to upload image. Saving room without image.', null, 'OK');
          roomData.image = formData.image; // Keep existing image path if upload fails
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
      showConfirmationModal('Success', 'Room saved successfully!', null, 'OK');
    } catch (error) {
      console.error('Error saving room:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error saving room';
      showConfirmationModal('Error', errorMsg, null, 'OK');
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
          showConfirmationModal('Error', errorMsg, null, 'OK');
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
      showConfirmationModal('Validation Error', 'Please select a staff member', null, 'OK');
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
      showConfirmationModal('Success', 'Staff assigned successfully!', null, 'OK');
    } catch (error) {
      console.error('Error assigning staff:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error assigning staff';
      showConfirmationModal('Error', errorMsg, null, 'OK');
    }
  };

  const handleRemoveStaff = async (roomId, staffId, staffName) => {
    showConfirmationModal(
      'Remove Staff',
      `Are you sure you want to remove ${staffName} from this room?`,
      async () => {
        try {
          await adminApi.removeStaffFromRoom(roomId, staffId);
          fetchRooms();
          showConfirmationModal('Success', 'Staff removed successfully!', null, 'OK');
        } catch (error) {
          console.error('Error removing staff:', error);
          const errorMsg = error.response?.data?.error || error.message || 'Error removing staff';
          showConfirmationModal('Error', errorMsg, null, 'OK');
        }
      },
      'Yes, Remove',
      'Cancel'
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('[handleImageChange] File selected:', file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type})` : 'none');

    if (file) {
      if (!file.type.startsWith('image/')) {
        console.log('[handleImageChange] Rejected: not an image type');
        e.target.value = '';
        showConfirmationModal('Validation Error', 'Please select a valid image file', null, 'OK');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        console.log('[handleImageChange] Rejected: file too large:', file.size, 'bytes');
        e.target.value = '';
        showConfirmationModal('Validation Error', 'Image size must be less than 100MB', null, 'OK');
        return;
      }
      console.log('[handleImageChange] Accepted file');
      setFormData({ ...formData, imageFile: file });
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Room Management</h1>
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
                    <div key={idx} className="staff-assignment">
                      <span>{assignment.staffId?.name || 'Unknown'}</span>
                      <button 
                        className="btn-small btn-remove"
                        onClick={() => handleRemoveStaff(room._id, assignment.staffId._id, assignment.staffId?.name)}
                      >
                        Remove
                      </button>
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
                <label>Room Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
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
                <label>Status *</label>
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
                <label>Oasis *</label>
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