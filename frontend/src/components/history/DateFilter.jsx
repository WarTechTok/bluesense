// src/components/history/DateFilter.jsx
import React from "react";

function DateFilter({ selected, onChange }) {
  const filters = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "week", label: "Last 7 Days" }
  ];

  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          style={{
            padding: "4px 12px",
            backgroundColor: selected === filter.id ? "#3B82F6" : "#F3F4F6",
            color: selected === filter.id ? "white" : "#4B5563",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: selected === filter.id ? "600" : "400",
            fontSize: "0.8em"
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default DateFilter;