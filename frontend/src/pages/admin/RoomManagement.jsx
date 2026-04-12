import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as adminApi from '../../services/admin/adminApi';
import { validateRoom } from '../../utils/adminValidation';
import './ManagementPages.css';

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
    status: 'Available'
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
      setFormData(room);
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        capacity: '',
        price: '',
        description: '',
        status: 'Available'
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

      if (editingRoom) {
        await adminApi.updateRoom(editingRoom._id, formData);
      } else {
        await adminApi.createRoom(formData);
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

  const columns = [
    { key: 'name', label: 'Room Name' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'price', label: 'Price', render: (value) => `₱${value}` },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status', render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> },
    {
      key: 'assignedStaff',
      label: 'Assigned Staff',
      render: (staff, room) => (
        <div className="staff-list">
          {staff && staff.length > 0 ? (
            <div>
              {staff.map((assignment, idx) => (
                <div key={idx} className="staff-item">
                  <span>{assignment.staffId?.name || 'Unknown Staff'}</span>
                  <button 
                    className="btn-small btn-remove"
                    onClick={() => handleRemoveStaff(room._id, assignment.staffId._id, assignment.staffId?.name)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                className="btn-small btn-add-staff"
                onClick={() => handleOpenStaffModal(room)}
              >
                + Add Staff
              </button>
            </div>
          ) : (
            <button 
              className="btn-small btn-add-staff"
              onClick={() => handleOpenStaffModal(room)}
            >
              + Assign Staff
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Room Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Room</button>
      </div>

      <DataTable
        columns={columns}
        data={rooms}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
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
        </form>
      </Modal>

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        title={`Assign Staff to ${selectedRoomForStaff?.name || 'Room'}`}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleAssignStaff}
      >
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
      </Modal>

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