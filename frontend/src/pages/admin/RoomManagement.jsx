import React, { useState, useEffect, useCallback } from 'react';
// Remove unused DataTable import
// import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as adminApi from '../../services/admin/adminApi';
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
    price: '',
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
      onConfirm: () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
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
        price: room.price,
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
        price: '',
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
      const validation = validateRoom(formData);
      if (!validation.isValid) {
        showConfirmationModal('Validation Error', validation.error, null, 'OK');
        return;
      }

      // Convert appliances string to array
      let roomData = {
        ...formData,
        appliances: formData.appliances
          ? formData.appliances.split(',').map(a => a.trim()).filter(a => a !== '')
          : []
      };

      // Handle file upload if a new file is selected
      if (formData.imageFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('image', formData.imageFile);
        
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
      'Are you sure you want to delete this room? This action cannot be undone.',
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
    setStaffNotes('');
    setIsStaffModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      showConfirmationModal('Validation Error', 'Please select a staff member', null, 'OK');
      return;
    }

    try {
      await adminApi.assignStaffToRoom(selectedRoomForStaff._id, {
        staffId: selectedStaffId,
        notes: staffNotes
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
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showConfirmationModal('Validation Error', 'Please select a valid image file', null, 'OK');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showConfirmationModal('Validation Error', 'Image size must be less than 5MB', null, 'OK');
        return;
      }
      setFormData({ ...formData, imageFile: file });
    }
  };

  // Remove the unused columns variable or comment it out
  // const columns = [
  //   { key: 'name', label: 'Room Name' },
  //   { key: 'capacity', label: 'Capacity' },
  //   { key: 'price', label: 'Price', render: (value) => `₱${value}` },
  //   { key: 'oasis', label: 'Oasis' },
  //   { key: 'description', label: 'Description' },
  //   { key: 'status', label: 'Status', render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> }
  // ];

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
            {room.image && (
              <div className="room-image">
                <img src={room.image} alt={room.name} onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'} />
              </div>
            )}
            
            {/* Room Info */}
            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="oasis-badge">{room.oasis} - {room.packageName || 'General'}</p>
              <p className="description">{room.description}</p>
              
              {/* Stats */}
              <div className="room-stats">
                <div className="stat">
                  <span className="label">Capacity:</span>
                  <span className="value">{room.capacity} pax</span>
                </div>
                <div className="stat">
                  <span className="label">Price:</span>
                  <span className="value">₱{room.price.toLocaleString()}</span>
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
              <div className="form-group">
                <label>Price per Night (₱) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
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
                {formData.image && !formData.imageFile && (
                  <div className="current-image">
                    <img src={formData.image} alt="Room" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '6px' }} />
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0' }}>Current image</p>
                  </div>
                )}
                {formData.imageFile && (
                  <div className="current-image">
                    <img src={URL.createObjectURL(formData.imageFile)} alt="New room" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '6px' }} />
                    <p style={{ fontSize: '0.85rem', color: '#10b981', margin: '8px 0' }}>New image selected</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: formData.image || formData.imageFile ? '10px' : '0' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB</p>
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
                <label>Select Staff Member *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Staff --</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g., Responsible for daily cleaning and inspection"
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