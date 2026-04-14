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
    monthlyRevenue: 0,
    totalRevenue: 0,
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
      
      // Calculate total revenue (all confirmed bookings)
      const totalRevenue = bookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
        .reduce((sum, b) => sum + (b.downpayment || 0), 0);
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.bookingDate);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 (b.status === 'Confirmed' || b.status === 'Completed');
        })
        .reduce((sum, b) => sum + (b.downpayment || 0), 0);
      
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
        monthlyRevenue,
        totalRevenue,
        lowStockItems: 0
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
          <StatCard title="Total Bookings" value={stats.totalReservations} icon="📅" />
          <StatCard title="Active Staff" value={stats.activeStaff} icon="👥" />
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