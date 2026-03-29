import React, { useState, useEffect } from 'react';
import * as staffApi from '../services/staffDashboardApi';
import NotificationBell from '../components/staff/NotificationBell';
import './StaffDashboard.css';

/**
 * Staff Dashboard Component
 * Main dashboard for staff members
 * Features: 
 * - Tabs: Overview (stats & summaries), Tasks (assigned tasks)
 * - Notification Bell: Real-time notifications in header
 * - Stats Cards: Quick overview of tasks and assigned rooms
 * - Professional admin-style design
 */
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('');

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const data = await staffApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch tasks
  const fetchTasks = async (status = '') => {
    try {
      setLoading(true);
      const data = await staffApi.getTasks(status ? { status } : {});
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  // Handle task status change
  const handleTaskStatusChange = async (taskId, newStatus, notes = '') => {
    try {
      await staffApi.updateTaskStatus(taskId, { status: newStatus, notes });
      alert('✅ Task updated successfully!');
      fetchTasks(taskFilter);
      fetchStats();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('❌ Error updating task');
    }
  };

  // Status badge color
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

  // Priority badge color
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

  if (!stats) {
    return <div className="staff-dashboard loading">Loading dashboard...</div>;
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
            <div className="stat-value">{stats.pendingTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
            <i className="fas fa-spinner"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgressTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completedTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dc3545' }}>
            <i className="fas fa-bell"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Notifications</div>
            <div className="stat-value">{stats.unreadNotifications}</div>
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
            {stats.pendingTasks + stats.inProgressTasks > 0 && (
              <span className="badge">{stats.pendingTasks + stats.inProgressTasks}</span>
            )}
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
                  <strong>{stats.totalTasks}</strong>
                </div>
                <div className="summary-item">
                  <span>Pending:</span>
                  <strong style={{ color: getStatusColor('Pending') }}>
                    {stats.pendingTasks}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>In Progress:</span>
                  <strong style={{ color: getStatusColor('In Progress') }}>
                    {stats.inProgressTasks}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Completed:</span>
                  <strong style={{ color: getStatusColor('Completed') }}>
                    {stats.completedTasks}
                  </strong>
                </div>
              </div>

              <div className="overview-card">
                <h3>Room Assignments</h3>
                <div className="summary-item">
                  <span>Assigned Rooms:</span>
                  <strong>{stats.assignedRoomsCount}</strong>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('tasks')}
                >
                  View Assigned Tasks <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="tab-pane tasks-pane">
            {/* Filter */}
            <div className="task-filter">
              <select
                value={taskFilter}
                onChange={(e) => {
                  setTaskFilter(e.target.value);
                  fetchTasks(e.target.value);
                }}
                className="filter-select"
              >
                <option value="">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Tasks List */}
            <div className="tasks-list">
              {loading ? (
                <div className="loading-state">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No tasks assigned</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="task-card">
                    <div className="task-header">
                      <div className="task-title-section">
                        <h4>{task.title}</h4>
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

                    <div className="task-info">
                      <div className="info-item">
                        <i className="fas fa-door-open"></i>
                        <span>{task.roomId?.name}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-calendar"></i>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-tag"></i>
                        <span>{task.taskType}</span>
                      </div>
                    </div>

                    {task.description && (
                      <div className="task-description">
                        <p>{task.description}</p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="task-actions">
                      {task.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              handleTaskStatusChange(task._id, 'In Progress')
                            }
                          >
                            <i className="fas fa-play"></i> Start Work
                          </button>
                        </>
                      )}
                      {task.status === 'In Progress' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleTaskStatusChange(task._id, 'Completed')}
                          >
                            <i className="fas fa-check"></i> Mark Complete
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedTask(task)}
                      >
                        <i className="fas fa-eye"></i> Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedTask(null)}
            >
              ✕
            </button>
            <h3>{selectedTask.title}</h3>
            <div className="task-details">
              <p>
                <strong>Room:</strong> {selectedTask.roomId?.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedTask.taskType}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: getStatusColor(selectedTask.status) }}>
                  {selectedTask.status}
                </span>
              </p>
              <p>
                <strong>Priority:</strong>{' '}
                <span style={{ color: getPriorityColor(selectedTask.priority) }}>
                  {selectedTask.priority}
                </span>
              </p>
              <p>
                <strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Description:</strong> {selectedTask.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
