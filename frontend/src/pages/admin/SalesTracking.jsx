// frontend/src/pages/admin/SalesTracking.jsx
// ============================================
// SALES TRACKING - Date range picker with clean design
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin';

const SalesTracking = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRangeText, setDateRangeText] = useState('');

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('🔐 Token exists:', !!token);
      
      // Fetch sales between dates
      const data = await adminApi.getSalesByDateRange(startDate, endDate);
      
      console.log('✅ Raw API response:', data);
      let salesList = data.sales || [];
      
      console.log('📊 Sales list before sort:', salesList.length);
      console.log('📊 First sale:', salesList[0]);
      
      // Sort sales by booking number in ascending order
      salesList.sort((a, b) => {
        const aNum = a.bookingNumber === 'N/A' ? Infinity : a.bookingNumber;
        const bNum = b.bookingNumber === 'N/A' ? Infinity : b.bookingNumber;
        return aNum - bNum;
      });
      
      console.log('📊 Sales list after sort:', salesList.length);
      
      setSales(salesList);
      setTotalSales(data.total || 0);
      
      // Format date range text for display
      const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setDateRangeText(`${start} - ${end}`);
      
    } catch (error) {
      console.error('❌ Error fetching sales:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Sales Tracking</h1>
        <p className="page-subtitle">View and analyze sales data</p>
      </div>

      {/* Date Range Picker */}
      <div className="date-range-section">
        <div className="quick-ranges">
          <button className="quick-range-btn" onClick={() => handleQuickRange(1)}>Today</button>
          <button className="quick-range-btn" onClick={() => handleQuickRange(7)}>Last 7 Days</button>
          <button className="quick-range-btn" onClick={() => handleQuickRange(30)}>Last 30 Days</button>
          <button className="quick-range-btn" onClick={() => handleQuickRange(90)}>Last 90 Days</button>
        </div>
        
        <div className="date-range-picker">
          <div className="date-input-group">
            <label>From:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="date-input"
            />
          </div>
          <div className="date-separator">→</div>
          <div className="date-input-group">
            <label>To:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-title">Total Sales</div>
            <div className="stat-value">{formatCurrency(totalSales)}</div>
            <div className="stat-period">{dateRangeText}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-title">Transactions</div>
            <div className="stat-value">{sales.length}</div>
            <div className="stat-period">Total bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-title">Average Sale</div>
            <div className="stat-value">
              {sales.length > 0 ? formatCurrency(totalSales / sales.length) : formatCurrency(0)}
            </div>
            <div className="stat-period">Per transaction</div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="sales-table-container">
        <div className="table-header">
          <h3>Sales Details</h3>
          {sales.length > 0 && (
            <div className="table-info">Showing {sales.length} transactions</div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading sales data...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Reference Code</th>
                  <th>Location</th>
                  <th>Guest Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr className="no-data-row">
                    <td colSpan="6">
                      <div className="no-data">
                        <i className="fas fa-chart-line"></i>
                        <p>No sales data for this period</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, idx) => {
                    const bookingId = sale.bookingNumber || 'N/A';
                    const referenceCode = sale.referenceCode || 'N/A';
                    const location = sale.location || 'N/A';
                    const customerName = sale.booking?.customerName || sale.reservation?.guestName || 'N/A';
                    
                    console.log(`🟢 Rendering sale ${idx + 1}:`, { bookingId, referenceCode, location, customerName, amount: sale.amount });
                    
                    return (
                      <tr key={idx}>
                        <td className="booking-id">{bookingId}</td>
                        <td className="reference-code">{referenceCode}</td>
                        <td className="location">{location}</td>
                        <td className="customer-name">{customerName}</td>
                        <td className="amount">{formatCurrency(sale.amount || 0)}</td>
                        <td className="date">{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTracking;