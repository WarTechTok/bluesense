import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/Navbar';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Try to load email from localStorage
    const storedEmail = localStorage.getItem('customerEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setSearchEmail(storedEmail);
      fetchBookings(storedEmail);
    }
  }, []);

  const fetchBookings = async (customerEmail) => {
    if (!customerEmail || customerEmail.trim() === '') {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/customer/${customerEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
      setEmail(customerEmail);
      
      if (data.length === 0) {
        setError('No bookings found for this email address');
      }
    } catch (err) {
      setError(err.message || 'Error fetching bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings(searchEmail);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Confirmed':
        return '#10b981';
      case 'Cancelled':
        return '#ef4444';
      case 'Completed':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <Navbar />
      <div className="my-bookings-container">
        <div className="hero-section">
          <h1>My Bookings</h1>
          <p>View and manage all your reservations</p>
        </div>

        <div className="bookings-content">
          {email === '' ? (
            <div className="search-section">
              <h2>Search Your Bookings</h2>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bookings-header">
              <div>
                <h2>Bookings for {email}</h2>
                <p className="booking-count">{bookings.length} booking(s) found</p>
              </div>
              <button 
                className="btn-search-new"
                onClick={() => {
                  setEmail('');
                  setSearchEmail('');
                  setBookings([]);
                  setError('');
                }}
              >
                Search Different Email
              </button>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {loading && (
            <div className="loading">
              <p>Loading your bookings...</p>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="card-header">
                    <div>
                      <h3>{booking.oasis}</h3>
                      <p className="package-name">{booking.package}</p>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="booking-info">
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Guests:</span>
                        <span className="value">{booking.pax} pax</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Down Payment:</span>
                        <span className="value">₱{booking.downpayment?.toLocaleString()}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Payment Status:</span>
                        <span className="value">{booking.paymentStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(booking)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && email !== '' && bookings.length === 0 && !error && (
            <div className="empty-state">
              <p>No bookings found. Start planning your next visit!</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedBooking.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedBooking.customerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact:</span>
                    <span className="value">{selectedBooking.customerContact}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Venue:</span>
                    <span className="value">{selectedBooking.oasis}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Package:</span>
                    <span className="value">{selectedBooking.package}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Number of Guests:</span>
                    <span className="value">{selectedBooking.pax}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Down Payment:</span>
                    <span className="value">₱{selectedBooking.downpayment?.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">{selectedBooking.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Status:</span>
                    <span className="value">{selectedBooking.paymentStatus}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Status:</span>
                    <span 
                      className="value"
                      style={{ color: getStatusColor(selectedBooking.status) }}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.confirmedBy && (
                <div className="detail-section">
                  <h3>Confirmation</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Confirmed By:</span>
                      <span className="value">{selectedBooking.confirmedBy?.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;
