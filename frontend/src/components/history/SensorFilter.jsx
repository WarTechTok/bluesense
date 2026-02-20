// src/components/history/SensorFilter.jsx
import React from "react";

function SensorFilter({ selected, onChange }) {
  const sensors = [
    { id: "ph", label: "pH", color: "#3B82F6" },
    { id: "temperature", label: "Temp", color: "#EF4444" },
    { id: "turbidity", label: "Turbidity", color: "#10B981" }
  ];

  return (
    <div style={{ 
      display: "flex", 
      gap: "8px", 
      borderBottom: "1px solid #E5E7EB", 
      paddingBottom: "16px" 
    }}>
      {sensors.map((sensor) => (
        <button
          key={sensor.id}
          onClick={() => onChange(sensor.id)}
          style={{
            padding: "6px 16px",
            backgroundColor: selected === sensor.id ? sensor.color : "white",
            color: selected === sensor.id ? "white" : "#4B5563",
            border: "1px solid",
            borderColor: selected === sensor.id ? "transparent" : "#D1D5DB",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "0.9em"
          }}
        >
          {sensor.label}
        </button>
      ))}
    </div>
  );
}

export default SensorFilter;