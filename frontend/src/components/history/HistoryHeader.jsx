// src/components/history/HistoryHeader.jsx
import React from "react";

function HistoryHeader({ dateRangeText, count, onClose }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    }}>
      <div>
        <h3 style={{ margin: 0, color: "#111827", fontSize: "1.25em", fontWeight: "600" }}>
          📊 History
        </h3>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85em" }}>
          {dateRangeText} • {count} {count === 1 ? 'reading' : 'readings'}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#6B7280",
            cursor: "pointer",
            fontSize: "1.2em",
            padding: "4px 8px",
            borderRadius: "4px",
            ":hover": {
              backgroundColor: "#F3F4F6"
            }
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default HistoryHeader;