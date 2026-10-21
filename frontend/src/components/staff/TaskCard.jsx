import React, { useState, useRef, useCallback } from 'react';

/**
 * TaskCard
 *
 * Local form state (completionNotes + completionProof) lives entirely inside
 * this component and is NOT derived from props, so parent re-renders caused
 * by the auto-refresh interval never wipe what the staff member has typed or
 * uploaded.
 *
 * The form resets only after onStatusChange resolves successfully — the parent
 * should call the resetForm callback it receives via onStatusChange's fourth
 * argument, or we reset optimistically after a successful submit.
 */
function TaskCard({
  task,
  onViewDetails,
  onStatusChange,
  onDelete,
  getStatusColor,
  getPriorityColor,
}) {
  // ── Local form state ──────────────────────────────────────────────────────
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionProof, setCompletionProof] = useState(null); // File object
  const [submitting, setSubmitting] = useState(false);
  // Keep a display-only file name so we can show it without re-reading state
  const fileInputRef = useRef(null);

  // ── Pool-task detection ───────────────────────────────────────────────────
  const taskText = `${task.title || ''} ${task.description || ''}`;
  const isPoolTask =
    task.locationType === 'Pool' ||
    (!task.roomId && /\bpool\b/i.test(taskText));
  const oasisFromText = taskText.match(/Oasis\s*([12])/i)?.[1];
  const oasis =
    task.oasis ||
    task.roomId?.oasis ||
    (oasisFromText ? `Oasis ${oasisFromText}` : null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e) => {
    setCompletionProof(e.target.files?.[0] || null);
  }, []);

  const resetForm = useCallback(() => {
    setCompletionNotes('');
    setCompletionProof(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmitReport = useCallback(async () => {
    if (!completionNotes.trim() || !completionProof) return;
    setSubmitting(true);
    try {
      await onStatusChange(task._id, 'Completed', completionNotes.trim(), completionProof);
      // Only reset the form after the parent confirms success
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }, [task._id, completionNotes, completionProof, onStatusChange, resetForm]);

  // ── Render ────────────────────────────────────────────────────────────────
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
            <label>{isPoolTask ? 'Pool:' : 'Room:'}</label>
            <span>
              {task.roomId?.name ||
                (isPoolTask ? 'Water Monitoring' : 'Unknown Room')}
              {oasis && ` — ${oasis}`}
            </span>
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

        {task.status === 'In Progress' &&
          (isPoolTask ? (
            // ── Pool-task completion form ──────────────────────────────────
            <div className="task-completion-report">
              <label htmlFor={`completion-report-${task._id}`}>
                Completion report for admin
              </label>
              <textarea
                id={`completion-report-${task._id}`}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe the water monitoring work completed and any findings"
                rows="3"
              />

              <label htmlFor={`completion-proof-${task._id}`}>
                Proof image
              </label>
              <input
                id={`completion-proof-${task._id}`}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {completionProof && (
                <p className="file-selected-hint">
                  <i className="fas fa-paperclip"></i> {completionProof.name}
                </p>
              )}

              <button
                className="btn btn-success"
                disabled={
                  !completionNotes.trim() || !completionProof || submitting
                }
                onClick={handleSubmitReport}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting…
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Submit Report & Complete
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => onStatusChange(task._id, 'Completed')}
            >
              <i className="fas fa-check"></i> Mark Complete
            </button>
          ))}

        <button
          className="btn btn-secondary"
          onClick={() => onViewDetails(task)}
        >
          <i className="fas fa-eye"></i> View Details
        </button>

        {(!isPoolTask || task.reviewedAt) && (
          <button
            className="btn btn-danger"
            onClick={() => onDelete(task._id)}
          >
            <i className="fas fa-trash-alt"></i> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;