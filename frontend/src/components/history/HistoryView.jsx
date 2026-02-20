// src/components/history/HistoryView.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistoryData } from "./useHistoryData";
import DateFilter from "./DateFilter";
import SensorFilter from "./SensorFilter";
import HistoryHeader from "./HistoryHeader";
import PHChart from "./PHChart";
import TempChart from "./TempChart";
import TurbidityList from "./TurbidityList";

function HistoryView({ onClose, onReadingClick }) {
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedSensor, setSelectedSensor] = useState("ph");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // ✅ AUTO-REFRESH every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      console.log("🔄 Dashboard auto-refreshed at", new Date().toLocaleTimeString());
    }, 30000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Memoize the refreshKey to prevent unnecessary re-renders
  const memoizedRefreshKey = useMemo(() => refreshKey, [refreshKey]);
  
  // Pass refreshKey to trigger re-fetch
  const { data, loading, isEmpty, count, dateRangeText } = useHistoryData(dateFilter, memoizedRefreshKey);

  // ✅ Memoize data to prevent unnecessary re-renders of child components
  const memoizedData = useMemo(() => data, [data]);

  // Memoize callback functions
  const handleDateFilterChange = useCallback((filter) => {
    setDateFilter(filter);
  }, []);

  const handleSensorChange = useCallback((sensor) => {
    setSelectedSensor(sensor);
  }, []);

  // ✅ Improved loading message
  if (loading) {
    return (
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "16px", 
        padding: "40px", 
        marginTop: "24px",
        textAlign: "center",
        color: "#6B7280",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        border: "1px solid #E5E7EB"
      }}>
        <div style={{ fontSize: "2em", marginBottom: "10px" }}>🔄</div>
        <div>Fetching latest readings...</div>
        <div style={{ fontSize: "0.85em", marginTop: "10px", color: "#9CA3AF" }}>
          Checking for new sensor data...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "16px",
      padding: "24px",
      marginTop: "24px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      border: "1px solid #E5E7EB"
    }}>
      <HistoryHeader 
        dateRangeText={dateRangeText} 
        count={count} 
        onClose={onClose}
      />

      {/* ✅ Auto-refresh indicator */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: "10px",
        fontSize: "0.8em",
        color: "#6B7280"
      }}>
        <span style={{ marginRight: "8px" }}>🔄 Auto-refresh every 30s</span>
        <span style={{
          display: "inline-block",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "#10B981",
          animation: "pulse 2s infinite"
        }}></span>
      </div>

      <DateFilter selected={dateFilter} onChange={handleDateFilterChange} />
      
      <div style={{ marginTop: "20px" }}>
        <SensorFilter selected={selectedSensor} onChange={handleSensorChange} />
      </div>

      <div style={{ marginTop: "20px" }}>
        {isEmpty ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#6B7280",
            backgroundColor: "#F9FAFB",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "1.2em", fontWeight: "500", marginBottom: "8px" }}>
              No readings yet
            </div>
            <div style={{ fontSize: "0.9em", color: "#9CA3AF" }}>
              Waiting for ESP32 to send first reading...
            </div>
            <div style={{ fontSize: "0.8em", marginTop: "20px", color: "#D1D5DB" }}>
              New data arrives every 5 minutes
            </div>
          </div>
        ) : (
          <>
            {selectedSensor === "ph" && (
              <PHChart 
                data={memoizedData} 
                onReadingClick={onReadingClick}
              />
            )}
            {selectedSensor === "temperature" && (
              <TempChart 
                data={memoizedData} 
                onReadingClick={onReadingClick}
              />
            )}
            {selectedSensor === "turbidity" && (
              <TurbidityList 
                data={memoizedData} 
                onReadingClick={onReadingClick}
              />
            )}
          </>
        )}
      </div>
      
      {/* ✅ CSS for pulsing dot */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ✅ Memoize the entire component
export default React.memo(HistoryView);