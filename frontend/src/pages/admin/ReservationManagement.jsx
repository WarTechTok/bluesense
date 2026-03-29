import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import * as adminApi from '../../services/admin/adminApi';
import { validateReservation } from '../../utils/adminValidation';
import './ManagementPages.css';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    bookingDetails: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await adminApi.getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleOpenModal = (reservation = null) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData(reservation);
    } else {
      setEditingReservation(null);
      setFormData({
        guestName: '',
        guestEmail: '',
        checkIn: '',
        checkOut: '',
        bookingDetails: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleConfirm = async (id) => {
    try {
      await adminApi.confirmReservation(id);
      fetchReservations();
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert('Error confirming reservation');
    }
  };

  const handleCancel = async (id) => {
    try {
      await adminApi.cancelReservation(id);
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Error cancelling reservation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await adminApi.deleteReservation(id);
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error deleting reservation');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // ============================================
      // FORM VALIDATION USING UTILITY
      // ============================================
      const validation = validateReservation(formData);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      if (editingReservation) {
        await adminApi.updateReservation(editingReservation._id, formData);
      } else {
        await adminApi.createReservation(formData);
      }
      setIsModalOpen(false);
      fetchReservations();
      alert('✅ Reservation saved successfully!');
    } catch (error) {
      console.error('Error saving reservation:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error saving reservation';
      alert('❌ ' + errorMsg);
    }
  };

  const columns = [
    { key: 'guestName', label: 'Guest Name' },
    { key: 'guestEmail', label: 'Guest Email' },
    { key: 'checkIn', label: 'Check-In', render: (value) => new Date(value).toLocaleDateString() },
    { key: 'checkOut', label: 'Check-Out', render: (value) => new Date(value).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> }
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Reservation Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Reservation</button>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        onEdit={handleOpenModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        title={editingReservation ? 'Edit Reservation' : 'Add New Reservation'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <form className="form landscape">
          <div className="form-group">
            <label>Guest Name *</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Guest Email *</label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Check-In Date *</label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Check-Out Date *</label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Booking Details</label>
            <textarea
              value={formData.bookingDetails}
              onChange={(e) => setFormData({ ...formData, bookingDetails: e.target.value })}
              placeholder="Special requests, notes, etc."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReservationManagement;
