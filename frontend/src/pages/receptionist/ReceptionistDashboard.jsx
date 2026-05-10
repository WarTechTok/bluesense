import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../../services/admin';
import '../admin/ManagementPages.css';

/**
 * Receptionist Dashboard
 * Displays bookings, sales, and other metrics relevant to receptionist role
 */
const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalSales: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
  });
  const [dailySalesData, setDailySalesData] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    selectedDateSales: null,
    selectedDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    loadDashboardData();
    // Set up interval to refresh daily sales every 5 minutes
    const refreshInterval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today and yesterday dates in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Fetch all data in parallel
      const [bookingsRes, roomsRes, salesRes, todaySalesRes, yesterdaySalesRes] = await Promise.all([
        adminApi.getAllBookings().catch(() => []),
        adminApi.getAllRooms().catch(() => []),
        adminApi.getAllSales().catch(() => []),
        adminApi.getDailySales(todayStr).catch(() => ({ sales: [], total: 0 })),
        adminApi.getDailySales(yesterdayStr).catch(() => ({ sales: [], total: 0 })),
      ]);

      // Backend returns arrays directly, not nested objects
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : [];
      const rooms = Array.isArray(roomsRes) ? roomsRes : [];
      const sales = Array.isArray(salesRes) ? salesRes : [];

      // Calculate stats
      const pendingCount = bookings.filter(b => b.status === 'Pending').length;
      const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
      const completedCount = bookings.filter(b => b.status === 'Completed').length;
      const availableCount = rooms.filter(r => r.status === 'Available').length;
      const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
      const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || s.amount || 0), 0);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        completedBookings: completedCount,
        totalSales: totalSales,
        totalRooms: rooms.length,
        availableRooms: availableCount,
        occupiedRooms: occupiedCount,
      });

      // Get daily sales data
      const todayTotal = todaySalesRes?.total || 0;
      const yesterdayTotal = yesterdaySalesRes?.total || 0;
      
      setDailySalesData({
        todaySales: todayTotal,
        yesterdaySales: yesterdayTotal,
        selectedDateSales: null,
        selectedDate: null,
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
      
      // Get recent sales (last 5)
      setRecentSales(sales.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="management-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Receptionist Dashboard</h1>
          <p>Overview of bookings, sales, and room management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Bookings Stats */}
        <div className="stat-card">
          <div className="stat-icon bookings">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
            <div className="stat-breakdown">
              <span className="pending">Pending: {stats.pendingBookings}</span>
              <span className="confirmed">Confirmed: {stats.confirmedBookings}</span>
              <span className="completed">Completed: {stats.completedBookings}</span>
            </div>
          </div>
        </div>

        {/* Rooms Stats */}
        <div className="stat-card">
          <div className="stat-icon rooms">
            <i className="fas fa-bed"></i>
          </div>
          <div className="stat-content">
            <h3>Rooms</h3>
            <p className="stat-number">{stats.totalRooms}</p>
            <div className="stat-breakdown">
              <span className="available">Available: {stats.availableRooms}</span>
              <span className="occupied">Occupied: {stats.occupiedRooms}</span>
            </div>
          </div>
        </div>

        {/* Sales Stats */}
        <div className="stat-card">
          <div className="stat-icon sales">
            <i className="fas fa-chart-simple"></i>
          </div>
          <div className="stat-content">
            <h3>Total Sales</h3>
            <p className="stat-number">₱{stats.totalSales.toFixed(2)}</p>
            <span className="stat-label">All time sales</span>
          </div>
        </div>
      </div>

      {/* Daily Sales Report Section */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Daily Sales Report</h2>
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

      {/* Recent Bookings */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <button 
            className="btn-view-all"
            onClick={() => navigate('/receptionist/bookings')}
          >
            View All
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="recent-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td><strong>{booking.bookingReference || booking._id.slice(0, 8)}</strong></td>
                    <td>{booking.customerName || 'N/A'}</td>
                    <td>{booking.customerContact || 'N/A'}</td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>₱{booking.totalAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Sales */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Sales</h2>
          <button 
            className="btn-view-all"
            onClick={() => navigate('/receptionist/sales')}
          >
            View All
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-chart-line"></i>
            <p>No sales yet</p>
          </div>
        ) : (
          <div className="recent-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td><strong>{sale.booking?.bookingReference || sale._id.slice(0, 8)}</strong></td>
                    <td>{sale.booking?.customerName || 'N/A'}</td>
                    <td>{sale.booking?.packageType || 'N/A'}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td><strong>₱{sale.totalAmount?.toFixed(2) || '0.00'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => navigate('/receptionist/bookings')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Manage Bookings</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/receptionist/rooms')}
          >
            <i className="fas fa-door-open"></i>
            <span>View Rooms</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/receptionist/inventory')}
          >
            <i className="fas fa-boxes"></i>
            <span>Check Inventory</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/receptionist/sales')}
          >
            <i className="fas fa-chart-bar"></i>
            <span>View Sales</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/receptionist/reports')}
          >
            <i className="fas fa-file-pdf"></i>
            <span>Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
