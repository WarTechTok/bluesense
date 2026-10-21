import React from 'react';

function RoomCard({ room, onViewDetails, getRoomStatusColor, getRatingColor }) {
  const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
  const rating = hasValue(room.rating) && Number.isFinite(Number(room.rating))
    ? Number(room.rating)
    : null;
  const lastCleanedDate = room.lastCleaned ? new Date(room.lastCleaned) : null;
  const hasLastCleaned = lastCleanedDate && !Number.isNaN(lastCleanedDate.getTime());

  return (
    <div className="room-card">
      <div className="room-card-header">
        <div className="room-title-section">
          <h3>{room.name}</h3>
          {hasValue(room.status) && (
            <span
              className="room-status-badge"
              style={{ backgroundColor: getRoomStatusColor(room.status) }}
            >
              {room.status}
            </span>
          )}
        </div>
      </div>

      <div className="room-details">
        <div className="detail-item">
          <i className="fas fa-tag"></i>
          <div>
            <label>Room Name:</label>
            <span>{room.name || '—'}</span>
          </div>
        </div>

        {hasValue(room.roomType) && (
          <div className="detail-item">
            <i className="fas fa-bed"></i>
            <div>
              <label>Type:</label>
              <span>{room.roomType}</span>
            </div>
          </div>
        )}

        {rating !== null && (
          <div className="detail-item">
            <i className="fas fa-star"></i>
            <div>
              <label>Cleanliness Rating:</label>
              <span style={{ color: getRatingColor(rating) }}>
                {rating}/5 <i className="fas fa-star"></i>
              </span>
            </div>
          </div>
        )}

        {room.floor && (
          <div className="detail-item">
            <i className="fas fa-layer-group"></i>
            <div>
              <label>Floor:</label>
              <span>{room.floor}</span>
            </div>
          </div>
        )}

        {hasLastCleaned && (
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <div>
              <label>Last Cleaned:</label>
              <span>{lastCleanedDate.toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {hasValue(room.notes) && (
          <div className="detail-item full-width">
            <i className="fas fa-sticky-note"></i>
            <div>
              <label>Notes:</label>
              <span>{room.notes}</span>
            </div>
          </div>
        )}
      </div>

      <div className="room-actions">
        <button className="btn btn-secondary" onClick={() => onViewDetails(room)}>
          <i className="fas fa-eye"></i> View Details
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
