// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import LatestCard from "../components/LatestCard";
import HistoryView from "../components/history/HistoryView";

function Dashboard() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch function - runs every 5 seconds for instant updates
  const fetchLatestData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/readings/latest');
      const data = await response.json();
      setLiveData(data);
      setLoading(false);
      console.log("📡 Fetched new data - pH:", data.ph);
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  }, []);

  // Initial fetch + 5-second rapid polling
  useEffect(() => {
    fetchLatestData(); // Fetch immediately
    
    const interval = setInterval(fetchLatestData, 5000); // Every 5 seconds!
    return () => clearInterval(interval);
  }, [fetchLatestData]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1>Pool Monitoring Dashboard</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            gap: "6px"
          }}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              animation: "pulse 1s infinite"
            }}></div>
            <span style={{ color: "#10B981", fontWeight: "500" }}>LIVE</span>
          </div>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: "8px 16px",
              backgroundColor: showHistory ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showHistory ? "✕ Close History" : "📊 View History"}
          </button>
        </div>
      </div>

      <LatestCard 
        selectedReading={selectedReading}
        liveData={liveData}
        loading={loading}
      />
      
      {showHistory && (
        <HistoryView 
          onClose={() => setShowHistory(false)}
          onReadingClick={setSelectedReading}
        />
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;