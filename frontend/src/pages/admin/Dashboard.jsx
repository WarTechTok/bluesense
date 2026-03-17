import React, { useState, useEffect } from "react";
import StatCard from "../../components/admin/StatCard";
import { getLatestReading, getHistory } from "../../services/api";
import "./Dashboard.css";
import * as adminApi from "../../services/admin/adminApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pool monitoring states
  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, dailyChartData, monthlyChartData] = await Promise.all(
          [
            adminApi.getDashboardStats(),
            adminApi.getDailyChartData(),
            adminApi.getMonthlyChartData(),
          ],
        );

        setStats(statsData);
        setDailyData(dailyChartData || []);
        setMonthlyData(monthlyChartData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch pool readings
  useEffect(() => {
    fetchPoolReadings();
    const interval = setInterval(fetchPoolReadings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolReadings = async () => {
    try {
      const [latest, historyData] = await Promise.all([
        getLatestReading(),
        getHistory(),
      ]);
      setLatestReading(latest);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch pool readings:", error);
    } finally {
      setPoolLoading(false);
    }
  };

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

  if (loading && poolLoading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </div>

      {/* ===== POOL MONITORING SECTION ===== */}
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
            <span
              className="reading-value"
              style={{ color: getStatusColor(latestReading) }}
            >
              {latestReading?.ph?.toFixed(2) || "--"}
            </span>
            <span className="reading-status">
              {getStatusText(latestReading)}
            </span>
          </div>

          <div className="reading-card">
            <span className="reading-label">Temperature</span>
            <span className="reading-value">
              {latestReading?.temperature
                ? `${latestReading.temperature.toFixed(1)}°C`
                : "--"}
            </span>
            <span className="reading-status">
              {latestReading?.temperature < 20
                ? "Cold"
                : latestReading?.temperature > 35
                  ? "Hot"
                  : "Normal"}
            </span>
          </div>

          <div className="reading-card">
            <span className="reading-label">Turbidity</span>
            <span
              className="reading-value"
              style={{ color: getStatusColor(latestReading) }}
            >
              {latestReading?.turbidity || "--"}
            </span>
            <span className="reading-status">
              {latestReading?.turbidity || "No Data"}
            </span>
          </div>

          <div className="reading-card">
            <span className="reading-label">Last Update</span>
            <span className="reading-value">
              {latestReading?.formattedTime || "--"}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pool-actions">
          <button
            className="pool-action-btn"
            onClick={() => window.open("/dashboard", "_blank")}
          >
            View Full Monitoring
          </button>
          <button
            className="pool-action-btn"
            onClick={() => alert("Export feature coming soon")}
          >
            Export Data
          </button>
        </div>
      </div>

      {/* ===== ADMIN STATS SECTION ===== */}
      <h2 className="section-title">Overview</h2>
      <div className="stats-grid">
        <StatCard
          title="Total Reservations"
          value={stats?.totalReservations || 0}
        />
        <StatCard title="Available Rooms" value={stats?.availableRooms || 0} />
        <StatCard
          title="Maintenance Rooms"
          value={stats?.maintainanceRooms || 0}
        />
        <StatCard title="Active Staff" value={stats?.activeStaff || 0} />
        <StatCard
          title="Monthly Revenue"
          value={`₱${(stats?.monthlyRevenue || 0).toLocaleString()}`}
        />
        <StatCard title="Low Stock Items" value={stats?.lowStockItems || 0} />
      </div>

      {/* Charts */}
      <h2 className="section-title">Sales Analytics</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Sales (Last 7 Days)</h3>
          <div className="chart-placeholder">
            {dailyData.length > 0 ? (
              <div className="simple-chart">
                {dailyData.map((item, idx) => (
                  <div key={idx} className="chart-bar-item">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.min((item.total / 100) * 100, 200)}px`,
                      }}
                    ></div>
                    <span className="chart-label">{item._id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Monthly Sales (Last 12 Months)</h3>
          <div className="chart-placeholder">
            {monthlyData.length > 0 ? (
              <div className="simple-chart">
                {monthlyData.map((item, idx) => (
                  <div key={idx} className="chart-bar-item">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.min((item.total / 100) * 100, 200)}px`,
                      }}
                    ></div>
                    <span className="chart-label">{item._id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <h2 className="section-title">System Status</h2>
      <div className="quick-stats">
        <div className="quick-stat-item">
          <h4>Reservations</h4>
          <ul>
            <li>
              <span>Pending</span> <span>0</span>
            </li>
            <li>
              <span>Confirmed</span> <span>0</span>
            </li>
            <li>
              <span>Cancelled</span> <span>0</span>
            </li>
          </ul>
        </div>
        <div className="quick-stat-item">
          <h4>Rooms</h4>
          <ul>
            <li>
              <span>Available</span> <span>{stats?.availableRooms || 0}</span>
            </li>
            <li>
              <span>Booked</span> <span>0</span>
            </li>
            <li>
              <span>Maintenance</span>{" "}
              <span>{stats?.maintainanceRooms || 0}</span>
            </li>
          </ul>
        </div>
        <div className="quick-stat-item">
          <h4>Inventory</h4>
          <ul>
            <li>
              <span>Low Stock</span> <span>{stats?.lowStockItems || 0}</span>
            </li>
            <li>
              <span>Out of Stock</span> <span>0</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
