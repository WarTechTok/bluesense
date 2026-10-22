import React from 'react';

function RoomDetailsModal({ room, onClose, getRoomStatusColor, getRatingColor }) {
  const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
  const rating = hasValue(room.rating) && Number.isFinite(Number(room.rating))
    ? Number(room.rating)
    : null;
  const lastCleanedDate = room.lastCleaned ? new Date(room.lastCleaned) : null;
  const hasLastCleaned = lastCleanedDate && !Number.isNaN(lastCleanedDate.getTime());

  return (
    <div className="rdm-overlay" onClick={onClose}>
      <div className="rdm-content" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rdm-header">
          <div className="rdm-header-meta">
            <span className="rdm-badge">Room Details</span>
            <h2 className="rdm-title">
              <i className="fas fa-door-open rdm-title-icon" aria-hidden="true"></i>
              {room.name || 'Room Details'}
            </h2>
          </div>
          <button className="rdm-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="rdm-body">

          <div className="rdm-section">
            <p className="rdm-section-title">Overview</p>
            <div className="rdm-grid rdm-grid--2">

              {hasValue(room.name) && (
                <div className="rdm-card">
                  <span className="rdm-label">Room Name</span>
                  <span className="rdm-value">{room.name}</span>
                </div>
              )}

              {hasValue(room.status) && (
                <div className="rdm-card">
                  <span className="rdm-label">Status</span>
                  <span
                    className="rdm-status-chip"
                    style={{
                      color: getRoomStatusColor(room.status),
                      backgroundColor: `${getRoomStatusColor(room.status)}18`,
                    }}
                  >
                    {room.status}
                  </span>
                </div>
              )}

              {hasValue(room.roomType) && (
                <div className="rdm-card">
                  <span className="rdm-label">Type</span>
                  <span className="rdm-value">{room.roomType}</span>
                </div>
              )}

              {rating !== null && (
                <div className="rdm-card">
                  <span className="rdm-label">Cleanliness Rating</span>
                  <span className="rdm-value rdm-value--accent" style={{ color: getRatingColor(rating) }}>
                    {rating}<span className="rdm-value--muted"> / 5</span>
                    <i className="fas fa-star" style={{ marginLeft: '5px', fontSize: '0.75rem' }}></i>
                  </span>
                </div>
              )}

              {hasValue(room.floor) && (
                <div className="rdm-card">
                  <span className="rdm-label">Floor</span>
                  <span className="rdm-value">{room.floor}</span>
                </div>
              )}

              {hasLastCleaned && (
                <div className="rdm-card">
                  <span className="rdm-label">Last Cleaned</span>
                  <span className="rdm-value rdm-value--sm">{lastCleanedDate.toLocaleDateString()}</span>
                </div>
              )}

            </div>
          </div>

          {hasValue(room.notes) && (
            <div className="rdm-section">
              <p className="rdm-section-title">Notes</p>
              <p className="rdm-notes-block">{room.notes}</p>
            </div>
          )}

        </div>{/* end rdm-body */}

        {/* Footer */}
        <div className="rdm-footer">
          <button className="rdm-btn-close" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}

export default RoomDetailsModal;