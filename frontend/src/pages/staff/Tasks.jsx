import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API } from '../../utils/apiBase';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import * as staffApi from '../../services/staffDashboardApi';
import NotificationBell from '../../components/staff/NotificationBell';
import LogoutConfirmModal from '../../components/modals/LogoutConfirmModal';
import TaskCard from '../../components/staff/TaskCard';
import TaskDetailsModal from '../../components/staff/TaskDetailsModal';
import './Tasks.css';

/**
 * Staff Tasks Page
 * Displays all assigned tasks with filtering and status updates
 * Staff can:
 * - View assigned tasks
 * - Filter by status (Pending, In Progress, Completed)
 * - Update task status
 * - View task details
 */
const Tasks = () => {
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
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [oasisFilter, setOasisFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  useEffect(() => {
    // Initial load — show the spinner.
    fetchTasks(filter, true);

    // Background auto-refresh — pass showSpinner=false so the task cards are
    // never unmounted.  Unmounting destroys the local textarea / file-input
    // state inside each TaskCard even though the task IDs haven't changed.
    const interval = window.setInterval(() => {
      fetchTasks(filter, false);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [filter]);

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
    { id: 'rooms', label: 'Assigned Task', icon: 'fas fa-door-open', path: '/staff/rooms' },
    { id: 'inspections', label: 'Inspection Report', icon: 'fas fa-clipboard-check', path: '/staff/inspections' },
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

  /**
   * Fetch tasks from the API.
   *
   * @param {string}  status      - Optional status filter.
   * @param {boolean} showSpinner - Pass `true` only for the initial / manual
   *                                load. Background auto-refresh calls pass
   *                                `false` so the loading spinner never
   *                                unmounts the task cards, which would
   *                                destroy their local form state (typed text
   *                                and selected file).
   */
  const fetchTasks = async (status = '', showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await staffApi.getTasks({ ...(status ? { status } : {}), limit: 1000 });
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    // User changed the filter: show spinner and fetch immediately.
    // The interval useEffect will also re-run because `filter` changed.
    fetchTasks(status, true);
  };

  const visibleTasks = tasks.filter((task) => {
    const taskText = `${task.title || ''} ${task.description || ''}`;
    const oasisFromText = taskText.match(/Oasis\s*([12])/i)?.[1];
    const taskOasis = task.oasis
      || task.roomId?.oasis
      || (oasisFromText ? `Oasis ${oasisFromText}` : null);
    const isPool = task.locationType === 'Pool'
      || (!task.roomId && /\bpool\b/i.test(taskText))
      || /pool/i.test(task.roomId?.name || '');
    const matchesLocationType = !locationTypeFilter
      || (locationTypeFilter === 'Pool' ? isPool : !isPool);
    const matchesOasis = !oasisFilter || taskOasis === oasisFilter;

    return matchesLocationType && matchesOasis;
  });

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

  const handleStatusChange = async (taskId, newStatus, completionNotes = '', proofImage = null) => {
    try {
      const currentTask = tasks.find((task) => task._id === taskId);
      const isPoolTask = currentTask?.locationType === 'Pool'
        || (!currentTask?.roomId && /\bpool\b/i.test(`${currentTask?.title || ''} ${currentTask?.description || ''}`));
      const updateData = isPoolTask && newStatus === 'Completed'
        ? (() => {
          const formData = new FormData();
          formData.append('status', newStatus);
          formData.append('completionNotes', completionNotes);
          formData.append('inspectionImage', proofImage);
          return formData;
        })()
        : { status: newStatus, completionNotes };
      const response = await staffApi.updateTaskStatus(taskId, updateData);

      setTasks(prev => prev.map(task =>
        task._id === taskId
          ? { ...task, status: newStatus, completionNotes, completionProofUrl: response.task?.completionProofUrl || task.completionProofUrl }
          : task
      ));

      setSelectedTask(null);

      const successMessage = newStatus === 'Completed' && isPoolTask
        ? '✅ Completion report submitted. The assignment will remain open until an admin or receptionist reviews it.'
        : '✅ Task status updated successfully!';
      showConfirmationModal('Success', successMessage, () => {
        if (newStatus === 'In Progress') {
          navigate('/staff/rooms');
        }

        if (newStatus === 'Completed' && !isPoolTask) {
          navigate('/staff/inspections');
        }
      }, 'OK');
    } catch (error) {
      console.error('Error updating task:', error);
      showConfirmationModal('Error', '❌ Error updating task', null, 'OK');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await staffApi.deleteTask(taskId);

      setTasks(prev => prev.filter(task => task._id !== taskId));
      setSelectedTask(null);

      showConfirmationModal('Deleted', '✅ Task deleted successfully!', () => {}, 'OK');
    } catch (error) {
      console.error('Error deleting task:', error);
      showConfirmationModal('Error', '❌ Error deleting task', null, 'OK');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#ffc107';
      case 'In Progress':
        return '#17a2b8';
      case 'Completed':
        return '#28a745';
      case 'Cancelled':
        return '#6c757d';
      default:
        return '#6c757d';
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
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'My Tasks'}</h1>
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
        
        <div className="admin-content tasks-page">
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>View and manage your assigned cleaning tasks</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <label className="task-filter">
          <span>Task status</span>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <label className="task-filter">
          <span>Location type</span>
          <select
            value={locationTypeFilter}
            onChange={(e) => setLocationTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Room or Pool</option>
            <option value="Room">Room</option>
            <option value="Pool">Pool</option>
          </select>
        </label>
        <label className="task-filter">
          <span>Oasis</span>
          <select
            value={oasisFilter}
            onChange={(e) => setOasisFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Oases</option>
            <option value="Oasis 1">Oasis 1</option>
            <option value="Oasis 2">Oasis 2</option>
          </select>
        </label>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-container">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h2>{tasks.length === 0 ? 'No tasks assigned' : 'No tasks match these filters'}</h2>
            <p>{tasks.length === 0 ? 'Check back later for new cleaning assignments' : 'Try changing the location or Oasis filter'}</p>
          </div>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onViewDetails={setSelectedTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ))
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />
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

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <ConfirmationModal
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
        />
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

export default Tasks;