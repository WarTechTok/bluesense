import React from 'react';

function RoomDetailsModal({ room, onClose, getRoomStatusColor, getRatingColor }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>
          <i className="fas fa-door-open" style={{ marginRight: '8px', color: '#0284c7' }}></i>
          {room.name}
        </h2>

        <div className="modal-details">
          <div className="details-grid">
            <div className="detail-card">
              <label className="detail-label">Room Number</label>
              <span className="detail-value">{room.roomNumber || '—'}</span>
            </div>
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
            <div className="detail-card">
              <label className="detail-label">Type</label>
              <span className="detail-value">{room.roomType || 'Standard'}</span>
            </div>
            <div className="detail-card">
              <label className="detail-label">Cleanliness Rating</label>
              <span className="detail-value rating-badge" style={{ color: getRatingColor(room.rating) }}>
                {room.rating ?? '—'}/5 <i className="fas fa-star" style={{ marginLeft: '6px' }}></i>
              </span>
            </div>
          </div>

          {room.floor && (
            <div className="detail-section">
              <label className="section-label">Floor</label>
              <span className="section-value">{room.floor}</span>
            </div>
          )}

          {room.lastCleaned && (
            <div className="detail-section">
              <label className="section-label">Last Cleaned</label>
              <span className="section-value">{new Date(room.lastCleaned).toLocaleDateString()}</span>
            </div>
          )}

          {room.notes && (
            <div className="detail-section full-width">
              <label className="section-label">Notes</label>
              <span className="section-value">{room.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetailsModal;
