import React from 'react';

function TaskDetailsModal({ task, onClose, getStatusColor, getPriorityColor }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>
          <i className="fas fa-tasks" style={{ marginRight: '8px', color: '#0284c7' }}></i>
          {task.title}
        </h2>

        <div className="modal-details">
          <div className="details-grid">
            <div className="detail-card">
              <label className="detail-label">Room</label>
              <span className="detail-value">{task.roomId?.name || 'Unknown Room'}</span>
            </div>
            <div className="detail-card">
              <label className="detail-label">Type</label>
              <span className="detail-value">{task.taskType}</span>
            </div>
            <div className="detail-card">
              <label className="detail-label">Status</label>
              <span
                className="detail-value"
                style={{ color: getStatusColor(task.status) }}
              >
                {task.status}
              </span>
            </div>
            <div className="detail-card">
              <label className="detail-label">Priority</label>
              <span
                className="detail-value"
                style={{ color: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <label className="section-label">Due Date</label>
            <span className="section-value">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>

          {task.description && (
            <div className="detail-section full-width">
              <label className="section-label">Description</label>
              <span className="section-value">{task.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
