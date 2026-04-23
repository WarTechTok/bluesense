import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as staffApi from '../../services/staffDashboardApi';
import NotificationBell from '../../components/staff/NotificationBell';
import LogoutConfirmModal from '../../components/modals/LogoutConfirmModal';
import './Inspections.css';

/**
 * Staff Inspections Page
 * Staff can:
 * - Create new inspection reports
 * - Report damages found
 * - List items that need replacement/repair
 * - Add notes about room condition
 * - View inspection history
 */
const Inspections = () => {
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

  const [inspections, setInspections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    condition: 'Good',
    cleaningNeeded: 'Yes',
    damageFound: 'No',
    damageDescription: '',
    itemsNeeded: '',
    notes: '',
    rating: 5,
  });

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

  useEffect(() => {
    fetchInspections();
    fetchRooms();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getMyInspections?.();
      setInspections(data?.inspections || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await staffApi.getAssignedRooms?.();
      setRooms(data?.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roomId) {
      alert('Please select a room');
      return;
    }

    try {
      await staffApi.createInspectionRecord({
        roomId: formData.roomId,
        condition: formData.condition,
        cleaningNeeded: formData.cleaningNeeded,
        damageFound: formData.damageFound,
        damageDescription: formData.damageDescription,
        itemsNeeded: formData.itemsNeeded,
        notes: formData.notes,
        rating: parseInt(formData.rating),
      });

      alert('✅ Inspection report submitted successfully!');
      setFormData({
        roomId: '',
        condition: 'Good',
        cleaningNeeded: 'Yes',
        damageFound: 'No',
        damageDescription: '',
        itemsNeeded: '',
        notes: '',
        rating: 5,
      });
      setShowForm(false);
      fetchInspections();
    } catch (error) {
      console.error('Error creating inspection:', error);
      alert('❌ Error submitting inspection report');
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return '#10b981';
      case 'Good':
        return '#3b82f6';
      case 'Fair':
        return '#f59e0b';
      case 'Poor':
        return '#ef4444';
      default:
        return '#6b7280';
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
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Room Inspections'}</h1>
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
        <div className="header-content">
          <h1>Room Inspections</h1>
          <p>Create and track room inspection reports</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i> {showForm ? 'Cancel' : 'New Inspection'}
        </button>
      </div>

      {/* Inspection Form */}
      {showForm && (
        <form className="inspection-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Room Information</h3>
            <div className="form-group">
              <label>Select Available Room *</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">-- Choose an available room --</option>
                {rooms
                  .filter((room) => room.status === 'Available')
                  .map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name} (Capacity: {room.capacity}, Status: Available)
                    </option>
                  ))}
              </select>
              {rooms.filter((room) => room.status === 'Available').length === 0 && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                  ⚠️ No available rooms for inspection. All assigned rooms are either in maintenance or booked.
                </p>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Room Condition</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Overall Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Room Quality Rating (1-10)</label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cleaning Needed?</label>
                <select
                  name="cleaningNeeded"
                  value={formData.cleaningNeeded}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Damages Found?</label>
                <select
                  name="damageFound"
                  value={formData.damageFound}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {formData.damageFound === 'Yes' && (
            <div className="form-section">
              <h3>Damage Details</h3>
              <div className="form-group">
                <label>Describe the damage</label>
                <textarea
                  name="damageDescription"
                  value={formData.damageDescription}
                  onChange={handleInputChange}
                  placeholder="Describe all damages found in the room..."
                  className="form-input textarea"
                  rows="4"
                />
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Items & Resources</h3>
            <div className="form-group">
              <label>Items Needed for Repair/Replacement</label>
              <textarea
                name="itemsNeeded"
                value={formData.itemsNeeded}
                onChange={handleInputChange}
                placeholder="List items that need to be purchased or replaced..."
                className="form-input textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any other observations or important notes..."
                className="form-input textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-lg">
              <i className="fas fa-check"></i> Submit Inspection Report
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inspections History */}
      <div className="inspections-section">
        <h2>Inspection History</h2>
        {loading ? (
          <div className="loading">Loading inspection records...</div>
        ) : inspections.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>No inspections yet</h3>
            <p>Create your first inspection report to get started</p>
          </div>
        ) : (
          <div className="inspections-grid">
            {inspections.map((inspection) => (
              <div key={inspection._id} className="inspection-card">
                <div className="inspection-header">
                  <div>
                    <h3>{inspection.roomId?.name || 'Unknown Room'}</h3>
                    <p className="inspection-date">
                      {new Date(inspection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="btn-view"
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>

                <div className="inspection-stats">
                  <div className="stat">
                    <label>Condition</label>
                    <span
                      className="condition-badge"
                      style={{
                        backgroundColor: getConditionColor(inspection.condition),
                      }}
                    >
                      {inspection.condition}
                    </span>
                  </div>
                  <div className="stat">
                    <label>Rating</label>
                    <span className="rating">{inspection.rating}/10</span>
                  </div>
                  <div className="stat">
                    <label>Damages</label>
                    <span
                      className={`damage-badge ${
                        inspection.damageFound === 'Yes' ? 'has-damage' : 'no-damage'
                      }`}
                    >
                      {inspection.damageFound}
                    </span>
                  </div>
                </div>

                {inspection.damageFound === 'Yes' && (
                  <div className="damage-summary">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{inspection.damageDescription?.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <div className="modal-overlay" onClick={() => setSelectedInspection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedInspection(null)}
            >
              ✕
            </button>
            <h2>{selectedInspection.roomId?.name}</h2>
            <div className="modal-details">
              <div className="detail-section">
                <h4>Room Condition</h4>
                <p>
                  <strong>Overall:</strong>{' '}
                  <span
                    style={{
                      color: getConditionColor(selectedInspection.condition),
                      fontWeight: '600',
                    }}
                  >
                    {selectedInspection.condition}
                  </span>
                </p>
                <p>
                  <strong>Rating:</strong> {selectedInspection.rating}/10
                </p>
                <p>
                  <strong>Cleaning Needed:</strong>{' '}
                  {selectedInspection.cleaningNeeded}
                </p>
              </div>

              {selectedInspection.damageFound === 'Yes' && (
                <div className="detail-section damage-section">
                  <h4>
                    <i className="fas fa-exclamation-triangle"></i> Damages Found
                  </h4>
                  <p>{selectedInspection.damageDescription}</p>
                </div>
              )}

              {selectedInspection.itemsNeeded && (
                <div className="detail-section">
                  <h4>Items Needed</h4>
                  <p>{selectedInspection.itemsNeeded}</p>
                </div>
              )}

              {selectedInspection.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p>{selectedInspection.notes}</p>
                </div>
              )}

              <p className="submission-date">
                <strong>Submitted:</strong>{' '}
                {new Date(selectedInspection.createdAt).toLocaleString()}
              </p>
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

export default Inspections;
