import React, { useState, useEffect } from 'react';
import * as staffApi from '../../services/staffDashboardApi';
import './Inspections.css';

/**
 * Staff Inspections Page
 * Staff can:
 * - Create new inspection reports
 * - Report damages found
 * - List items that need replacement/repair
 * - Add notes about room condition
 * - View inspection history
 */
const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    roomId: '',
    condition: 'Good',
    cleaningNeeded: 'Yes',
    damageFound: 'No',
    damageDescription: '',
    itemsNeeded: '',
    notes: '',
    rating: 5,
  });

  useEffect(() => {
    fetchInspections();
    fetchRooms();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getMyInspections?.();
      setInspections(data?.inspections || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await staffApi.getAssignedRooms?.();
      setRooms(data?.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roomId) {
      alert('Please select a room');
      return;
    }

    try {
      await staffApi.createInspectionRecord({
        roomId: formData.roomId,
        condition: formData.condition,
        cleaningNeeded: formData.cleaningNeeded,
        damageFound: formData.damageFound,
        damageDescription: formData.damageDescription,
        itemsNeeded: formData.itemsNeeded,
        notes: formData.notes,
        rating: parseInt(formData.rating),
      });

      alert('✅ Inspection report submitted successfully!');
      setFormData({
        roomId: '',
        condition: 'Good',
        cleaningNeeded: 'Yes',
        damageFound: 'No',
        damageDescription: '',
        itemsNeeded: '',
        notes: '',
        rating: 5,
      });
      setShowForm(false);
      fetchInspections();
    } catch (error) {
      console.error('Error creating inspection:', error);
      alert('❌ Error submitting inspection report');
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return '#10b981';
      case 'Good':
        return '#3b82f6';
      case 'Fair':
        return '#f59e0b';
      case 'Poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="inspections-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Room Inspections</h1>
          <p>Create and track room inspection reports</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i> {showForm ? 'Cancel' : 'New Inspection'}
        </button>
      </div>

      {/* Inspection Form */}
      {showForm && (
        <form className="inspection-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Room Information</h3>
            <div className="form-group">
              <label>Select Room *</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">-- Choose a room --</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name} - {room.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Room Condition</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Overall Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Room Quality Rating (1-10)</label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cleaning Needed?</label>
                <select
                  name="cleaningNeeded"
                  value={formData.cleaningNeeded}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Damages Found?</label>
                <select
                  name="damageFound"
                  value={formData.damageFound}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {formData.damageFound === 'Yes' && (
            <div className="form-section">
              <h3>Damage Details</h3>
              <div className="form-group">
                <label>Describe the damage</label>
                <textarea
                  name="damageDescription"
                  value={formData.damageDescription}
                  onChange={handleInputChange}
                  placeholder="Describe all damages found in the room..."
                  className="form-input textarea"
                  rows="4"
                />
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Items & Resources</h3>
            <div className="form-group">
              <label>Items Needed for Repair/Replacement</label>
              <textarea
                name="itemsNeeded"
                value={formData.itemsNeeded}
                onChange={handleInputChange}
                placeholder="List items that need to be purchased or replaced..."
                className="form-input textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any other observations or important notes..."
                className="form-input textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-lg">
              <i className="fas fa-check"></i> Submit Inspection Report
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inspections History */}
      <div className="inspections-section">
        <h2>Inspection History</h2>
        {loading ? (
          <div className="loading">Loading inspection records...</div>
        ) : inspections.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>No inspections yet</h3>
            <p>Create your first inspection report to get started</p>
          </div>
        ) : (
          <div className="inspections-grid">
            {inspections.map((inspection) => (
              <div key={inspection._id} className="inspection-card">
                <div className="inspection-header">
                  <div>
                    <h3>{inspection.roomId?.name || 'Unknown Room'}</h3>
                    <p className="inspection-date">
                      {new Date(inspection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="btn-view"
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>

                <div className="inspection-stats">
                  <div className="stat">
                    <label>Condition</label>
                    <span
                      className="condition-badge"
                      style={{
                        backgroundColor: getConditionColor(inspection.condition),
                      }}
                    >
                      {inspection.condition}
                    </span>
                  </div>
                  <div className="stat">
                    <label>Rating</label>
                    <span className="rating">{inspection.rating}/10</span>
                  </div>
                  <div className="stat">
                    <label>Damages</label>
                    <span
                      className={`damage-badge ${
                        inspection.damageFound === 'Yes' ? 'has-damage' : 'no-damage'
                      }`}
                    >
                      {inspection.damageFound}
                    </span>
                  </div>
                </div>

                {inspection.damageFound === 'Yes' && (
                  <div className="damage-summary">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{inspection.damageDescription?.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Details Modal */}
      {selectedInspection && (
        <div className="modal-overlay" onClick={() => setSelectedInspection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedInspection(null)}
            >
              ✕
            </button>
            <h2>{selectedInspection.roomId?.name}</h2>
            <div className="modal-details">
              <div className="detail-section">
                <h4>Room Condition</h4>
                <p>
                  <strong>Overall:</strong>{' '}
                  <span
                    style={{
                      color: getConditionColor(selectedInspection.condition),
                      fontWeight: '600',
                    }}
                  >
                    {selectedInspection.condition}
                  </span>
                </p>
                <p>
                  <strong>Rating:</strong> {selectedInspection.rating}/10
                </p>
                <p>
                  <strong>Cleaning Needed:</strong>{' '}
                  {selectedInspection.cleaningNeeded}
                </p>
              </div>

              {selectedInspection.damageFound === 'Yes' && (
                <div className="detail-section damage-section">
                  <h4>
                    <i className="fas fa-exclamation-triangle"></i> Damages Found
                  </h4>
                  <p>{selectedInspection.damageDescription}</p>
                </div>
              )}

              {selectedInspection.itemsNeeded && (
                <div className="detail-section">
                  <h4>Items Needed</h4>
                  <p>{selectedInspection.itemsNeeded}</p>
                </div>
              )}

              {selectedInspection.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p>{selectedInspection.notes}</p>
                </div>
              )}

              <p className="submission-date">
                <strong>Submitted:</strong>{' '}
                {new Date(selectedInspection.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;
