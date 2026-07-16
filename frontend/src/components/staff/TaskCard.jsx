import React from 'react';

function TaskCard({ task, onViewDetails, onStatusChange, onDelete, getStatusColor, getPriorityColor }) {
  return (
    <div className="task-card">
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
            onClick={() => onStatusChange(task._id, 'In Progress')}
          >
            <i className="fas fa-play"></i> Start Work
          </button>
        )}
        {task.status === 'In Progress' && (
          <button
            className="btn btn-success"
            onClick={() => onStatusChange(task._id, 'Completed')}
          >
            <i className="fas fa-check"></i> Mark Complete
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => onViewDetails(task)}
        >
          <i className="fas fa-eye"></i> View Details
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(task._id)}
        >
          <i className="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;