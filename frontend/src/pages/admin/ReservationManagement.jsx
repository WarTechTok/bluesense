import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import * as adminApi from '../../services/admin/adminApi';
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
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ReservationManagement;
