// src/components/admin/PoolMonitoring.jsx
import React, { useState, useEffect } from "react";
import { getLatestReading, getHistory } from "../../services/api";
import "./PoolMonitoring.css";

const OASIS_OPTIONS = [
  {
    id: "oasis1",
    name: "Oasis 1",
    label: "Oasis 1 — Pool & Cottages",
    description: "Swimming pool with bubble jacuzzi & fountain",
    image: "/images/hero/oasis1-package-1.jpg",
    accent: "#0284c7",
    accentLight: "#e0f2fe",
  },
  {
    id: "oasis2",
    name: "Oasis 2",
    label: "Oasis 2 — Pool & Open Spaces",
    description: "Pool, open spaces & air-conditioned rooms",
    image: "/images/hero/Oasis2-Package-A.jpg",
    accent: "#0369a1",
    accentLight: "#dbeafe",
  },
];

const PoolMonitoring = () => {
  const [selectedOasis, setSelectedOasis] = useState(null); // null = not yet chosen
  const [latestReading, setLatestReading] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("today");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedChart, setSelectedChart] = useState("ph");

  useEffect(() => {
    if (!selectedOasis) return;
    fetchPoolReadings();
    const interval = setInterval(fetchPoolReadings, 30000);
    return () => clearInterval(interval);
  }, [selectedOasis]);

  const fetchPoolReadings = async () => {
    setPoolLoading(true);
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

    return historyData
      .filter((r) => {
        const d = new Date(r.timestamp);
        d.setHours(0, 0, 0, 0);
        if (historyFilter === "today") return d.getTime() === today.getTime();
        if (historyFilter === "yesterday") return d.getTime() === yesterday.getTime();
        if (historyFilter === "week") return d >= weekAgo;
        return true;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const filteredHistory = getFilteredHistory();

  const getChartData = () =>
    filteredHistory.map((r, i) => ({
      index: i + 1,
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ph: r.ph || 0,
      temperature: r.temperature || 0,
      turbidity: r.turbidity === "Clear" ? 1 : r.turbidity === "Cloudy" ? 2 : 3,
      turbidityLabel: r.turbidity || "No Data",
    }));

  const chartData = getChartData();

  const getStatusInfo = (reading) => {
    if (!reading) return { color: "#94a3b8", bg: "#f1f5f9", text: "No Data", icon: "○" };
    if (reading.ph < 6.5 || reading.ph > 8.5 || reading.turbidity === "Dirty")
      return { color: "#ef4444", bg: "#fef2f2", text: "Action Needed", icon: "⚠" };
    if (reading.turbidity === "Cloudy")
      return { color: "#f59e0b", bg: "#fffbeb", text: "Monitor Closely", icon: "◐" };
    return { color: "#10b981", bg: "#f0fdf4", text: "All Good", icon: "✓" };
  };

  const statusInfo = getStatusInfo(latestReading);
  const activeOasis = OASIS_OPTIONS.find((o) => o.id === selectedOasis);

  const getChartColor = () => {
    if (selectedChart === "ph") return "#0284c7";
    if (selectedChart === "temperature") return "#f59e0b";
    return "#10b981";
  };

  const getYAxisMax = () => {
    if (selectedChart === "ph") return 9;
    if (selectedChart === "temperature") return 40;
    return 4;
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
    if (selectedChart === "ph") return item.ph < 6.5 || item.ph > 8.5 ? "#ef4444" : "#0284c7";
    if (selectedChart === "temperature") return item.temperature > 35 ? "#ef4444" : "#f59e0b";
    return item.turbidity === 3 ? "#ef4444" : item.turbidity === 2 ? "#f59e0b" : "#10b981";
  };

  const getLinePath = () => {
    if (chartData.length === 0) return "";
    return chartData
      .map((item, idx) => {
        const x = (idx / Math.max(chartData.length - 1, 1)) * 100;
        const y = 100 - (getValue(item) / getYAxisMax()) * 100;
        return `${idx === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  };

  // ── OASIS SELECTOR SCREEN ──
  if (!selectedOasis) {
    return (
      <div className="pm-wrapper">
        <div className="pm-selector-header">
          <div className="pm-selector-title-row">
            <div className="pm-live-badge">
              <span className="pm-live-dot"></span>
              Pool Monitoring
            </div>
          </div>
          <h2 className="pm-selector-heading">Select an Oasis to Monitor</h2>
          <p className="pm-selector-sub">
            Choose which pool you'd like to view live sensor readings for.
          </p>
        </div>

        <div className="pm-oasis-cards">
          {OASIS_OPTIONS.map((oasis) => (
            <button
              key={oasis.id}
              className="pm-oasis-card"
              onClick={() => setSelectedOasis(oasis.id)}
            >
              <div className="pm-oasis-card-img-wrap">
                <img
                  src={oasis.image}
                  alt={oasis.name}
                  className="pm-oasis-card-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="pm-oasis-card-img-fallback">
                  <span>🏊</span>
                </div>
                <div className="pm-oasis-card-overlay">
                  <span className="pm-oasis-card-badge">{oasis.name}</span>
                </div>
              </div>
              <div className="pm-oasis-card-body">
                <h3 className="pm-oasis-card-name">{oasis.label}</h3>
                <p className="pm-oasis-card-desc">{oasis.description}</p>
                <div className="pm-oasis-card-cta">
                  <span>View Live Data</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── MONITORING SCREEN ──
  return (
    <div className="pm-wrapper">

      {/* Header with oasis switcher */}
      <div className="pm-header">
        <div className="pm-header-left">
          <div className="pm-oasis-tag">
            <img
              src={activeOasis.image}
              alt={activeOasis.name}
              className="pm-oasis-tag-img"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span>{activeOasis.label}</span>
          </div>
          <h2 className="pm-title">Pool Water Monitoring</h2>
        </div>
        <div className="pm-header-right">
          <div className="pm-live-badge">
            <span className="pm-live-dot"></span>
            Live
          </div>
          <button
            className="pm-switch-btn"
            onClick={() => {
              setSelectedOasis(null);
              setLatestReading(null);
              setHistoryData([]);
              setShowHistory(false);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Switch Oasis
          </button>
        </div>
      </div>

      {/* Pool image hero strip */}
      <div className="pm-pool-hero">
        <img
          src={activeOasis.image}
          alt={activeOasis.name}
          className="pm-pool-hero-img"
          onError={(e) => (e.target.style.display = "none")}
        />
        <div className="pm-pool-hero-overlay">
          <div className="pm-overall-status" style={{ borderColor: statusInfo.color }}>
            <span className="pm-status-icon" style={{ color: statusInfo.color }}>
              {statusInfo.icon}
            </span>
            <div>
              <span className="pm-status-label">Pool Status</span>
              <span className="pm-status-text" style={{ color: statusInfo.color }}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live reading cards */}
      {poolLoading ? (
        <div className="pm-loading">
          <div className="pm-loading-spinner"></div>
          <span>Fetching latest readings…</span>
        </div>
      ) : (
        <div className="pm-readings-grid">

          {/* pH */}
          <div className="pm-reading-card">
            <div className="pm-reading-icon" style={{ background: "#e0f2fe" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              </svg>
            </div>
            <div className="pm-reading-info">
              <span className="pm-reading-label">pH Level</span>
              <span
                className="pm-reading-value"
                style={{
                  color: latestReading?.ph < 6.5 || latestReading?.ph > 8.5
                    ? "#ef4444" : "#0284c7",
                }}
              >
                {latestReading?.ph?.toFixed(2) || "--"}
              </span>
              <span className="pm-reading-range">Normal: 6.5 – 8.5</span>
            </div>
            <div
              className="pm-reading-status-dot"
              style={{
                background: latestReading?.ph < 6.5 || latestReading?.ph > 8.5
                  ? "#ef4444" : "#10b981",
              }}
            />
          </div>

          {/* Temperature */}
          <div className="pm-reading-card">
            <div className="pm-reading-icon" style={{ background: "#fffbeb" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
              </svg>
            </div>
            <div className="pm-reading-info">
              <span className="pm-reading-label">Temperature</span>
              <span className="pm-reading-value" style={{ color: "#f59e0b" }}>
                {latestReading?.temperature
                  ? `${latestReading.temperature.toFixed(1)}°C`
                  : "--"}
              </span>
              <span className="pm-reading-range">Normal: 20°C – 35°C</span>
            </div>
            <div
              className="pm-reading-status-dot"
              style={{
                background:
                  latestReading?.temperature > 35 || latestReading?.temperature < 20
                    ? "#ef4444" : "#10b981",
              }}
            />
          </div>

          {/* Turbidity */}
          <div className="pm-reading-card">
            <div className="pm-reading-icon" style={{ background: "#f0fdf4" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="pm-reading-info">
              <span className="pm-reading-label">Turbidity</span>
              <span
                className="pm-reading-value"
                style={{
                  color:
                    latestReading?.turbidity === "Dirty"
                      ? "#ef4444"
                      : latestReading?.turbidity === "Cloudy"
                      ? "#f59e0b"
                      : "#10b981",
                }}
              >
                {latestReading?.turbidity || "--"}
              </span>
              <span className="pm-reading-range">Ideal: Clear</span>
            </div>
            <div
              className="pm-reading-status-dot"
              style={{
                background:
                  latestReading?.turbidity === "Dirty"
                    ? "#ef4444"
                    : latestReading?.turbidity === "Cloudy"
                    ? "#f59e0b"
                    : "#10b981",
              }}
            />
          </div>

          {/* Last update */}
          <div className="pm-reading-card">
            <div className="pm-reading-icon" style={{ background: "#f8fafc" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="pm-reading-info">
              <span className="pm-reading-label">Last Update</span>
              <span className="pm-reading-value pm-reading-value--sm">
                {latestReading?.formattedTime?.split(",")[1]?.trim() || "--"}
              </span>
              <span className="pm-reading-range">Auto-refresh: 30s</span>
            </div>
            <div className="pm-reading-status-dot" style={{ background: "#0284c7" }} />
          </div>
        </div>
      )}

      {/* History toggle */}
      <button
        className={`pm-history-toggle ${showHistory ? "active" : ""}`}
        onClick={() => setShowHistory(!showHistory)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        {showHistory ? "Hide Chart History" : "Show Chart History"}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: "auto", transform: showHistory ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* History / Chart */}
      {showHistory && (
        <div className="pm-history">
          <div className="pm-history-controls">
            <div className="pm-filter-group">
              {["today", "yesterday", "week"].map((f) => (
                <button
                  key={f}
                  className={`pm-filter-btn ${historyFilter === f ? "active" : ""}`}
                  onClick={() => setHistoryFilter(f)}
                >
                  {f === "today" ? "Today" : f === "yesterday" ? "Yesterday" : "Last 7 Days"}
                </button>
              ))}
            </div>
            <div className="pm-chart-type-group">
              {[
                { key: "ph", label: "pH", color: "#0284c7" },
                { key: "temperature", label: "Temp", color: "#f59e0b" },
                { key: "turbidity", label: "Turbidity", color: "#10b981" },
              ].map((c) => (
                <button
                  key={c.key}
                  className={`pm-chart-type-btn ${selectedChart === c.key ? "active" : ""}`}
                  style={selectedChart === c.key ? { borderColor: c.color, color: c.color, background: `${c.color}12` } : {}}
                  onClick={() => setSelectedChart(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="pm-no-data">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <p>No readings found for this period</p>
            </div>
          ) : (
            <div className="pm-chart-wrap">
              <div className="pm-y-axis">
                {getYAxisSteps().map((step, i) => (
                  <div key={i} className="pm-y-label" style={{ bottom: `${(step / getYAxisMax()) * 100}%` }}>
                    {step}
                  </div>
                ))}
              </div>
              <div className="pm-chart-area">
                <div className="pm-grid-lines">
                  {getYAxisSteps().map((step, i) => (
                    <div key={i} className="pm-grid-line" style={{ bottom: `${(step / getYAxisMax()) * 100}%` }} />
                  ))}
                </div>
                <svg className="pm-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getChartColor()} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={getChartColor()} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d={`${getLinePath()} L 100,100 L 0,100 Z`}
                    fill="url(#lineGrad)"
                  />
                  {/* Line */}
                  <path
                    d={getLinePath()}
                    fill="none"
                    stroke={getChartColor()}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="pm-data-points">
                  {chartData.map((item, idx) => {
                    const left = (idx / Math.max(chartData.length - 1, 1)) * 100;
                    const bottom = (getValue(item) / getYAxisMax()) * 100;
                    return (
                      <div key={idx} className="pm-data-point" style={{ left: `${left}%`, bottom: `${bottom}%` }}>
                        <div className="pm-dot" style={{ background: getDotColor(item) }} />
                        <div className="pm-tooltip">
                          <strong>{getValueLabel(item)}</strong>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pm-x-axis">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="pm-x-label" style={{ left: `${(idx / Math.max(chartData.length - 1, 1)) * 100}%` }}>
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