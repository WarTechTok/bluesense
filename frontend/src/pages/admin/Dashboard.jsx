import React, { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import './Dashboard.css';
import * as adminApi from '../../services/admin/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, dailyChartData, monthlyChartData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDailyChartData(),
          adminApi.getMonthlyChartData(),
        ]);
        
        setStats(statsData);
        setDailyData(dailyChartData || []);
        setMonthlyData(monthlyChartData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Admin Dashboard</p>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid">
        <StatCard
          title="Total Reservations"
          value={stats?.totalReservations || 0}
          icon="📅"
          color="#667eea"
        />
        <StatCard
          title="Available Rooms"
          value={stats?.availableRooms || 0}
          icon="🏠"
          color="#28a745"
        />
        <StatCard
          title="Maintenance Rooms"
          value={stats?.maintainanceRooms || 0}
          icon="🔧"
          color="#ffc107"
        />
        <StatCard
          title="Active Staff"
          value={stats?.activeStaff || 0}
          icon="👥"
          color="#5b9bd5"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₱${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          icon="💰"
          color="#764ba2"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockItems || 0}
          icon="⚠️"
          color="#dc3545"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Sales (Last 7 Days)</h3>
          <div className="chart-placeholder">
            {dailyData.length > 0 ? (
              <div className="simple-chart">
                {dailyData.map((item, idx) => (
                  <div key={idx} className="chart-bar-item">
                    <div className="chart-bar" style={{ height: `${(item.total / 100) * 100}px` }}></div>
                    <span className="chart-label">{item._id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No daily sales data available</p>
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
                    <div className="chart-bar" style={{ height: `${(item.total / 100) * 100}px` }}></div>
                    <span className="chart-label">{item._id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No monthly sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-item">
          <h4>Reservation Status</h4>
          <ul>
            <li>Pending: TBD</li>
            <li>Confirmed: TBD</li>
            <li>Cancelled: TBD</li>
          </ul>
        </div>
        <div className="quick-stat-item">
          <h4>Room Status</h4>
          <ul>
            <li>Available: {stats?.availableRooms || 0}</li>
            <li>Booked: TBD</li>
            <li>Maintenance: {stats?.maintainanceRooms || 0}</li>
          </ul>
        </div>
        <div className="quick-stat-item">
          <h4>Inventory Alerts</h4>
          <ul>
            <li>Low Stock Items: {stats?.lowStockItems || 0}</li>
            <li>Out of Stock: TBD</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
