// frontend/src/pages/admin/SalesTracking.jsx
// ============================================
// SALES TRACKING - Clean design matching theme
// ============================================

import React, { useState, useEffect } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin/adminApi';

const SalesTracking = () => {
  const [sales, setSales] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        console.log('🔐 Token exists:', !!token, token ? `(${token.length} chars)` : '');
        
        let data;

        if (selectedPeriod === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          console.log('📅 Fetching daily sales for:', today);
          data = await adminApi.getDailySales(today);
        } else if (selectedPeriod === 'weekly') {
          console.log('📅 Fetching weekly sales');
          data = await adminApi.getWeeklySales();
        } else {
          const now = new Date();
          console.log('📅 Fetching monthly sales for:', now.getMonth(), now.getFullYear());
          data = await adminApi.getMonthlySales(now.getMonth(), now.getFullYear());
        }

        console.log('✅ Sales data received:', data);
        let salesList = data.sales || [];
        
        console.log('📋 Sales before sort:', salesList.map(s => ({ 
          ref: s.booking?.bookingReference, 
          name: s.booking?.customerName,
          amount: s.amount 
        })));
        
        // Sort sales by booking reference in ascending order
        salesList.sort((a, b) => {
          const aRef = a.booking?.bookingReference || '0';
          const bRef = b.booking?.bookingReference || '0';
          const aId = parseInt(aRef);
          const bId = parseInt(bRef);
          console.log(`Comparing: ${aId} vs ${bId}`);
          return aId - bId;
        });
        
        console.log('📋 Sales after sort:', salesList.map(s => ({ 
          ref: s.booking?.bookingReference, 
          name: s.booking?.customerName,
          amount: s.amount 
        })));
        
        setSales(salesList);
        setTotalSales(data.total || 0);
      } catch (error) {
        console.error('❌ Error fetching sales:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Error Data:', error.response?.data);
        setError(error.response?.data?.error || error.message || 'Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [selectedPeriod]);

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
      </div>

      <div className="filter-section">
        <label>Period: </label>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Sales ({selectedPeriod})</div>
          <div className="stat-value">{formatCurrency(totalSales)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Transactions</div>
          <div className="stat-value">{sales.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Average Sale</div>
          <div className="stat-value">
            {sales.length > 0 ? formatCurrency(totalSales / sales.length) : formatCurrency(0)}
          </div>
        </div>
      </div>

      <div className="sales-table-container">
        <h3>Sales Details</h3>
        {error && (
          <div className="error-message">
            ❌ Error: {error}
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
                  <th>Guest Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">No sales data available</td>
                  </tr>
                ) : (
                  sales.map((sale, idx) => {
                    const bookingRef = sale.booking?.bookingReference || 'N/A';
                    const customerName = sale.booking?.customerName || sale.reservation?.guestName || 'N/A';
                    
                    return (
                      <tr key={idx}>
                        <td className="booking-id">{bookingRef}</td>
                        <td>{customerName}</td>
                        <td className="amount">{formatCurrency(sale.amount || 0)}</td>
                        <td>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
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