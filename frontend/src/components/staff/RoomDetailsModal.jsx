import React from 'react';

function RoomDetailsModal({ room, onClose, getRoomStatusColor, getRatingColor }) {
  const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
  const rating = hasValue(room.rating) && Number.isFinite(Number(room.rating))
    ? Number(room.rating)
    : null;
  const lastCleanedDate = room.lastCleaned ? new Date(room.lastCleaned) : null;
  const hasLastCleaned = lastCleanedDate && !Number.isNaN(lastCleanedDate.getTime());

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>
          <i className="fas fa-door-open" style={{ marginRight: '8px', color: '#0284c7' }}></i>
          {room.name || 'Room Details'}
        </h2>

        <div className="modal-details">
          <div className="details-grid">
            {hasValue(room.name) && (
              <div className="detail-card">
                <label className="detail-label">Room Name</label>
                <span className="detail-value">{room.name}</span>
              </div>
            )}
            {hasValue(room.status) && (
              <div className="detail-card">
                <label className="detail-label">Status</label>
                <span
                  className="detail-value"
                  style={{
                    color: getRoomStatusColor(room.status),
                    backgroundColor: `${getRoomStatusColor(room.status)}20`,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {room.status}
                </span>
              </div>
            )}
            {hasValue(room.roomType) && (
              <div className="detail-card">
                <label className="detail-label">Type</label>
                <span className="detail-value">{room.roomType}</span>
              </div>
            )}
            {rating !== null && (
              <div className="detail-card">
                <label className="detail-label">Cleanliness Rating</label>
                <span className="detail-value rating-badge" style={{ color: getRatingColor(rating) }}>
                  {rating}/5 <i className="fas fa-star" style={{ marginLeft: '6px' }}></i>
                </span>
              </div>
            )}
          </div>

          {hasValue(room.floor) && (
            <div className="detail-card full-width">
              <label className="detail-label">Floor</label>
              <span className="detail-value">{room.floor}</span>
            </div>
          )}

          {hasLastCleaned && (
            <div className="detail-card full-width">
              <label className="detail-label">Last Cleaned</label>
              <span className="detail-value">{lastCleanedDate.toLocaleDateString()}</span>
            </div>
          )}

          {hasValue(room.notes) && (
            <div className="detail-card full-width">
              <label className="detail-label">Notes</label>
              <span className="detail-value">{room.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetailsModal;
