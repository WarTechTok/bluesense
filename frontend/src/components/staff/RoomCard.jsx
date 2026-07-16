import React from 'react';

function RoomCard({ room, onViewDetails, getRoomStatusColor, getRatingColor }) {
  return (
    <div className="room-card">
      <div className="room-card-header">
        <div className="room-title-section">
          <h3>{room.name}</h3>
          <span
            className="room-status-badge"
            style={{ backgroundColor: getRoomStatusColor(room.status) }}
          >
            {room.status}
          </span>
        </div>
      </div>

      <div className="room-details">
        <div className="detail-item">
          <i className="fas fa-tag"></i>
          <div>
            <label>Room Number:</label>
            <span>{room.roomNumber || '—'}</span>
          </div>
        </div>

        <div className="detail-item">
          <i className="fas fa-bed"></i>
          <div>
            <label>Type:</label>
            <span>{room.roomType || 'Standard'}</span>
          </div>
        </div>

        <div className="detail-item">
          <i className="fas fa-star"></i>
          <div>
            <label>Cleanliness Rating:</label>
            <span style={{ color: getRatingColor(room.rating) }}>
              {room.rating ?? '—'}/5 <i className="fas fa-star"></i>
            </span>
          </div>
        </div>

        {room.floor && (
          <div className="detail-item">
            <i className="fas fa-layer-group"></i>
            <div>
              <label>Floor:</label>
              <span>{room.floor}</span>
            </div>
          </div>
        )}

        {room.lastCleaned && (
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <div>
              <label>Last Cleaned:</label>
              <span>{new Date(room.lastCleaned).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {room.notes && (
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
