import React, { useState, useEffect } from 'react';
import * as staffApi from '../services/staffDashboardApi';
import NotificationBell from '../components/staff/NotificationBell';
import './StaffDashboard.css';

/**
 * Staff Dashboard Component - Clean & Working
 */
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'In Progress': '#17a2b8',
      'Completed': '#28a745',
      'Cancelled': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': '#dc3545',
      'High': '#ff6b6b',
      'Medium': '#ffc107',
      'Low': '#17a2b8'
    };
    return colors[priority] || '#6c757d';
  };

  // Loading state
  if (loading) {
    return (
      <div className="staff-dashboard loading">
        <div>Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="staff-dashboard loading">
        <div style={{ color: '#dc3545', textAlign: 'center' }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  // No data
  if (!stats) {
    return (
      <div className="staff-dashboard loading">
        <div>No data available</div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Staff Dashboard</h1>
          <p className="staff-title">
            {stats.position} • {stats.staffName}
          </p>
        </div>
        <div className="header-right">
          <p className="welcome-text">Welcome back, {stats.staffName}</p>
          <NotificationBell refreshInterval={10000} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-value">{stats.pendingTasks || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
            <i className="fas fa-spinner"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgressTasks || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completedTasks || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dc3545' }}>
            <i className="fas fa-bell"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Notifications</div>
            <div className="stat-value">{stats.unreadNotifications || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-line"></i> Overview
          </button>
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <i className="fas fa-tasks"></i> Tasks
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane overview-pane">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Task Summary</h3>
                <div className="summary-item">
                  <span>Total Tasks:</span>
                  <strong>{stats.totalTasks || 0}</strong>
                </div>
                <div className="summary-item">
                  <span>Pending:</span>
                  <strong style={{ color: getStatusColor('Pending') }}>
                    {stats.pendingTasks || 0}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>In Progress:</span>
                  <strong style={{ color: getStatusColor('In Progress') }}>
                    {stats.inProgressTasks || 0}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Completed:</span>
                  <strong style={{ color: getStatusColor('Completed') }}>
                    {stats.completedTasks || 0}
                  </strong>
                </div>
              </div>

              <div className="overview-card">
                <h3>Room Assignments</h3>
                <div className="summary-item">
                  <span>Assigned Rooms:</span>
                  <strong>{stats.assignedRoomsCount || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="tab-pane tasks-pane">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No tasks assigned</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task._id} className="task-card">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <div className="task-badges">
                        <span 
                          className="badge" 
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {task.status}
                        </span>
                        <span 
                          className="badge"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="task-body">
                      {task.roomId && (
                        <p><strong>Room:</strong> {task.roomId.name}</p>
                      )}
                      {task.dueDate && (
                        <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                      {task.taskType && (
                        <p><strong>Type:</strong> {task.taskType}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
