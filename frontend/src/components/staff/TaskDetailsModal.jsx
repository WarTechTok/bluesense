import React from 'react';

function TaskDetailsModal({ task, onClose, getStatusColor, getPriorityColor }) {
  const taskText = `${task.title || ''} ${task.description || ''}`;
  const isPoolTask = task.locationType === 'Pool'
    || (!task.roomId && /\bpool\b/i.test(taskText));
  const oasisFromText = taskText.match(/Oasis\s*([12])/i)?.[1];
  const oasis = task.oasis
    || task.roomId?.oasis
    || (oasisFromText ? `Oasis ${oasisFromText}` : null);

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
              <label className="detail-label">{isPoolTask ? 'Pool' : 'Room'}</label>
              <span className="detail-value">
                {task.roomId?.name || (isPoolTask ? 'Water Monitoring' : 'Unknown Room')}
                {oasis && ` — ${oasis}`}
              </span>
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

          <div className="detail-card full-width">
            <label className="detail-label">Due Date</label>
            <span className="detail-value">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>

          {task.description && (
            <div className="detail-card full-width">
              <label className="detail-label">Description</label>
              <span className="detail-value">{task.description}</span>
            </div>
          )}

          {task.completionNotes && (
            <div className="detail-card full-width">
              <label className="detail-label">Completion Report</label>
              <span className="detail-value">{task.completionNotes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
