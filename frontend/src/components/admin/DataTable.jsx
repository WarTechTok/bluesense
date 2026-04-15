// ============================================
// DATA TABLE COMPONENT
// ============================================
// Reusable dynamic table for displaying structured data
// Supports: custom columns, action buttons, pagination-ready
// Features: Edit, Delete, Confirm, Cancel buttons with conditional rendering
// Used in: Room, Reservation, Inventory, Staff, Sales management pages

import React from 'react';
import './DataTable.css';

// ============================================
// ACTION BUTTONS ROW
// ============================================
const ActionButtons = ({ row, onEdit, onDelete, onConfirm, onCancel, actions }) => {
  // Disable editing if booking is Confirmed, Cancelled, or Completed
  const isLocked = row.status === 'Confirmed' || row.status === 'Cancelled' || row.status === 'Completed';

  return (
    <div className="action-buttons-row">
      {onEdit && !isLocked && (
        <button 
          className="btn-action-icon btn-edit" 
          onClick={() => onEdit(row)}
          title="Edit"
        >
          ✏️
        </button>
      )}

      {onDelete && !isLocked && (
        <button 
          className="btn-action-icon btn-delete" 
          onClick={() => onDelete(row._id)}
          title="Delete"
        >
          🗑️
        </button>
      )}

      {onCancel && row.status !== 'Cancelled' && !isLocked && (
        <button 
          className="btn-action-icon btn-cancel" 
          onClick={() => onCancel(row._id)}
          title="Cancel"
        >
          ✕
        </button>
      )}

      {onConfirm && row.status === 'Pending' && (
        <button 
          className="btn-action-text btn-confirm" 
          onClick={() => onConfirm(row._id)}
        >
          ✓ Confirm
        </button>
      )}

      {actions.map((action, idx) => (
        (!action.condition || action.condition(row)) && (
          <button
            key={idx}
            className="btn-action-text btn-custom"
            onClick={() => action.handler(row)}
          >
            {action.emoji || '⚙️'} {action.label}
          </button>
        )
      ))}
    </div>
  );
};;

// ============================================
// DATA TABLE - COMPONENT RENDER
// ============================================
// Props:
//   - columns: Array of {key, label, render?} objects for table columns
//   - data: Array of row objects to display
//   - onEdit: Callback function when Edit button clicked
//   - onDelete: Callback function when Delete button clicked
//   - onConfirm: Callback function when Confirm button clicked (for Pending status)
//   - onCancel: Callback function when Cancel button clicked
//   - actions: Array of custom action button objects
const DataTable = ({ columns, data, onEdit, onDelete, onConfirm, onCancel, actions = [] }) => {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete || onConfirm || onCancel || actions.length > 0) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="no-data">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onConfirm || onCancel || actions.length > 0) && (
                  <td className="action-cell">
                    <ActionButtons 
                      row={row} 
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                      actions={actions}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
