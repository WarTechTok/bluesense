import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import * as adminApi from '../../services/admin/adminApi';
import './ManagementPages.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await adminApi.getAllStaff();
      setStaff(data);
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
        role: staffMember.role,
        password: ''
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        role: 'Staff',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingStaff) {
        await adminApi.updateStaff(editingStaff._id, formData);
      } else {
        await adminApi.createStaffAccount(formData);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error saving staff');
    }
  };

  const handleResetPassword = (staffMember) => {
    setEditingStaff(staffMember);
    setPasswordData({ newPassword: '' });
    setIsPasswordModalOpen(true);
  };

  const handleSubmitPassword = async () => {
    try {
      await adminApi.resetPassword(editingStaff._id, passwordData.newPassword);
      setIsPasswordModalOpen(false);
      fetchStaff();
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
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
      alert('Error toggling staff status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await adminApi.deleteStaff(id);
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Error deleting staff');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => <span className="role-badge">{value}</span> },
    { key: 'status', label: 'Status', render: (value) => <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span> }
  ];

  const actions = [
    { label: 'Reset Password', type: 'password', handler: handleResetPassword },
    { label: 'Toggle Status', type: 'toggle', handler: handleToggleStatus }
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Staff Account Management</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Staff</button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        actions={actions}
      />

      <Modal
        isOpen={isModalOpen}
        title={editingStaff ? 'Edit Staff' : 'Add New Staff'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <form className="form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          {!editingStaff && (
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        title="Reset Password"
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleSubmitPassword}
      >
        <form className="form">
          <div className="form-group">
            <label>Staff: {editingStaff?.name}</label>
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
      </Modal>
    </div>
  );
};

export default StaffManagement;
