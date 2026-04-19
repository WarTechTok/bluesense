// src/components/history/HistoryView.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistoryData } from "./useHistoryData";
import DateFilter from "./DateFilter";
import SensorFilter from "./SensorFilter";
import HistoryHeader from "./HistoryHeader";
import PHChart from "./PHChart";
import TempChart from "./TempChart";
import TurbidityList from "./TurbidityList";

function HistoryView({ onClose, onReadingClick, oasis = "oasis1" }) {
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedSensor, setSelectedSensor] = useState("ph");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // ✅ AUTO-REFRESH every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      console.log(`🔄 Dashboard auto-refreshed at ${new Date().toLocaleTimeString()} for ${oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}`);
    }, 30000);
    
    return () => clearInterval(timer);
  }, [oasis]);
  
  // Memoize the refreshKey to prevent unnecessary re-renders
  const memoizedRefreshKey = useMemo(() => refreshKey, [refreshKey]);
  
  // Pass refreshKey and oasis to trigger re-fetch
  const { data, loading, isEmpty, count, dateRangeText } = useHistoryData(dateFilter, memoizedRefreshKey, oasis);

  // ✅ Memoize data to prevent unnecessary re-renders of child components
  const memoizedData = useMemo(() => data, [data]);

  // Memoize callback functions
  const handleDateFilterChange = useCallback((filter) => {
    setDateFilter(filter);
  }, []);

  const handleSensorChange = useCallback((sensor) => {
    setSelectedSensor(sensor);
  }, []);

  // ✅ Improved loading message with oasis info
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
        <div>Fetching latest readings for {oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}...</div>
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

      {/* Oasis indicator */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{
          background: oasis === 'oasis1' ? '#e0f2fe' : '#dbeafe',
          padding: "6px 14px",
          borderRadius: "20px",
          color: oasis === 'oasis1' ? '#0284c7' : '#0369a1',
          fontWeight: "500",
          fontSize: "0.8rem"
        }}>
          <i className="fas fa-water"></i> {oasis === 'oasis1' ? 'Oasis 1 - Pool & Cottages' : 'Oasis 2 - Pool & Open Spaces'}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#6B7280" }}>
          <i className="fas fa-sync-alt"></i>
          <span>Auto-refresh every 30s</span>
          <span style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10B981",
            animation: "pulse 2s infinite"
          }}></span>
        </div>
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
            <div style={{ fontSize: "2em", marginBottom: "10px" }}>📊</div>
            <div style={{ fontSize: "1.1em", fontWeight: "500", marginBottom: "8px" }}>
              No readings yet for {oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}
            </div>
            <div style={{ fontSize: "0.85em", color: "#9CA3AF" }}>
              Waiting for ESP32 to send first reading...
            </div>
            <div style={{ fontSize: "0.75em", marginTop: "16px", color: "#D1D5DB" }}>
              New data arrives every 10 minutes or when water quality changes
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
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ✅ Memoize the entire component
export default React.memo(HistoryView);