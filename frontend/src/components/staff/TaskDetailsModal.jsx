import React from 'react';

function TaskDetailsModal({ task, onClose, getStatusColor, getPriorityColor }) {
  const taskText = `${task.title || ''} ${task.description || ''}`;
  const isPoolTask = task.locationType === 'Pool'
    || (!task.roomId && /\bpool\b/i.test(taskText));
  const oasisFromText = taskText.match(/Oasis\s*([12])/i)?.[1];
  const oasis = task.oasis
    || task.roomId?.oasis
    || (oasisFromText ? `Oasis ${oasisFromText}` : null);

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>
          <i className="fas fa-tasks" style={{ marginRight: '8px', color: '#0284c7' }}></i>
          {task.title}
        </h2>

        <div className="modal-details">
          {/* Row 1 — location + type */}
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
              <span className="detail-value">{task.taskType || '—'}</span>
            </div>
          </div>

          {/* Row 2 — status + priority */}
          <div className="details-grid">
            <div className="detail-card">
              <label className="detail-label">Status</label>
              <span className="detail-value" style={{ color: getStatusColor(task.status), fontWeight: 700 }}>
                {task.status}
              </span>
            </div>
            <div className="detail-card">
              <label className="detail-label">Priority</label>
              <span className="detail-value" style={{ color: getPriorityColor(task.priority), fontWeight: 700 }}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Row 3 — dates */}
          <div className="details-grid">
            <div className="detail-card">
              <label className="detail-label">Due Date</label>
              <span className="detail-value">{formatDate(task.dueDate)}</span>
            </div>
            {task.completedAt && (
              <div className="detail-card">
                <label className="detail-label">Completed At</label>
                <span className="detail-value">{formatDate(task.completedAt)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="detail-card full-width">
              <label className="detail-label">Description</label>
              <span className="detail-value" style={{ fontWeight: 400, whiteSpace: 'pre-wrap' }}>
                {task.description}
              </span>
            </div>
          )}

          {/* Completion report */}
          {task.completionNotes && (
            <div className="detail-card full-width" style={{ borderLeft: '3px solid #0284c7' }}>
              <label className="detail-label">Completion Report</label>
              <span className="detail-value" style={{ fontWeight: 400, whiteSpace: 'pre-wrap' }}>
                {task.completionNotes}
              </span>
            </div>
          )}

          {/* Proof image */}
          {task.completionProofUrl ? (
            <div className="detail-card full-width">
              <label className="detail-label">Proof Image</label>
              <a
                href={task.completionProofUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', marginTop: '4px' }}
              >
                <img
                  src={task.completionProofUrl}
                  alt="Completion proof"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'block'
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '6px', display: 'block' }}>
                  Tap to open full image
                </span>
              </a>
            </div>
          ) : task.status === 'Completed' ? (
            <div className="detail-card full-width" style={{ background: '#fef9ef', borderLeft: '3px solid #f59e0b' }}>
              <label className="detail-label">Proof Image</label>
              <span className="detail-value" style={{ color: '#92400e', fontWeight: 400 }}>
                No proof image was submitted.
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;