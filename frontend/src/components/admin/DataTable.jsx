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
// Action Buttons:
//   - Blue Edit: Call onEdit(row) if provided
//   - Green Confirm: Shows if status='Pending' and onConfirm provided
//   - Yellow Cancel: Shows if status != 'Cancelled' and onCancel provided
//   - Red Delete: Call onDelete(row._id) if provided
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
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onConfirm || onCancel || actions.length > 0) && (
                  <td className="action-buttons">
                    {onEdit && (
                      <button className="btn-edit" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                    )}
                    {onConfirm && row.status === 'Pending' && (
                      <button className="btn-confirm" onClick={() => onConfirm(row._id)}>
                        Confirm
                      </button>
                    )}
                    {onCancel && row.status !== 'Cancelled' && (
                      <button className="btn-cancel" onClick={() => onCancel(row._id)}>
                        Cancel
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn-delete" onClick={() => onDelete(row._id)}>
                        Delete
                      </button>
                    )}
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={`btn-${action.type}`}
                        onClick={() => action.handler(row)}
                      >
                        {action.label}
                      </button>
                    ))}
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
