// frontend/src/pages/admin/Reports.jsx
// ============================================
// REPORTS - Clean design matching theme
// ============================================

import React, { useState } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin/adminApi';
import { exportToExcel, exportToExcelWithSummary, exportToJSON } from '../../utils/excelExport';

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

  const handleExportExcel = async () => {
    try {
      if (!reportData) {
        alert('Please generate a report first');
        return;
      }

      const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      const dataToExport = reportData.sales || reportData || [];

      if (reportType === 'sales' && reportData.totalSales !== undefined) {
        // Export with summary for sales
        const summary = {
          totalSales: reportData.totalSales,
          transactionCount: dataToExport.length
        };
        exportToExcelWithSummary(dataToExport, summary, reportType, fileName);
      } else {
        // Export regular data
        exportToExcel(dataToExport, reportType, fileName);
      }

      alert('Report exported successfully as Excel');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting report');
    }
  };

  const handleExportJSON = async () => {
    try {
      if (!reportData) {
        alert('Please generate a report first');
        return;
      }

      const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      const dataToExport = {
        reportType,
        generatedDate: new Date().toISOString(),
        data: reportData.sales || reportData,
        ...(reportData.totalSales && { summary: { totalSales: reportData.totalSales } })
      };

      exportToJSON(dataToExport, reportType, fileName);
      alert('Report exported successfully as JSON');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Error exporting report');
    }
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
        <h1>Reports</h1>
      </div>

      {/* Filter Section */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Report Type</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="filter-select"
            >
              <option value="reservation">Reservation Report</option>
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Usage Report</option>
              <option value="staff">Staff Activity Report</option>
            </select>
          </div>

          {reportType !== 'staff' && (
            <>
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="filter-input"
                />
              </div>
            </>
          )}

          <div className="filter-actions">
            <button className="btn-primary" onClick={handleGenerateReport}>
              <i className="fas fa-sync-alt"></i> Generate Report
            </button>
            <button className="btn-success" onClick={handleExportExcel} disabled={!reportData}>
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
            <button className="btn-outline" onClick={handleExportJSON} disabled={!reportData}>
              <i className="fas fa-file-code"></i> Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {/* Report Results */}
      {reportData && !loading && (
        <div className="report-container">
          <div className="report-header">
            <h3>
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </h3>
            {startDate && endDate && (
              <p className="report-date-range">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Summary for Sales Report */}
          {reportType === 'sales' && reportData.totalSales !== undefined && (
            <div className="stats-grid small">
              <div className="stat-card">
                <div className="stat-title">Total Sales</div>
                <div className="stat-value">{formatCurrency(reportData.totalSales)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Transactions</div>
                <div className="stat-value">{reportData.sales?.length || 0}</div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {reportType === 'reservation' && (
                    <>
                      <th>Guest Name</th>
                      <th>Email</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Status</th>
                    </>
                  )}
                  {reportType === 'sales' && (
                    <>
                      <th>Booking ID</th>
                      <th>Guest Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </>
                  )}
                  {reportType === 'inventory' && (
                    <>
                      <th>Item Name</th>
                      <th>Total Used</th>
                      <th>Current Stock</th>
                    </>
                  )}
                  {reportType === 'staff' && (
                    <>
                      <th>Staff Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Activity</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(!reportData || (Array.isArray(reportData) && reportData.length === 0) || 
                  (reportData.sales && reportData.sales.length === 0)) ? (
                  <tr>
                    <td colSpan="5" className="no-data">No data available</td>
                  </tr>
                ) : (
                  (reportData.sales || reportData || []).map((row, idx) => (
                    <tr key={idx}>
                      {reportType === 'reservation' && (
                        <>
                          <td>{row.guestName || row.customerName || 'N/A'}</td>
                          <td>{row.guestEmail || row.customerEmail || 'N/A'}</td>
                          <td>{row.checkIn ? new Date(row.checkIn).toLocaleDateString() : 'N/A'}</td>
                          <td>{row.checkOut ? new Date(row.checkOut).toLocaleDateString() : 'N/A'}</td>
                          <td><span className={`status-badge status-${(row.status || 'pending').toLowerCase()}`}>{row.status || 'Pending'}</span></td>
                        </>
                      )}
                      {reportType === 'sales' && (
                        <>
                          <td>{row.booking?.bookingReference || (row.booking?._id ? row.booking._id.slice(-6).toUpperCase() : row._id || 'N/A')}</td>
                          <td>{row.booking?.customerName || row.customerName || row.guestName || 'N/A'}</td>
                          <td className="amount">{formatCurrency(row.amount || row.downpayment || 0)}</td>
                          <td>{new Date(row.date || row.createdAt).toLocaleDateString()}</td>
                        </>
                      )}
                      {reportType === 'inventory' && (
                        <>
                          <td>{row.item || row.name || 'N/A'}</td>
                          <td>{row.totalUsed || 0}</td>
                          <td>{row.currentStock || 0}</td>
                        </>
                      )}
                      {reportType === 'staff' && (
                        <>
                          <td>{row.name || 'N/A'}</td>
                          <td>{row.role || 'Staff'}</td>
                          <td><span className={`status-badge ${row.status === 'active' ? 'status-active' : 'status-inactive'}`}>{row.status || 'Active'}</span></td>
                          <td>{row.activityCount || 0}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;