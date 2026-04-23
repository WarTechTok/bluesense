import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import MessageModal from '../../components/modals/MessageModal';
import * as adminApi from '../../services/admin';
import { validateStaffMember, validatePasswordReset } from '../../utils/adminValidation';
import './ManagementPages.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    position: '',
    profilePicture: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: ''
  });
  const [permissions, setPermissions] = useState({
    dashboard: false,
    staffManagement: false,
    rooms: false,
    reservations: false,
    inventory: false,
    sales: false,
    reports: false
  });
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = [...staff];
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.staffId && s.staffId.toLowerCase().includes(term))
      );
    }
    
    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(s => s.role === roleFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    setFilteredStaff(filtered);
  }, [staff, searchQuery, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      const data = await adminApi.getAllStaff();
      setStaff(data);
      setFilteredStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role || 'staff',
        position: staffMember.position || '',
        profilePicture: staffMember.profilePicture || '',
        address: staffMember.address || '',
        password: '',
        confirmPassword: ''
      });
      setPermissions(staffMember.permissions || {
        dashboard: false,
        staffManagement: false,
        rooms: false,
        reservations: false,
        inventory: false,
        sales: false,
        reports: false
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        role: 'staff',
        position: '',
        profilePicture: '',
        address: '',
        password: '',
        confirmPassword: ''
      });
      setPermissions({
        dashboard: false,
        staffManagement: false,
        rooms: false,
        reservations: false,
        inventory: false,
        sales: false,
        reports: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const validation = validateStaffMember(formData, !!editingStaff);
      if (!validation.isValid) {
        setMessageModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: validation.error
        });
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('position', formData.position);
      submitData.append('address', formData.address);
      
      if (formData.role === 'admin') {
        submitData.append('permissions', JSON.stringify(permissions));
      }
      
      if (!editingStaff) {
        if (formData.password) submitData.append('password', formData.password);
        if (formData.confirmPassword) submitData.append('confirmPassword', formData.confirmPassword);
      }
      
      if (formData.profilePicture && typeof formData.profilePicture === 'object' && formData.profilePicture instanceof File) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      if (editingStaff) {
        await adminApi.updateStaff(editingStaff._id, submitData);
      } else {
        await adminApi.createStaffAccount(submitData);
      }
      setIsModalOpen(false);
      fetchStaff();
      setMessageModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Staff account was successfully created!'
      });
    } catch (error) {
      console.error('Error saving staff:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error saving staff';
      setMessageModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: errorMsg
      });
    }
  };

  const handleResetPassword = (staffMember) => {
    setEditingStaff(staffMember);
    setPasswordData({ newPassword: '' });
    setIsPasswordModalOpen(true);
  };

  const handleSubmitPassword = async () => {
    try {
      const validation = validatePasswordReset(passwordData.newPassword);
      if (!validation.isValid) {
        setMessageModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: validation.error
        });
        return;
      }

      await adminApi.resetPassword(editingStaff._id, passwordData.newPassword);
      setIsPasswordModalOpen(false);
      fetchStaff();
      setMessageModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Password reset successfully!'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error resetting password';
      setMessageModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: errorMsg
      });
    }
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      if (staffMember.status === 'Active') {
        await adminApi.disableStaffAccount(staffMember._id);
      } else {
        await adminApi.activateStaffAccount(staffMember._id);
      }
      fetchStaff();
    } catch (error) {
      console.error('Error toggling staff status:', error);
      setMessageModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error toggling staff status'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteStaff(id);
        fetchStaff();
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessageModal({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Error deleting user'
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const columns = [
    {
      key: 'staffId',
      label: 'UserID',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
            {value}
          </span>
        </div>
      ),
      width: '80px'
    },
    { 
      key: 'profilePicture', 
      label: 'Profile', 
      render: (value, row) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid #f0f0f0'
          }}>
            {row.profilePicture ? (
              <img 
                src={row.profilePicture} 
                alt={row.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '24px' }}>👤</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {row.name}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
      width: '200px'
    },
    { 
      key: 'role', 
      label: 'User Role', 
      render: (value) => {
        const colors = {
          admin: { bg: '#1e3a8a', text: 'white' },
          staff: { bg: '#065f46', text: 'white' },
          manager: { bg: '#92400e', text: 'white' },
          auditor: { bg: '#16a34a', text: 'white' }
        };
        const style = colors[value?.toLowerCase()] || { bg: '#6b7280', text: 'white' };
        return (
          <span style={{
            backgroundColor: style.bg,
            color: style.text,
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'position',
      label: 'Position',
      render: (value) => (
        <span style={{ fontSize: '14px', color: '#475569' }}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const isActive = row.status === 'Active';
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isActive ? '#10b981' : '#ef4444'
            }}></span>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isActive ? '#10b981' : '#ef4444'
            }}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      }
    }
  ];

  const actions = [
    { label: 'Reset Password', type: 'password', handler: handleResetPassword },
    { label: 'Toggle Status', type: 'toggle', handler: handleToggleStatus }
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add User</button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          {/* Search */}
          <div className="filter-group search-group">
            <label>🔍 Search</label>
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by Name, Email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Role Filter */}
          <div className="filter-group">
            <label>👥 Role</label>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>⚡ Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-clear-filters" onClick={clearFilters}>
                <i className="fas fa-eraser"></i> Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{filteredStaff.length}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p className="stat-number">{filteredStaff.filter(s => s.role === 'admin').length}</p>
        </div>
        <div className="stat-card">
          <h3>Staff</h3>
          <p className="stat-number">{filteredStaff.filter(s => s.role === 'staff').length}</p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-number">{filteredStaff.filter(s => s.status === 'Active').length}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        actions={actions}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-header">
            <h3>{editingStaff ? '✎ Edit User' : '➕ Add New User'}</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <form className="form landscape">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={editingStaff ? (editingStaff.staffId || 'N/A') : (() => {
                    const rolePrefix = formData.role === 'admin' ? 'ADM' : 'STF';
                    const countWithRole = staff.filter(s => s.role === formData.role).length + 1;
                    return `${rolePrefix}-${String(countWithRole).padStart(3, '0')}`;
                  })()}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {formData.role === 'staff' ? (
                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Housekeeper">Housekeeper</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>
              ) : (
                <div className="form-group full-width">
                  <label>Permissions</label>
                  <div className="permissions-grid">
                    {[
                      { key: 'dashboard', label: '📊 Dashboard' },
                      { key: 'staffManagement', label: '👥 Staff Management' },
                      { key: 'rooms', label: '🏠 Rooms' },
                      { key: 'reservations', label: '📅 Reservations' },
                      { key: 'inventory', label: '📦 Inventory' },
                      { key: 'sales', label: '💰 Sales' },
                      { key: 'reports', label: '📊 Reports' }
                    ].map(perm => (
                      <label key={perm.key} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={permissions[perm.key] || false}
                          onChange={(e) => setPermissions({ ...permissions, [perm.key]: e.target.checked })}
                          className="checkbox-input"
                        />
                        <span className="checkbox-label">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })}
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              {!editingStaff && (
                <>
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingStaff ? 'Update' : 'Create'} User
            </button>
          </div>
        </Modal>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && (
        <Modal onClose={() => setIsPasswordModalOpen(false)}>
          <div className="modal-header">
            <h3>🔐 Reset Password</h3>
            <button className="modal-close" onClick={() => setIsPasswordModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <form className="form">
              <div className="form-group">
                <label>User: {editingStaff?.name}</label>
              </div>
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmitPassword}>Reset Password</button>
          </div>
        </Modal>
      )}

      {/* Message Modal - Global */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
      />
    </div>
  );
};

export default StaffManagement;