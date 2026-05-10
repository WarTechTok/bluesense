// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/admin/StatCard";
import PoolMonitoring from "../../components/admin/PoolMonitoring";
import SalesChart from "../../components/admin/SalesChart";
import "./Dashboard.css";
import * as adminApi from '../../services/admin';

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
  const [inspectionMaintenance, setInspectionMaintenance] = useState(0);
  const [dailySalesData, setDailySalesData] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    selectedDateSales: null,
    selectedDate: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get today and yesterday dates in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
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

      // Fetch inspection-generated maintenance records
      let inspectionMaintenanceCount = 0;
      try {
        const maintenance = await adminApi.getAllMaintenance();
        inspectionMaintenanceCount = maintenance.filter(m => m.inspectionId).length;
        setInspectionMaintenance(inspectionMaintenanceCount);
      } catch (err) {
        console.error('Error fetching inspection maintenance:', err);
      }

      // Fetch daily sales data
      try {
        const todaySalesRes = await adminApi.getDailySales(todayStr).catch(() => ({ sales: [], total: 0 }));
        const yesterdaySalesRes = await adminApi.getDailySales(yesterdayStr).catch(() => ({ sales: [], total: 0 }));
        
        const todayTotal = todaySalesRes?.total || 0;
        const yesterdayTotal = yesterdaySalesRes?.total || 0;
        
        setDailySalesData({
          todaySales: todayTotal,
          yesterdaySales: yesterdayTotal,
          selectedDateSales: null,
          selectedDate: null,
        });
      } catch (err) {
        console.error('Error fetching daily sales:', err);
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
    // Set up interval to refresh daily sales every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // Handle date selection for daily sales report
  const handleDateSelectionForSales = async (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) {
      setDailySalesData(prev => ({
        ...prev,
        selectedDateSales: null,
        selectedDate: null,
      }));
      return;
    }

    try {
      const salesData = await adminApi.getDailySales(selectedDate);
      const total = salesData?.total || 0;
      setDailySalesData(prev => ({
        ...prev,
        selectedDateSales: total,
        selectedDate: selectedDate,
      }));
    } catch (error) {
      console.error('Error fetching sales for selected date:', error);
    }
  };

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

      {/* Daily Sales Report Section */}
      <div className="stats-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title">Daily Sales Report</h2>
          <input 
            type="date" 
            className="date-picker"
            onChange={handleDateSelectionForSales}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div className="daily-sales-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f0f4ff', borderLeft: '4px solid #4CAF50' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Today's Sales</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>₱{dailySalesData.todaySales.toFixed(2)}</div>
          </div>
          
          <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Yesterday's Auto-Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>₱{dailySalesData.yesterdaySales.toFixed(2)}</div>
          </div>

          {dailySalesData.selectedDate && (
            <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f3e5f5', borderLeft: '4px solid #9C27B0' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Sales for {dailySalesData.selectedDate}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>₱{(dailySalesData.selectedDateSales || 0).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary - Professional Table Format (Margin column removed) */}
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
          <StatCard title="Inspection Maintenance" value={inspectionMaintenance} icon="📋" color="#3b82f6" />
        </div>
      </div>

      {/* Sales Charts */}
      <SalesChart />
    </div>
  );
};

export default Dashboard;