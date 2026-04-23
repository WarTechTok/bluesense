import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as staffApi from '../../services/staffDashboardApi';
import NotificationBell from '../../components/staff/NotificationBell';
import LogoutConfirmModal from '../../components/modals/LogoutConfirmModal';
import './Rooms.css';

/**
 * Staff Assigned Rooms Page
 * Displays all rooms assigned to the staff member
 * Staff can:
 * - View assigned rooms
 * - See room details
 * - View room status and cleanliness rating
 */
const Rooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Load user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.admin-profile')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/staff/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: 'fas fa-tasks', path: '/staff/tasks' },
    { id: 'rooms', label: 'Assigned Rooms', icon: 'fas fa-door-open', path: '/staff/rooms' },
    { id: 'inspections', label: 'Room Inspections', icon: 'fas fa-clipboard-check', path: '/staff/inspections' },
  ];

  const isActive = (path) => location.pathname === path;

  const getInitial = userData?.name?.charAt(0).toUpperCase() || 'S';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8080/api/auth/profile',
        { name: editForm.name, phone: editForm.phone, address: editForm.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.user) {
        const updatedUser = { ...userData, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setShowEditModal(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAssignedRooms?.();
      setRooms(data?.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return '#10b981';
      case 'Occupied':
        return '#3b82f6';
      case 'Maintenance':
        return '#f59e0b';
      case 'Cleaning':
        return '#8b5cf6';
      default:
        return '#6b7583';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img 
              src="/images/logo/Logo-NoBackground.png" 
              alt="Catherine's Oasis" 
              className="sidebar-logo"
            />
            {sidebarOpen && <span className="logo-text">Staff</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {isMobile ? (
              <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
            ) : (
              <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setSidebarOpen(false);
                }
              }}
            >
              <i className={`${item.icon} nav-icon`}></i>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          
          <div className="header-title">
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Assigned Rooms'}</h1>
            <p>Welcome back, {userData?.name || 'Staff'}</p>
          </div>
          
          {/* Notification Bell */}
          <NotificationBell refreshInterval={10000} />
          
          {/* Profile Dropdown */}
          <div className="admin-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="admin-name">{userData?.name?.split(' ')[0] || 'Staff'}</span>
              <div className="admin-avatar">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="avatar" />
                ) : (
                  <span>{getInitial}</span>
                )}
                <span className="avatar-arrow">▼</span>
              </div>
            </button>

            {showDropdown && (
              <div className="admin-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                >
                  <i className="fas fa-user"></i>
                  View Profile
                </button>
                <button 
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowLogoutConfirm(true);
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="admin-content">
      <div className="page-header">
        <h1>My Assigned Rooms</h1>
        <p>View all rooms assigned to you for cleaning and maintenance</p>
      </div>

      {/* Rooms Grid */}
      <div className="rooms-container">
        {loading ? (
          <div className="loading">Loading assigned rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-door-open"></i>
            <h2>No rooms assigned</h2>
            <p>You don't have any rooms assigned yet</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="room-card">
              <div className="room-card-header">
                <div className="room-title-section">
                  <h3>{room.name}</h3>
                  <span 
                    className="room-status-badge"
                    style={{ backgroundColor: getRoomStatusColor(room.status) }}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              <div className="room-details">
                <div className="detail-item">
                  <i className="fas fa-tag"></i>
                  <div>
                    <label>Room Number:</label>
                    <span>{room.roomNumber}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <i className="fas fa-bed"></i>
                  <div>
                    <label>Type:</label>
                    <span>{room.roomType || 'Standard'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <i className="fas fa-star"></i>
                  <div>
                    <label>Cleanliness Rating:</label>
                    <span style={{ color: getRatingColor(room.rating) }}>
                      {room.rating}/5 <i className="fas fa-star"></i>
                    </span>
                  </div>
                </div>

                {room.floor && (
                  <div className="detail-item">
                    <i className="fas fa-layer-group"></i>
                    <div>
                      <label>Floor:</label>
                      <span>{room.floor}</span>
                    </div>
                  </div>
                )}

                {room.lastCleaned && (
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <label>Last Cleaned:</label>
                      <span>{new Date(room.lastCleaned).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {room.notes && (
                  <div className="detail-item full-width">
                    <i className="fas fa-sticky-note"></i>
                    <div>
                      <label>Notes:</label>
                      <span>{room.notes}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="room-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRoom(room)}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedRoom(null)}
            >
              ✕
            </button>
            <h2>{selectedRoom.name} ({selectedRoom.roomNumber})</h2>
            <div className="modal-details">
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: getRoomStatusColor(selectedRoom.status) }}>
                  {selectedRoom.status}
                </span>
              </p>
              <p>
                <strong>Type:</strong> {selectedRoom.roomType || 'Standard'}
              </p>
              <p>
                <strong>Floor:</strong> {selectedRoom.floor || 'N/A'}
              </p>
              <p>
                <strong>Cleanliness Rating:</strong>{' '}
                <span style={{ color: getRatingColor(selectedRoom.rating) }}>
                  {selectedRoom.rating}/5 <i className="fas fa-star"></i>
                </span>
              </p>
              {selectedRoom.lastCleaned && (
                <p>
                  <strong>Last Cleaned:</strong> {new Date(selectedRoom.lastCleaned).toLocaleDateString()}
                </p>
              )}
              {selectedRoom.notes && (
                <p>
                  <strong>Notes:</strong> {selectedRoom.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </main>

      {/* View Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-container profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Information</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="avatar" />
                ) : (
                  <span>{getInitial}</span>
                )}
              </div>
              <div className="profile-info">
                <div className="info-row">
                  <label>Name</label>
                  <p>{userData?.name}</p>
                </div>
                <div className="info-row">
                  <label>Email</label>
                  <p>{userData?.email}</p>
                </div>
                <div className="info-row">
                  <label>Phone</label>
                  <p>{userData?.phone || 'Not provided'}</p>
                </div>
                <div className="info-row">
                  <label>Address</label>
                  <p>{userData?.address || 'Not provided'}</p>
                </div>
                <div className="info-row">
                  <label>Role</label>
                  <p>{userData?.role}</p>
                </div>
              </div>
              
              <button 
                className="edit-profile-inside-btn"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowEditModal(true);
                }}
              >
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {message && <div className="message-banner success">{message}</div>}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="edit-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userData?.email} disabled className="edit-input disabled" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="edit-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="edit-input"
                  rows="2"
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Rooms;
