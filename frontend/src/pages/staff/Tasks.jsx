import React, { useState, useEffect } from 'react';
import * as staffApi from '../../services/staffDashboardApi';
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (status = '') => {
    try {
      setLoading(true);
      const data = await staffApi.getTasks(status ? { status } : {});
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    fetchTasks(status);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await staffApi.updateTaskStatus(taskId, { status: newStatus });
      alert('✅ Task status updated successfully!');
      fetchTasks(filter);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('❌ Error updating task');
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
    <div className="tasks-page">
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>View and manage your assigned cleaning tasks</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
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
      </div>

      {/* Tasks Grid */}
      <div className="tasks-container">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h2>No tasks assigned</h2>
            <p>Check back later for new cleaning assignments</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-card-header">
                <div className="task-title-badge">
                  <h3>{task.title}</h3>
                  <div className="badges">
                    <span
                      className="badge status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                    <span
                      className="badge priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="task-details">
                <div className="detail-item">
                  <i className="fas fa-door-open"></i>
                  <div>
                    <label>Room:</label>
                    <span>{task.roomId?.name || 'Unknown Room'}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <i className="fas fa-calendar"></i>
                  <div>
                    <label>Due Date:</label>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <i className="fas fa-tag"></i>
                  <div>
                    <label>Task Type:</label>
                    <span>{task.taskType}</span>
                  </div>
                </div>

                {task.description && (
                  <div className="detail-item full-width">
                    <i className="fas fa-file-alt"></i>
                    <div>
                      <label>Description:</label>
                      <span>{task.description}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="task-actions">
                {task.status === 'Pending' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(task._id, 'In Progress')}
                  >
                    <i className="fas fa-play"></i> Start Work
                  </button>
                )}
                {task.status === 'In Progress' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleStatusChange(task._id, 'Completed')}
                  >
                    <i className="fas fa-check"></i> Mark Complete
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedTask(task)}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            </div>
          ))
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
            <h2>{selectedTask.title}</h2>
            <div className="modal-details">
              <p>
                <strong>Room:</strong> {selectedTask.roomId?.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedTask.taskType}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    color: getStatusColor(selectedTask.status),
                    fontWeight: '600',
                  }}
                >
                  {selectedTask.status}
                </span>
              </p>
              <p>
                <strong>Priority:</strong>{' '}
                <span
                  style={{
                    color: getPriorityColor(selectedTask.priority),
                    fontWeight: '600',
                  }}
                >
                  {selectedTask.priority}
                </span>
              </p>
              <p>
                <strong>Due Date:</strong>{' '}
                {new Date(selectedTask.dueDate).toLocaleDateString()}
              </p>
              {selectedTask.description && (
                <p>
                  <strong>Description:</strong> {selectedTask.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
