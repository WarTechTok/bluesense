import React, { useState, useEffect } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin/adminApi';

const SalesTracking = () => {
  const [sales, setSales] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [selectedPeriod]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedPeriod === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        data = await adminApi.getDailySales(today);
      } else if (selectedPeriod === 'weekly') {
        data = await adminApi.getWeeklySales();
      } else {
        const now = new Date();
        data = await adminApi.getMonthlySales(now.getMonth(), now.getFullYear());
      }

      setSales(data.sales || []);
      setTotalSales(data.total || 0);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
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
                    <td>{sale._id}</td>
                    <td>{sale.reservation?.guestName || 'N/A'}</td>
                    <td>₱{sale.amount}</td>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
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
