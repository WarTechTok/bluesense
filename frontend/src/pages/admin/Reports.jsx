import React, { useState } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin/adminApi';

const Reports = () => {
  const [reportType, setReportType] = useState('reservation');
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let data;

      if (reportType === 'reservation') {
        data = await adminApi.getReservationReport(startDate, endDate);
      } else if (reportType === 'sales') {
        const result = await adminApi.getSalesReport(startDate, endDate);
        data = { sales: result.sales, totalSales: result.totalSales };
      } else if (reportType === 'inventory') {
        data = await adminApi.getInventoryUsageReport(startDate, endDate);
      } else if (reportType === 'staff') {
        data = await adminApi.getStaffActivityReport();
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await adminApi.exportReportAsJSON(reportType, startDate, endDate);
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="reservation">Reservation Report</option>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Usage Report</option>
            <option value="staff">Staff Activity Report</option>
          </select>
        </div>

        {reportType !== 'staff' && (
          <>
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <button className="btn-primary" onClick={handleGenerateReport}>
          Generate Report
        </button>
        <button className="btn-secondary" onClick={handleExport}>
          Export as JSON
        </button>
      </div>

      {loading && <p className="loading-msg">Loading report...</p>}

      {reportData && (
        <div className="report-container">
          <h3>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>

          {reportType === 'sales' && (
            <div className="report-summary">
              <h4>Total Sales: ₱{reportData.totalSales?.toLocaleString() || 0}</h4>
              <p>Number of Transactions: {reportData.sales?.length || 0}</p>
            </div>
          )}

          <table className="report-table">
            <thead>
              <tr>
                {reportType === 'reservation' && (
                  <>
                    <th>Guest</th>
                    <th>Email</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                  </>
                )}
                {reportType === 'sales' && (
                  <>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </>
                )}
                {reportType === 'inventory' && (
                  <>
                    <th>Item</th>
                    <th>Total Used</th>
                    <th>Current Stock</th>
                  </>
                )}
                {reportType === 'staff' && (
                  <>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Activity Count</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(reportData) && reportData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              )}
              {Array.isArray(reportData) && reportData.map((row, idx) => (
                <tr key={idx}>
                  {reportType === 'reservation' && (
                    <>
                      <td>{row.guestName}</td>
                      <td>{row.guestEmail}</td>
                      <td>{new Date(row.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(row.checkOut).toLocaleDateString()}</td>
                      <td>{row.status}</td>
                    </>
                  )}
                  {reportType === 'sales' && (
                    <>
                      <td>{row._id}</td>
                      <td>{row.reservation?.guestName || 'N/A'}</td>
                      <td>₱{row.amount}</td>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                    </>
                  )}
                  {reportType === 'inventory' && (
                    <>
                      <td>{row.item}</td>
                      <td>{row.totalUsed}</td>
                      <td>{row.currentStock}</td>
                    </>
                  )}
                  {reportType === 'staff' && (
                    <>
                      <td>{row.name}</td>
                      <td>{row.role}</td>
                      <td>{row.status}</td>
                      <td>{row.activityCount}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
