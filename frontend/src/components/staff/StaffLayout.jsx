import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as staffApi from '../services/staffDashboardApi';
import NotificationBell from '../components/staff/NotificationBell';
import LogoutConfirmModal from '../components/modals/LogoutConfirmModal';
import './StaffDashboard.css';

const StaffDashboard = () => {
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
  
  const [stats, setStats] = useState({
    staffName: '',
    position: '',
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    cancelledTasks: 0,
    assignedRoomsCount: 0,
    unreadNotifications: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.position === 'Receptionist') {
      navigate('/receptionist/dashboard', { replace: true });
      return;
    }
    
    setUserData(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, [navigate]);

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
      if (!e.target.closest('.staff-profile')) {
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

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const statsRes = await staffApi.getDashboardStats();
      setStats(statsRes);

      const tasksRes = await staffApi.getTasks();
      setTasks(tasksRes.tasks || []);
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = window.setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'In Progress': '#3b82f6',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7583';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': '#ef4444',
      'High': '#f97316',
      'Medium': '#f59e0b',
      'Low': '#10b981'
    };
    return colors[priority] || '#6b7583';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={loadDashboard} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-layout">
      {isMobile && (
        <div 
          className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`staff-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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

      <main className="staff-main">
        <div className="staff-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          
          <div className="header-title">
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Staff Dashboard'}</h1>
            <p>Welcome back, {stats.staffName || userData?.name || 'Staff'}</p>
          </div>
          
          <NotificationBell refreshInterval={10000} />
          
          <div className="staff-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="staff-name">{userData?.name?.split(' ')[0] || 'Staff'}</span>
              <div className="staff-avatar">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="avatar" />
                ) : (
                  <span>{getInitial}</span>
                )}
                <span className="avatar-arrow">▼</span>
              </div>
            </button>

            {showDropdown && (
              <div className="staff-dropdown">
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
        
        <div className="staff-content">
          <div className="stats-section">
            <h2 className="section-title">Task Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Tasks</h3>
                  <div className="stat-value">{stats.totalTasks || 0}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <div className="stat-value">{stats.pendingTasks || 0}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                  <i className="fas fa-spinner"></i>
                </div>
                <div className="stat-info">
                  <h3>In Progress</h3>
                  <div className="stat-value">{stats.inProgressTasks || 0}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <div className="stat-value">{stats.completedTasks || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="section-title">Task Summary</h2>
            <div className="financial-table">
              <div className="financial-row header">
                <div className="financial-cell">Metric</div>
                <div className="financial-cell text-right">Count</div>
                <div className="financial-cell text-right">Percentage</div>
                <div className="financial-cell text-right">Status</div>
              </div>
              
              <div className="financial-row">
                <div className="financial-cell label">Pending Tasks</div>
                <div className="financial-cell text-right">{stats.pendingTasks || 0}</div>
                <div className="financial-cell text-right">
                  {stats.totalTasks > 0 ? `${Math.round((stats.pendingTasks / stats.totalTasks) * 100)}%` : '0%'}
                </div>
                <div className="financial-cell text-right">
                  <span className="status-badge" style={{ backgroundColor: '#f59e0b' }}>Pending</span>
                </div>
              </div>
              
              <div className="financial-row">
                <div className="financial-cell label">In Progress</div>
                <div className="financial-cell text-right">{stats.inProgressTasks || 0}</div>
                <div className="financial-cell text-right">
                  {stats.totalTasks > 0 ? `${Math.round((stats.inProgressTasks / stats.totalTasks) * 100)}%` : '0%'}
                </div>
                <div className="financial-cell text-right">
                  <span className="status-badge" style={{ backgroundColor: '#3b82f6' }}>In Progress</span>
                </div>
              </div>
              
              <div className="financial-row">
                <div className="financial-cell label">Completed</div>
                <div className="financial-cell text-right">{stats.completedTasks || 0}</div>
                <div className="financial-cell text-right">
                  {stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%'}
                </div>
                <div className="financial-cell text-right">
                  <span className="status-badge" style={{ backgroundColor: '#10b981' }}>Completed</span>
                </div>
              </div>

              <div className="financial-row">
                <div className="financial-cell label">Cancelled</div>
                <div className="financial-cell text-right">{stats.cancelledTasks || 0}</div>
                <div className="financial-cell text-right">
                  {stats.totalTasks > 0 ? `${Math.round((stats.cancelledTasks / stats.totalTasks) * 100)}%` : '0%'}
                </div>
                <div className="financial-cell text-right">
                  <span className="status-badge" style={{ backgroundColor: '#ef4444' }}>Cancelled</span>
                </div>
              </div>

              <div className="financial-row highlight">
                <div className="financial-cell label">Completion Rate</div>
                <div className="financial-cell text-right amount-profit">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </div>
                <div className="financial-cell text-right amount-profit">
                  {stats.totalTasks > 0 ? Math.round(((stats.completedTasks + stats.inProgressTasks) / stats.totalTasks) * 100) : 0}% Active
                </div>
                <div className="financial-cell text-right">
                  <span className="status-badge" style={{ backgroundColor: '#10b981' }}>Tracking</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="section-title">Performance Metrics</h2>
            <div className="quick-stats">
              <div className="quick-stat-item">
                <h4><i className="fas fa-door-open"></i> Room Assignments</h4>
                <ul>
                  <li>
                    <span>Assigned Rooms:</span>
                    <strong>{stats.assignedRoomsCount || 0}</strong>
                  </li>
                </ul>
              </div>

              <div className="quick-stat-item">
                <h4><i className="fas fa-chart-line"></i> Performance</h4>
                <ul>
                  <li>
                    <span>Completion Rate:</span>
                    <strong>
                      {stats.totalTasks > 0 
                        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                        : 0}%
                    </strong>
                  </li>
                  <li>
                    <span>Productivity:</span>
                    <strong>
                      {stats.totalTasks > 0 
                        ? Math.round(((stats.completedTasks + stats.inProgressTasks) / stats.totalTasks) * 100)
                        : 0}%
                    </strong>
                  </li>
                </ul>
              </div>

              <div className="quick-stat-item">
                <h4><i className="fas fa-bell"></i> Notifications</h4>
                <ul>
                  <li>
                    <span>Unread:</span>
                    <strong>{stats.unreadNotifications || 0}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="section-title">My Tasks</h2>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No tasks assigned</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <div className="task-header">
                      <div className="task-title-section">
                        <h4>{task.title}</h4>
                        <div className="task-badges">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {task.status}
                          </span>
                          <span 
                            className="priority-badge"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="task-details">
                      {task.roomId && (
                        <div className="task-detail-item">
                          <i className="fas fa-door-open"></i>
                          <span>{task.roomId.name}</span>
                        </div>
                      )}
                      {task.taskType && (
                        <div className="task-detail-item">
                          <i className="fas fa-tag"></i>
                          <span>{task.taskType}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="task-detail-item">
                          <i className="fas fa-calendar"></i>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {task.description && (
                      <div className="task-description">
                        <p>{task.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default StaffDashboard;