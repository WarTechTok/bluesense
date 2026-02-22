// src/components/LatestCard.jsx
import React, { useState, useEffect } from "react";
import SensorCard from "./SensorCard";

function LatestCard({ selectedReading, liveData, loading }) {
  const [displayData, setDisplayData] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  // Smooth update when new data arrives
  useEffect(() => {
    const newData = selectedReading || liveData;
    if (newData && JSON.stringify(newData) !== JSON.stringify(displayData)) {
      // Show change animation
      setIsChanging(true);
      // Update to new data
      setDisplayData(newData);
      // Turn off animation after 500ms
      setTimeout(() => setIsChanging(false), 500);
    }
  }, [liveData, selectedReading, displayData]);

  if (loading && !displayData) return <p>Loading pool data...</p>;
  if (!displayData) return <p>No data available</p>;

  // ✅ pH MEANING - 3 CATEGORIES
  const getPHMeaning = (ph) => {
    if (!ph && ph !== 0) return { status: "⚠️ NO DATA", color: "gray", message: "No pH data" };
    if (ph < 7.0) {
      return { 
        status: "🔴 TOO LOW - Add pH Up", 
        color: "red", 
        message: "pH is too low. Add pH increaser (Soda Ash)." 
      };
    }
    if (ph <= 7.8) {
      return { 
        status: "🟢 GOOD", 
        color: "green", 
        message: "pH is perfect! Safe for swimming." 
      };
    }
    return { 
      status: "🔴 TOO HIGH - Add pH Down", 
      color: "red", 
      message: "pH is too high. Add pH decreaser (Sodium Bisulfate)." 
    };
  };

  // ✅ FIXED TEMP MEANING - USING COLOR NAMES!
  const getTempMeaning = (temp) => {
    if (!temp && temp !== 0) return { status: "⚠️ NO DATA", color: "gray", message: "No temp data" };
    
    if (temp < 20) {
      return { 
        status: "❄️ TOO COLD", 
        color: "blue",
        message: "Water is freezing! Not safe for swimming." 
      };
    }
    if (temp < 26) {
      return { 
        status: "🔵 COLD", 
        color: "blue",
        message: "Water is cold. Not comfortable for swimming." 
      };
    }
    if (temp <= 32) {
      return { 
        status: "🟢 COMFORTABLE", 
        color: "green",
        message: "Ideal swimming temperature!" 
      };
    }
    if (temp <= 35) {
      return { 
        status: "🟠 WARM", 
        color: "orange",
        message: "Water is warm. Still okay for swimming." 
      };
    }
    return { 
      status: "🔥 TOO HOT", 
      color: "red",
      message: "Water is too hot! Not safe for swimming." 
    };
  };

  // ✅ TURBIDITY MEANING
  const getTurbidityMeaning = (turb) => {
    if (!turb) return { status: "⚠️ NO DATA", color: "gray", message: "No turbidity data" };
    if (turb === "Clear" || turb === "Clear Water") {
      return { 
        status: "✅ CLEAR", 
        color: "green", 
        message: "Water is crystal clear!" 
      };
    }
    if (turb === "Cloudy" || turb === "Cloudy Water") {
      return { 
        status: "🟡 CLOUDY", 
        color: "orange", 
        message: "Water is hazy. Check filter." 
      };
    }
    if (turb === "Dirty" || turb === "Very Cloudy") {
      return { 
        status: "🔴 DIRTY", 
        color: "red", 
        message: "Water is dirty! Clean immediately." 
      };
    }
    return { 
      status: "⚠️ CHECK", 
      color: "gray", 
      message: "Check sensor." 
    };
  };

  const ph = getPHMeaning(displayData.ph);
  const temp = getTempMeaning(displayData.temperature);
  const turb = getTurbidityMeaning(displayData.turbidity);

  // Debug log
  console.log("🔄 Cards Updating - Temp:", displayData.temperature, "Status:", temp.status);

  const displayTimestamp = selectedReading
    ? `📌 Historical: ${selectedReading.displayTime || new Date(selectedReading.timestamp).toLocaleString("en-PH", {
        dateStyle: "full",
        timeStyle: "short"
      })}`
    : `🕒 Last update: ${new Date(displayData.timestamp).toLocaleString("en-PH", {
        dateStyle: "full",
        timeStyle: "short"
      })}`;

  return (
    <div>
      {selectedReading && (
        <div style={{
          backgroundColor: "#EFF6FF",
          padding: "8px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          color: "#1E40AF",
          fontWeight: "500",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: isChanging ? "pulse 0.5s ease" : "none"
        }}>
          <span>📌 Viewing historical reading</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #3B82F6",
              color: "#3B82F6",
              padding: "4px 12px",
              borderRadius: "16px",
              cursor: "pointer"
            }}
          >
            Back to Latest
          </button>
        </div>
      )}

      <div style={{
        display: "flex",
        gap: "25px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "20px",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          transition: "all 0.3s ease",
          transform: isChanging ? "scale(1.02)" : "scale(1)"
        }}>
          <SensorCard
            title="🧪 Water Chemistry"
            value={`pH ${displayData.ph}`}
            status={ph.status}
            message={ph.message}
            color={ph.color}
          />
        </div>
        
        <div style={{
          transition: "all 0.3s ease",
          transform: isChanging ? "scale(1.02)" : "scale(1)"
        }}>
          <SensorCard
            title="🌡️ Water Temperature"
            value={`${displayData.temperature}°C`}
            status={temp.status}
            message={temp.message}
            color={temp.color}
          />
        </div>
        
        <div style={{
          transition: "all 0.3s ease",
          transform: isChanging ? "scale(1.02)" : "scale(1)"
        }}>
          <SensorCard
            title="💧 Turbidity"
            value={displayData.turbidity}
            status={turb.status}
            message={turb.message}
            color={turb.color}
          />
        </div>
      </div>

      <p style={{
        textAlign: "center",
        marginTop: "30px",
        color: "#888",
        fontSize: "0.9em",
        fontStyle: "italic",
        animation: isChanging ? "pulse 0.5s ease" : "none"
      }}>
        {displayTimestamp}
      </p>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default LatestCard;