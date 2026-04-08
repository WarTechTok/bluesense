import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import * as adminApi from '../../services/admin/adminApi';
import './ManagementPages.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    oasis: '',
    package: '',
    bookingDate: '',
    pax: '1',
    downpayment: '',
    paymentMethod: 'GCash',
    paymentStatus: 'Pending',
    status: 'Pending'
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Filter bookings directly instead of calling filterBookings function
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    try {
      const data = await adminApi.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleOpenModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      setFormData(booking);
    } else {
      setEditingBooking(null);
      setFormData({
        customerName: '',
        customerContact: '',
        customerEmail: '',
        oasis: '',
        package: '',
        bookingDate: '',
        pax: '1',
        downpayment: '',
        paymentMethod: 'GCash',
        paymentStatus: 'Pending',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleConfirm = async (id) => {
    try {
      await adminApi.updateBookingStatus(id, 'Confirmed');
      fetchBookings();
      alert('✅ Booking confirmed successfully!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Error confirming booking');
    }
  };

  const handleCancel = async (id) => {
    try {
      await adminApi.updateBookingStatus(id, 'Cancelled');
      fetchBookings();
      alert('✅ Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await adminApi.deleteBooking(id);
        fetchBookings();
        alert('✅ Booking deleted successfully!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate all required fields
      if (!formData.customerName || !formData.customerContact || !formData.oasis || !formData.package || 
          !formData.bookingDate || !formData.pax || !formData.downpayment || !formData.paymentMethod) {
        alert('Please fill in all required fields');
        return;
      }

      const bookingPayload = {
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        customerEmail: formData.customerEmail,
        oasis: formData.oasis,
        package: formData.package,
        bookingDate: formData.bookingDate,
        pax: parseInt(formData.pax),
        downpayment: parseFloat(formData.downpayment),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus || 'Pending',
        status: formData.status || 'Pending'
      };

      if (editingBooking) {
        // If editing, use the booking's existing ID
        bookingPayload._id = editingBooking._id;
        await adminApi.createBooking(bookingPayload);
      } else {
        // Create new booking
        await adminApi.createBooking(bookingPayload);
      }
      setIsModalOpen(false);
      fetchBookings();
      alert('✅ Booking saved successfully!');
    } catch (error) {
      console.error('Error saving booking:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error saving booking';
      alert('❌ ' + errorMsg);
    }
  };

  const columns = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerContact', label: 'Contact' },
    { key: 'oasis', label: 'Location' },
    { key: 'package', label: 'Package' },
    { 
      key: 'bookingDate', 
      label: 'Booking Date', 
      render: (value) => new Date(value).toLocaleDateString() 
    },
    { 
      key: 'paymentStatus', 
      label: 'Payment', 
      render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> 
    },
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Booking Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Booking</button>
      </div>

      {/* STATUS FILTER */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{bookings.filter(b => b.status === 'Pending').length}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmed</h3>
          <p className="stat-number">{bookings.filter(b => b.status === 'Confirmed').length}</p>
        </div>
        <div className="stat-card">
          <h3>Cancelled</h3>
          <p className="stat-number">{bookings.filter(b => b.status === 'Cancelled').length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{bookings.filter(b => b.status === 'Completed').length}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBookings}
        onEdit={handleOpenModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        title={editingBooking ? 'Edit Booking' : 'Add New Booking'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <form className="form landscape">
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              value={formData.customerContact}
              onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Location *</label>
            <select
              value={formData.oasis}
              onChange={(e) => setFormData({ ...formData, oasis: e.target.value })}
              required
            >
              <option value="">Select Location</option>
              <option value="Oasis 1">Oasis 1</option>
              <option value="Oasis 2">Oasis 2</option>
            </select>
          </div>
          <div className="form-group">
            <label>Package *</label>
            <input
              type="text"
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              placeholder="e.g., Standard, Deluxe, Premium"
              required
            />
          </div>
          <div className="form-group">
            <label>Booking Date *</label>
            <input
              type="date"
              value={formData.bookingDate}
              onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Pax *</label>
            <input
              type="number"
              value={formData.pax}
              onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Down Payment *</label>
            <input
              type="number"
              value={formData.downpayment}
              onChange={(e) => setFormData({ ...formData, downpayment: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="GoTyme">GoTyme</option>
              <option value="SeaBank">SeaBank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div className="form-group">
            <label>Booking Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingManagement;
