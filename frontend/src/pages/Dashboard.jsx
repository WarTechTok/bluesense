// frontend/src/pages/Dashboard.jsx
// ============================================
// DASHBOARD - main monitoring page with auth links
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import LatestCard from "../components/LatestCard";
import HistoryView from "../components/history/HistoryView";

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// ESP32 Control Component (inline for now)
const ESP32Control = () => {
  const [currentOasis, setCurrentOasis] = useState('oasis1');
  const [switching, setSwitching] = useState(false);

  // Fetch current oasis on load
  useEffect(() => {
    const fetchCurrentOasis = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/readings/current-oasis`);
        const data = await response.json();
        if (data.oasis) {
          setCurrentOasis(data.oasis);
        }
      } catch (error) {
        console.error('Error fetching current oasis:', error);
      }
    };
    fetchCurrentOasis();
  }, []);

  const handleSwitchOasis = async (oasis) => {
    setSwitching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/readings/set-oasis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oasis })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentOasis(oasis);
        alert(`✅ ESP32 is now monitoring ${oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}`);
      } else {
        alert('Failed to switch oasis');
      }
    } catch (error) {
      console.error('Error switching oasis:', error);
      alert('Failed to switch oasis. Make sure backend is running.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <i className="fas fa-microchip"></i> ESP32 Monitor Control
      </h3>
      <p style={{
        fontSize: '0.75rem',
        color: '#64748b',
        margin: '0 0 12px'
      }}>
        Select which pool the ESP32 should monitor:
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <button 
          style={{
            flex: 1,
            padding: '8px 16px',
            background: currentOasis === 'oasis1' ? '#0284c7' : 'transparent',
            border: currentOasis === 'oasis1' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '40px',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: currentOasis === 'oasis1' ? 'white' : '#475569',
            cursor: switching ? 'not-allowed' : 'pointer',
            opacity: switching ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={() => handleSwitchOasis('oasis1')}
          disabled={switching}
        >
          <i className="fas fa-water"></i> Monitor Oasis 1
        </button>
        <button 
          style={{
            flex: 1,
            padding: '8px 16px',
            background: currentOasis === 'oasis2' ? '#0284c7' : 'transparent',
            border: currentOasis === 'oasis2' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '40px',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: currentOasis === 'oasis2' ? 'white' : '#475569',
            cursor: switching ? 'not-allowed' : 'pointer',
            opacity: switching ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={() => handleSwitchOasis('oasis2')}
          disabled={switching}
        >
          <i className="fas fa-water"></i> Monitor Oasis 2
        </button>
      </div>
      <p style={{
        fontSize: '0.75rem',
        color: '#1e293b',
        background: '#f8fafc',
        padding: '8px',
        borderRadius: '8px',
        textAlign: 'center',
        margin: 0
      }}>
        <strong>Currently monitoring:</strong> {currentOasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}
      </p>
    </div>
  );
};

function Dashboard() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOasis, setSelectedOasis] = useState('oasis1'); // For filtering display

  // ✅ Fetch function - runs every 5 seconds for instant updates
  const fetchLatestData = useCallback(async () => {
    try {
      // Fetch data for selected oasis
      const response = await fetch(`${API_BASE_URL}/api/readings/latest?oasis=${selectedOasis}`);
      const data = await response.json();
      setLiveData(data);
      setLoading(false);
      console.log(`📡 Fetched ${selectedOasis} data - pH:`, data.ph);
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  }, [selectedOasis]);

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
          {/* LIVE indicator */}
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
          
          {/* Oasis Selector for Display */}
          <div style={{
            display: "flex",
            gap: "8px",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "40px"
          }}>
            <button
              onClick={() => setSelectedOasis('oasis1')}
              style={{
                padding: "6px 16px",
                background: selectedOasis === 'oasis1' ? '#0284c7' : 'transparent',
                color: selectedOasis === 'oasis1' ? 'white' : '#475569',
                border: 'none',
                borderRadius: "40px",
                cursor: 'pointer',
                fontSize: "0.75rem",
                fontWeight: "500"
              }}
            >
              Oasis 1
            </button>
            <button
              onClick={() => setSelectedOasis('oasis2')}
              style={{
                padding: "6px 16px",
                background: selectedOasis === 'oasis2' ? '#0284c7' : 'transparent',
                color: selectedOasis === 'oasis2' ? 'white' : '#475569',
                border: 'none',
                borderRadius: "40px",
                cursor: 'pointer',
                fontSize: "0.75rem",
                fontWeight: "500"
              }}
            >
              Oasis 2
            </button>
          </div>
          
          {/* History button */}
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

          {/* Login Button */}
          <Link to="/login">
            <button style={{
              padding: "8px 16px",
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
              Login
            </button>
          </Link>

          {/* Register Button */}
          <Link to="/register">
            <button style={{
              padding: "8px 16px",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
              Register
            </button>
          </Link>
        </div>
      </div>

      {/* ESP32 Control Panel - Only visible to admin? You can add role check here */}
      <ESP32Control />

      <LatestCard
        selectedReading={selectedReading}
        liveData={liveData}
        loading={loading}
      />
      
      {showHistory && (
        <HistoryView 
          onClose={() => setShowHistory(false)}
          onReadingClick={setSelectedReading}
          oasis={selectedOasis}
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