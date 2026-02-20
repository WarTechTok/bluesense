// src/components/SensorCard.jsx
import React from "react";

function SensorCard({ title, value, status, message, color }) {
  // Set colors based on status
  const getColors = () => {
    switch(color) {
      case "green":
        return {
          bg: "#e8f5e9",
          border: "#4caf50",
          badge: "#4caf50",
          text: "#1e7e34"
        };
      case "red":
        return {
          bg: "#ffebee",
          border: "#f44336",
          badge: "#f44336",
          text: "#b71c1c"
        };
      case "orange":
        return {
          bg: "#fff3e0",
          border: "#ff9800",
          badge: "#ff9800",
          text: "#b45f06"
        };
      case "blue":
        return {
          bg: "#e3f2fd",
          border: "#2196f3",
          badge: "#2196f3",
          text: "#0d47a1"
        };
      default:
        return {
          bg: "#f5f5f5",
          border: "#9e9e9e",
          badge: "#9e9e9e",
          text: "#616161"
        };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      backgroundColor: colors.bg,
      borderLeft: `8px solid ${colors.border}`,
      padding: "20px",
      borderRadius: "8px",
      minWidth: "250px",
      maxWidth: "300px",
      flex: "1 1 250px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      fontFamily: "Arial, sans-serif",
      ':hover': {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 12px rgba(0,0,0,0.15)"
      }
    }}>
      <h3 style={{ 
        margin: "0 0 10px 0", 
        color: "#333", 
        fontSize: "1.3em",
        fontWeight: "600",
        borderBottom: `2px solid ${colors.border}`,
        paddingBottom: "8px"
      }}>
        {title}
      </h3>
      
      <div style={{ 
        fontSize: "2.2em", 
        fontWeight: "bold", 
        margin: "15px 0",
        color: colors.text
      }}>
        {value}
      </div>
      
      <div style={{
        backgroundColor: colors.badge,
        color: "white",
        padding: "8px 16px",
        borderRadius: "25px",
        display: "inline-block",
        fontWeight: "bold",
        fontSize: "0.9em",
        marginBottom: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        {status}
      </div>
      
      <p style={{ 
        margin: "10px 0 0 0", 
        color: "#555",
        fontSize: "0.95em",
        lineHeight: "1.4",
        fontStyle: "italic",
        borderTop: "1px solid #ddd",
        paddingTop: "12px"
      }}>
        {message}
      </p>
    </div>
  );
}

export default SensorCard;