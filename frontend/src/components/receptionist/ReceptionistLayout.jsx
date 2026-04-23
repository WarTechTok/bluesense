import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../staff/NotificationBell';
import LogoutConfirmModal from '../modals/LogoutConfirmModal';
import '../admin/AdminLayout.css';

/**
 * Receptionist Layout - Similar to Admin Layout but with limited menu
 * Receptionists can access: Dashboard, Bookings, Rooms, Inventory, Sales, Reports
 */
const ReceptionistLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle window resize to track mobile state
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

  // Close sidebar when navigation changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.body.classList.add('no-navbar');
    return () => {
      document.body.classList.remove('no-navbar');
    };
  }, []);

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

  // Receptionist menu - limited to specific pages
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/receptionist/dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'fas fa-calendar-alt', path: '/receptionist/bookings' },
    { id: 'rooms', label: 'Rooms', icon: 'fas fa-bed', path: '/receptionist/rooms' },
    { id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes', path: '/receptionist/inventory' },
    { id: 'sales', label: 'Sales', icon: 'fas fa-chart-simple', path: '/receptionist/sales' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-file-alt', path: '/receptionist/reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitial = userData?.name?.charAt(0).toUpperCase() || 'R';

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
            {sidebarOpen && <span className="logo-text">Receptionist</span>}
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
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Receptionist Dashboard'}</h1>
            <p>Welcome back, {userData?.name || 'Receptionist'}</p>
          </div>

          {/* Notification Bell */}
          <NotificationBell refreshInterval={10000} />

          {/* Profile Dropdown */}
          <div className="admin-profile">
            <button
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="admin-name">{userData?.name?.split(' ')[0] || 'Receptionist'}</span>
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

        <div className="admin-content">{children}</div>
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
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default ReceptionistLayout;
