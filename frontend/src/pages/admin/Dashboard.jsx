// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/admin/StatCard";
import PoolMonitoring from "../../components/admin/PoolMonitoring";
import SalesChart from "../../components/admin/SalesChart";
import "./Dashboard.css";
import * as adminApi from "../../services/admin/adminApi";

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
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real bookings data
      const bookings = await adminApi.getAllBookings();
      
      // Calculate booking stats
      const totalReservations = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
      const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
      const completedBookings = bookings.filter(b => b.status === 'Completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
      
      // Fetch dashboard stats (includes revenue and expenses)
      const dashboardStats = await adminApi.getDashboardStats();
      
      // Fetch rooms
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
      
      // Fetch staff
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

      <PoolMonitoring />

      {/* Key Metrics - First Row */}
      <div className="stats-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="stats-grid">
          <StatCard title="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} icon="💰" />
          <StatCard title="Monthly Revenue" value={`₱${stats.monthlyRevenue.toLocaleString()}`} icon="📈" />
          <StatCard title="Total Expenses" value={`₱${stats.totalExpenses.toLocaleString()}`} icon="💸" color="#ef4444" />
          <StatCard title="Monthly Expenses" value={`₱${stats.monthlyExpenses.toLocaleString()}`} icon="📊" color="#f59e0b" />
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