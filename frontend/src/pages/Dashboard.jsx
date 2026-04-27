// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/admin/StatCard";
import PoolMonitoring from "../../components/admin/PoolMonitoring";
import SalesChart from "../../components/admin/SalesChart";
import "./Dashboard.css";
import * as adminApi from '../../services/admin';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    availableRooms: 0,
    maintainanceRooms: 0,
    activeStaff: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    netTotalRevenue: 0,
    netMonthlyRevenue: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [esp32Oasis, setEsp32Oasis] = useState('oasis1');
  const [switching, setSwitching] = useState(false);

  const fetchEsp32Oasis = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/readings/current-oasis`);
      const data = await response.json();
      setEsp32Oasis(data.oasis);
    } catch (error) {
      console.error("Error fetching ESP32 oasis:", error);
    }
  };

  const switchEsp32Oasis = async (oasis) => {
    setSwitching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/readings/set-oasis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oasis })
      });
      
      const data = await response.json();
      if (data.success) {
        setEsp32Oasis(oasis);
        alert(`✅ ESP32 switched to ${oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}`);
        // Refresh after 3 seconds to show new data
        setTimeout(() => window.location.reload(), 3000);
      } else {
        alert('Failed to switch ESP32');
      }
    } catch (error) {
      console.error("Error switching ESP32:", error);
      alert('Error switching ESP32');
    } finally {
      setSwitching(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const bookings = await adminApi.getAllBookings();
      
      const totalReservations = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
      const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
      const completedBookings = bookings.filter(b => b.status === 'Completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
      
      const dashboardStats = await adminApi.getDashboardStats();
      
      let rooms = [];
      let availableRooms = 0;
      let maintainanceRooms = 0;
      try {
        rooms = await adminApi.getAllRooms();
        availableRooms = rooms.filter(r => r.status === 'Available').length;
        maintainanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
      
      let activeStaff = 0;
      try {
        const staff = await adminApi.getAllStaff();
        activeStaff = staff.length;
      } catch (err) {
        console.error('Error fetching staff:', err);
      }
      
      setStats({
        totalReservations,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        availableRooms,
        maintainanceRooms,
        activeStaff,
        totalRevenue: dashboardStats.totalRevenue || 0,
        monthlyRevenue: dashboardStats.monthlyRevenue || 0,
        totalExpenses: dashboardStats.totalExpenses || 0,
        monthlyExpenses: dashboardStats.monthlyExpenses || 0,
        netTotalRevenue: (dashboardStats.totalRevenue || 0) - (dashboardStats.totalExpenses || 0),
        netMonthlyRevenue: (dashboardStats.monthlyRevenue || 0) - (dashboardStats.monthlyExpenses || 0),
        lowStockItems: dashboardStats.lowStockItems || 0
      });
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchEsp32Oasis();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </div>

      {/* ESP32 Oasis Switcher */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
            <i className="fas fa-microchip"></i> ESP32 Pool Monitor Control
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Currently monitoring: <strong style={{ color: esp32Oasis === 'oasis1' ? '#0284c7' : '#f59e0b' }}>
              {esp32Oasis === 'oasis1' ? 'Oasis 1' : 'Oasis 2'}
            </strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => switchEsp32Oasis('oasis1')}
            disabled={switching || esp32Oasis === 'oasis1'}
            style={{
              padding: '8px 24px',
              background: esp32Oasis === 'oasis1' ? '#0284c7' : '#f1f5f9',
              color: esp32Oasis === 'oasis1' ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: esp32Oasis === 'oasis1' ? 'default' : 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Set to Oasis 1
          </button>
          <button
            onClick={() => switchEsp32Oasis('oasis2')}
            disabled={switching || esp32Oasis === 'oasis2'}
            style={{
              padding: '8px 24px',
              background: esp32Oasis === 'oasis2' ? '#f59e0b' : '#f1f5f9',
              color: esp32Oasis === 'oasis2' ? 'white' : '#475569',
              border: 'none',
              borderRadius: '8px',
              cursor: esp32Oasis === 'oasis2' ? 'default' : 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Set to Oasis 2
          </button>
        </div>
      </div>

      <PoolMonitoring />

      {/* Financial Summary */}
      <div className="stats-section">
        <h2 className="section-title">Financial Summary</h2>
        <div className="financial-table">
          <div className="financial-row header">
            <div className="financial-cell">Metric</div>
            <div className="financial-cell text-right">Total</div>
            <div className="financial-cell text-right">Monthly</div>
          </div>
          
          <div className="financial-row">
            <div className="financial-cell label">Revenue</div>
            <div className="financial-cell text-right amount-positive">₱{stats.totalRevenue.toLocaleString()}</div>
            <div className="financial-cell text-right amount-positive">₱{stats.monthlyRevenue.toLocaleString()}</div>
          </div>
          
          <div className="financial-row">
            <div className="financial-cell label">Expenses</div>
            <div className="financial-cell text-right amount-negative">₱{stats.totalExpenses.toLocaleString()}</div>
            <div className="financial-cell text-right amount-negative">₱{stats.monthlyExpenses.toLocaleString()}</div>
          </div>
          
          <div className="financial-row highlight">
            <div className="financial-cell label">Net Profit</div>
            <div className={`financial-cell text-right ${stats.netTotalRevenue >= 0 ? 'amount-profit' : 'amount-loss'}`}>
              ₱{stats.netTotalRevenue.toLocaleString()}
            </div>
            <div className={`financial-cell text-right ${stats.netMonthlyRevenue >= 0 ? 'amount-profit' : 'amount-loss'}`}>
              ₱{stats.netMonthlyRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status */}
      <div className="stats-section">
        <h2 className="section-title">Booking Status</h2>
        <div className="stats-grid">
          <StatCard title="Pending" value={stats.pendingBookings} icon="⏳" color="#f59e0b" />
          <StatCard title="Confirmed" value={stats.confirmedBookings} icon="✓" color="#10b981" />
          <StatCard title="Completed" value={stats.completedBookings} icon="✅" color="#3b82f6" />
          <StatCard title="Cancelled" value={stats.cancelledBookings} icon="❌" color="#ef4444" />
        </div>
      </div>

      {/* Facilities Status */}
      <div className="stats-section">
        <h2 className="section-title">Facilities Status</h2>
        <div className="stats-grid">
          <StatCard title="Available Rooms" value={stats.availableRooms} icon="🏠" color="#10b981" />
          <StatCard title="Maintenance" value={stats.maintainanceRooms} icon="🔧" color="#f59e0b" />
          <StatCard title="Low Stock Items" value={stats.lowStockItems} icon="📦" color="#ef4444" />
        </div>
      </div>

      {/* Sales Charts */}
      <SalesChart />
    </div>
  );
};

export default Dashboard;