import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API } from '../../utils/apiBase';
import * as staffApi from '../../services/staffDashboardApi';
import NotificationBell from '../../components/staff/NotificationBell';
import LogoutConfirmModal from '../../components/modals/LogoutConfirmModal';
import './Notifications.css';

const StaffNotificationsPage = () => {
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, []);

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

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getNotifications({ limit: 100, skip: 0 });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await staffApi.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await staffApi.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await staffApi.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_API}/api/auth/profile`,
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return '#dc3545';
      case 'High':
        return '#ff6b6b';
      case 'Medium':
        return '#ffc107';
      case 'Low':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="admin-layout">
      {isMobile && (
        <div
          className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

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

      <main className="admin-main">
        <div className="admin-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>

          <div className="header-title">
            <h1>All Notifications</h1>
            <p>Welcome back, {userData?.name || 'Staff'}</p>
          </div>

          <NotificationBell refreshInterval={10000} />

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

        <div className="admin-content notifications-page">
          <div className="page-header">
            <h1>All Notifications</h1>
            <p>View, review, and manage every notification sent to your account</p>
          </div>

          <div className="notifications-toolbar">
            <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
              <i className="fas fa-check-double"></i> Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h2>No notifications</h2>
              <p>Your notification feed is empty right now.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div
                    className="notification-priority"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  />

                  <div className="notification-card-content">
                    <div className="notification-card-top">
                      <div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </div>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="notification-card-actions">
                      {!notification.isRead && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <i className="fas fa-check"></i> Mark as read
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-container profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Information</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Profile editing is available through the profile modal.</p>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      )}

      {message && <div className="toast-message">{message}</div>}
    </div>
  );
};

export default StaffNotificationsPage;
