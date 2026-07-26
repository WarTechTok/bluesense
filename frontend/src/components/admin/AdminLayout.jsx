// frontend/src/components/admin/AdminLayout.jsx
// ============================================
// ADMIN LAYOUT - Profile in sidebar footer, no top header
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LogoutConfirmModal from '../modals/LogoutConfirmModal';
import { getApiUrl } from '../../utils/apiBase';
import './AdminLayout.css';

const BASE_API = getApiUrl();

const AdminLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
      if (!newIsMobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    document.body.classList.add('no-navbar');
    return () => document.body.classList.remove('no-navbar');
  }, []);

  const menuItems = [
    { id: 'dashboard',   label: 'Dashboard',        icon: 'fas fa-chart-line',      path: '/admin/dashboard' },
    { id: 'bookings',    label: 'Bookings',          icon: 'fas fa-calendar-alt',    path: '/admin/bookings' },
    { id: 'packages',    label: 'Packages',          icon: 'fas fa-box',             path: '/admin/packages' },
    { id: 'gallery',     label: 'Gallery',           icon: 'fas fa-images',          path: '/admin/gallery' },
    { id: 'reviews',     label: 'Customer Reviews',  icon: 'fas fa-star',            path: '/admin/reviews' },
    { id: 'rooms',       label: 'Rooms',             icon: 'fas fa-bed',             path: '/admin/rooms' },
    { id: 'inventory',   label: 'Inventory',         icon: 'fas fa-boxes',           path: '/admin/inventory' },
    { id: 'staff',       label: 'Staff',             icon: 'fas fa-users',           path: '/admin/staff' },
    { id: 'sales',       label: 'Sales',             icon: 'fas fa-chart-simple',    path: '/admin/sales' },
    { id: 'maintenance', label: 'Maintenance',       icon: 'fas fa-wrench',          path: '/admin/maintenance' },
    { id: 'reports',     label: 'Reports',           icon: 'fas fa-file-alt',        path: '/admin/reports' },
  ];

  const stopESP32 = async () => {
    try {
      await fetch('https://bluesense.onrender.com/api/readings/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('stopESP32 failed (non-blocking):', err);
    }
  };

  const handleLogout = async () => {
    await stopESP32();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitial = () => userData?.name?.charAt(0).toUpperCase() || 'A';

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login again');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_API}/api/auth/profile`,
        { name: editForm.name, phone: editForm.phone, address: editForm.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.user) {
        const updatedUser = { ...userData, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setShowEditModal(false);
        setMessage('Profile updated successfully!');
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(response.data?.message || 'Failed to update profile');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || 'Failed to update profile');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

        {/* Top: Logo + toggle */}
        <div className="sidebar-header">
          <div className="logo-area">
            <img
              src="/images/logo/Logo-NoBackground.png"
              alt="Catherine's Oasis"
              className="sidebar-logo"
            />
            {sidebarOpen && <span className="logo-text">Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {isMobile
              ? <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
              : <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
            }
          </button>
        </div>

        {/* Middle: Nav items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <i className={`${item.icon} nav-icon`}></i>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: Profile section */}
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {userData?.avatar
                ? <img src={userData.avatar} alt="avatar" />
                : <span>{getInitial()}</span>
              }
            </div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{userData?.name || 'Admin'}</p>
                <p className="sidebar-user-email">{userData?.email || ''}</p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <div className="sidebar-footer-actions">
              <button
                className="sidebar-action-btn edit"
                onClick={() => setShowEditModal(true)}
              >
                <i className="fas fa-edit"></i>
                <span>Edit Profile</span>
              </button>
              <button
                className="sidebar-action-btn logout"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Collapsed: icon-only buttons */}
          {!sidebarOpen && (
            <div className="sidebar-footer-actions-collapsed">
              <button
                className="sidebar-icon-btn"
                title="Edit Profile"
                onClick={() => setShowEditModal(true)}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="sidebar-icon-btn logout"
                title="Logout"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content — no header */}
      <main className="admin-main">
        {/* Mobile hamburger — floated top-left inside content */}
        {isMobile && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
        )}

        <div className="admin-content">
          {children}
        </div>
      </main>

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

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AdminLayout;