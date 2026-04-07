// src/components/admin/PoolMonitoring.jsx
import React, { useState, useEffect } from "react";
import { getLatestReading, getHistory } from "../../services/api";

const PoolMonitoring = () => {
  const [latestReading, setLatestReading] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState("today");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedChart, setSelectedChart] = useState("ph");

  useEffect(() => {
    fetchPoolReadings();
    const interval = setInterval(fetchPoolReadings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolReadings = async () => {
    try {
      const [latest, history] = await Promise.all([
        getLatestReading(),
        getHistory(),
      ]);
      setLatestReading(latest);
      setHistoryData(history);
    } catch (error) {
      console.error("Failed to fetch pool readings:", error);
    } finally {
      setPoolLoading(false);
    }
  };

  const getFilteredHistory = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let filtered = historyData.filter((reading) => {
      const readingDate = new Date(reading.timestamp);
      readingDate.setHours(0, 0, 0, 0);
      
      if (historyFilter === "today") return readingDate.getTime() === today.getTime();
      if (historyFilter === "yesterday") return readingDate.getTime() === yesterday.getTime();
      if (historyFilter === "week") return readingDate >= weekAgo;
      return true;
    });

    return filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const filteredHistory = getFilteredHistory();

  const getChartData = () => {
    return filteredHistory.map((reading, index) => ({
      index: index + 1,
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ph: reading.ph || 0,
      temperature: reading.temperature || 0,
      turbidity: reading.turbidity === "Clear" ? 1 : reading.turbidity === "Cloudy" ? 2 : 3,
      turbidityLabel: reading.turbidity || "No Data"
    }));
  };

  const chartData = getChartData();

  const getStatusColor = (reading) => {
    if (!reading) return "#6b7280";
    if (reading.ph < 6.5 || reading.ph > 8.5) return "#ef4444";
    if (reading.turbidity === "Dirty") return "#ef4444";
    if (reading.turbidity === "Cloudy") return "#f59e0b";
    return "#10b981";
  };

  const getStatusText = (reading) => {
    if (!reading) return "No Data";
    if (reading.ph < 6.5 || reading.ph > 8.5) return "Action Needed";
    if (reading.turbidity === "Dirty") return "Needs Cleaning";
    if (reading.turbidity === "Cloudy") return "Monitor";
    return "Normal";
  };

  const getChartColor = () => {
    if (selectedChart === "ph") return "#3b82f6";
    if (selectedChart === "temperature") return "#f59e0b";
    return "#10b981";
  };

  const getYAxisMax = () => {
    if (selectedChart === "ph") return 9;
    if (selectedChart === "temperature") return 40;
    return 4;
  };

  const getYAxisLabel = () => {
    if (selectedChart === "ph") return "pH Level";
    if (selectedChart === "temperature") return "Temperature (°C)";
    return "Turbidity";
  };

  const getYAxisSteps = () => {
    if (selectedChart === "ph") return [6, 6.5, 7, 7.5, 8, 8.5];
    if (selectedChart === "temperature") return [20, 25, 30, 35, 40];
    return [1, 2, 3];
  };

  const getValue = (item) => {
    if (selectedChart === "ph") return item.ph;
    if (selectedChart === "temperature") return item.temperature;
    return item.turbidity;
  };

  const getValueLabel = (item) => {
    if (selectedChart === "ph") return item.ph.toFixed(2);
    if (selectedChart === "temperature") return `${item.temperature.toFixed(1)}°C`;
    return item.turbidityLabel;
  };

  const getDotColor = (item) => {
    if (selectedChart === "ph") {
      return item.ph < 6.5 || item.ph > 8.5 ? "#ef4444" : "#3b82f6";
    }
    if (selectedChart === "temperature") {
      return item.temperature < 20 || item.temperature > 35 ? "#ef4444" : "#f59e0b";
    }
    return item.turbidity === 3 ? "#ef4444" : item.turbidity === 2 ? "#f59e0b" : "#10b981";
  };

  const getLinePath = () => {
    if (chartData.length === 0) return "";
    
    const points = chartData.map((item, idx) => {
      const x = (idx / Math.max(chartData.length - 1, 1)) * 100;
      const value = getValue(item);
      const yAxisMax = getYAxisMax();
      const y = 100 - (value / yAxisMax) * 100;
      return `${x},${y}`;
    });
    
    return points.map((point, idx) => (idx === 0 ? `M ${point}` : `L ${point}`)).join(" ");
  };

  if (poolLoading) {
    return <div className="pool-loading">Loading pool data...</div>;
  }

  return (
    <div className="pool-monitoring-section">
      <div className="section-header">
        <h2>Pool Water Monitoring</h2>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>Live</span>
        </div>
      </div>

      {/* Current Readings */}
      <div className="current-readings-grid">
        <div className="reading-card">
          <span className="reading-label">pH Level</span>
          <span className="reading-value" style={{ color: getStatusColor(latestReading) }}>
            {latestReading?.ph?.toFixed(2) || "--"}
          </span>
          <span className="reading-status">{getStatusText(latestReading)}</span>
        </div>

        <div className="reading-card">
          <span className="reading-label">Temperature</span>
          <span className="reading-value">
            {latestReading?.temperature ? `${latestReading.temperature.toFixed(1)}°C` : "--"}
          </span>
          <span className="reading-status">
            {latestReading?.temperature < 20 ? "Cold" : latestReading?.temperature > 35 ? "Hot" : "Normal"}
          </span>
        </div>

        <div className="reading-card">
          <span className="reading-label">Turbidity</span>
          <span className="reading-value" style={{ color: getStatusColor(latestReading) }}>
            {latestReading?.turbidity || "--"}
          </span>
          <span className="reading-status">{latestReading?.turbidity || "No Data"}</span>
        </div>

        <div className="reading-card">
          <span className="reading-label">Last Update</span>
          <span className="reading-value">{latestReading?.formattedTime || "--"}</span>
        </div>
      </div>

      {/* Toggle History Button */}
      <button className="toggle-history-btn" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "▼ Hide History" : "▶ Show History"}
      </button>

      {/* History Section */}
      {showHistory && (
        <div className="history-section">
          <div className="history-filters">
            <button className={`filter-btn ${historyFilter === "today" ? "active" : ""}`} onClick={() => setHistoryFilter("today")}>Today</button>
            <button className={`filter-btn ${historyFilter === "yesterday" ? "active" : ""}`} onClick={() => setHistoryFilter("yesterday")}>Yesterday</button>
            <button className={`filter-btn ${historyFilter === "week" ? "active" : ""}`} onClick={() => setHistoryFilter("week")}>Last 7 Days</button>
          </div>

          <div className="chart-selector">
            <button className={`chart-type-btn ${selectedChart === "ph" ? "active" : ""}`} onClick={() => setSelectedChart("ph")}>pH Level</button>
            <button className={`chart-type-btn ${selectedChart === "temperature" ? "active" : ""}`} onClick={() => setSelectedChart("temperature")}>Temperature</button>
            <button className={`chart-type-btn ${selectedChart === "turbidity" ? "active" : ""}`} onClick={() => setSelectedChart("turbidity")}>Turbidity</button>
          </div>

          {chartData.length === 0 ? (
            <div className="no-history">No readings found for this period</div>
          ) : (
            <div className="line-chart-container">
              {/* Y-Axis Labels */}
              <div className="y-axis">
                {getYAxisSteps().map((step, idx) => (
                  <div key={idx} className="y-axis-label" style={{ bottom: `${(step / getYAxisMax()) * 100}%` }}>
                    <span>{step}</span>
                    <span className="y-axis-unit">{getYAxisLabel() === "pH Level" ? "" : getYAxisLabel() === "Temperature (°C)" ? "°C" : ""}</span>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="line-chart">
                {/* Horizontal Grid Lines */}
                <div className="grid-lines">
                  {getYAxisSteps().map((step, idx) => (
                    <div key={idx} className="grid-line" style={{ bottom: `${(step / getYAxisMax()) * 100}%` }}></div>
                  ))}
                </div>

                {/* Line Path */}
                <svg className="line-path" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                  <path
                    d={getLinePath()}
                    fill="none"
                    stroke={getChartColor()}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Data Points */}
                <div className="data-points">
                  {chartData.map((item, idx) => {
                    const value = getValue(item);
                    const yAxisMax = getYAxisMax();
                    const left = (idx / Math.max(chartData.length - 1, 1)) * 100;
                    const bottom = (value / yAxisMax) * 100;
                    
                    return (
                      <div key={idx} className="data-point" style={{ left: `${left}%`, bottom: `${bottom}%` }}>
                        <div className="data-point-dot" style={{ backgroundColor: getDotColor(item) }}></div>
                        <div className="data-tooltip">
                          <div className="tooltip-value">{getValueLabel(item)}</div>
                          <div className="tooltip-time">{item.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="x-axis">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="x-axis-label" style={{ left: `${(idx / Math.max(chartData.length - 1, 1)) * 100}%` }}>
                      {item.time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PoolMonitoring;