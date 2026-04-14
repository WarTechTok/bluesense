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
        
        // Debug: Check if token exists
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
        setSales(data.sales || []);
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

      <div className="sales-summary">
        <div className="summary-card">
          <h3>Total Sales ({selectedPeriod})</h3>
          <p className="summary-value">₱{totalSales.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Transactions</h3>
          <p className="summary-value">{sales.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Sale</h3>
          <p className="summary-value">₱{sales.length > 0 ? (totalSales / sales.length).toFixed(2) : 0}</p>
        </div>
      </div>

      <div className="sales-table-container">
        <h3>Sales Details</h3>
        {error && (
          <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
            ❌ Error: {error}
          </div>
        )}
        {loading ? (
          <p>Loading sales data...</p>
        ) : (
          <table className="sales-table">
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
                  <td colSpan="4" style={{ textAlign: 'center' }}>No sales data</td>
                </tr>
              ) : (
                sales.map((sale, idx) => (
                  <tr key={idx}>
                    <td>{sale._id || 'N/A'}</td>
                    <td>
                      {sale.booking?.customerName || sale.reservation?.guestName || 'N/A'}
                    </td>
                    <td>₱{(sale.amount || 0).toLocaleString()}</td>
                    <td>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesTracking;
