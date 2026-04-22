import React, { useState, useEffect, useCallback } from 'react';
import * as staffApi from '../services/staffDashboardApi';
import NotificationBell from '../components/staff/NotificationBell';
import './StaffDashboard.css';

/**
 * Staff Dashboard Component - Professional Layout (Admin Style)
 */
const StaffDashboard = () => {
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
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className="staff-dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Welcome back, {stats.staffName}</p>
        </div>
        <div className="header-actions">
          <div className="staff-info-badge">
            <i className="fas fa-user-circle"></i>
            <span>{stats.position}</span>
          </div>
          <NotificationBell refreshInterval={10000} />
        </div>
      </div>

      {/* Stats Grid - Same as Admin Dashboard */}
      <div className="stats-section">
        <h2 className="section-title">Task Overview</h2>
        <div className="stats-grid">
          <div className="stat-card" style={{ borderTopColor: '#f59e0b' }}>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <h3>Pending Tasks</h3>
              <div className="stat-value">{stats.pendingTasks || 0}</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTopColor: '#3b82f6' }}>
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <i className="fas fa-spinner"></i>
            </div>
            <div className="stat-info">
              <h3>In Progress</h3>
              <div className="stat-value">{stats.inProgressTasks || 0}</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTopColor: '#10b981' }}>
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <h3>Completed</h3>
              <div className="stat-value">{stats.completedTasks || 0}</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTopColor: '#ef4444' }}>
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <i className="fas fa-bell"></i>
            </div>
            <div className="stat-info">
              <h3>Notifications</h3>
              <div className="stat-value">{stats.unreadNotifications || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="stats-section">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-line"></i> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <i className="fas fa-tasks"></i> My Tasks
            {stats.pendingTasks > 0 && (
              <span className="tab-badge">{stats.pendingTasks}</span>
            )}
          </button>
        </div>

        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="overview-grid">
                <div className="info-card">
                  <h3>
                    <i className="fas fa-chart-pie"></i> Task Summary
                  </h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span>Total Tasks:</span>
                      <strong>{stats.totalTasks || 0}</strong>
                    </div>
                    <div className="info-item">
                      <span>Pending:</span>
                      <strong style={{ color: '#f59e0b' }}>{stats.pendingTasks || 0}</strong>
                    </div>
                    <div className="info-item">
                      <span>In Progress:</span>
                      <strong style={{ color: '#3b82f6' }}>{stats.inProgressTasks || 0}</strong>
                    </div>
                    <div className="info-item">
                      <span>Completed:</span>
                      <strong style={{ color: '#10b981' }}>{stats.completedTasks || 0}</strong>
                    </div>
                    <div className="info-item">
                      <span>Cancelled:</span>
                      <strong style={{ color: '#ef4444' }}>{stats.cancelledTasks || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>
                    <i className="fas fa-door-open"></i> Room Assignments
                  </h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span>Assigned Rooms:</span>
                      <strong>{stats.assignedRoomsCount || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>
                    <i className="fas fa-chart-line"></i> Performance
                  </h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span>Completion Rate:</span>
                      <strong>
                        {stats.totalTasks > 0 
                          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                          : 0}%
                      </strong>
                    </div>
                    <div className="info-item">
                      <span>Productivity:</span>
                      <strong>
                        {stats.totalTasks > 0 
                          ? Math.round(((stats.completedTasks + stats.inProgressTasks) / stats.totalTasks) * 100)
                          : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="tasks-content">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;