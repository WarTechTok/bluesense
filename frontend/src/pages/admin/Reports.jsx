// frontend/src/pages/admin/Reports.jsx
// ============================================
// REPORTS - Clean design matching theme
// ============================================

import React, { useState } from 'react';
import './ManagementPages.css';
import * as adminApi from '../../services/admin/adminApi';
import { exportToExcel, exportToExcelWithSummary } from '../../utils/excelExport';

const Reports = () => {
  const [reportType, setReportType] = useState('booking');
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let data;

      if (reportType === 'sales') {
        const result = await adminApi.getSalesReport(startDate, endDate);
        data = { sales: result.sales, totalSales: result.totalSales };
      } else if (reportType === 'booking') {
        data = await adminApi.getAllBookings();
        // Filter by date range if provided
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter(booking => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= start && bookingDate <= end;
          });
        }
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
              <option value="booking">Booking Report</option>
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
                  {reportType === 'booking' && (
                    <>
                      <th>Booking ID</th>
                      <th>Guest Name</th>
                      <th>Contact No.</th>
                      <th>Pool/Villa Name</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Booking Date</th>
                      <th>Reservation Date</th>
                      <th>Time Slot</th>
                      <th>No. of Guests</th>
                      <th>Total Paid</th>
                      <th>Balance</th>
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
                    <td colSpan="13" className="no-data">No data available</td>
                  </tr>
                ) : (
                  (reportData.sales || reportData || []).map((row, idx) => (
                    <tr key={idx}>
                      {reportType === 'booking' && (
                        <>
                          <td>{row.bookingReference || (row._id ? row._id.slice(-6).toUpperCase() : 'N/A')}</td>
                          <td>{row.customerName || 'N/A'}</td>
                          <td>{row.customerContact || 'N/A'}</td>
                          <td>{row.oasis || 'N/A'}</td>
                          <td className="amount">{formatCurrency(row.totalAmount || 0)}</td>
                          <td><span className={`status-badge status-${(row.paymentStatus || 'pending').toLowerCase()}`}>{row.paymentStatus || 'Pending'}</span></td>
                          <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>{row.bookingDate ? new Date(row.bookingDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{row.session || 'N/A'}</td>
                          <td>{row.pax || 0}</td>
                          <td className="amount">{formatCurrency(row.paymentType === 'fullpayment' ? (row.totalAmount || 0) : (row.downpayment || 0))}</td>
                          <td className="amount">{formatCurrency(row.paymentType === 'fullpayment' ? 0 : ((row.totalAmount || 0) - (row.downpayment || 0)))}</td>
                          <td><span className={`status-badge status-${(row.status || 'pending').toLowerCase()}`}>{row.status || 'Pending'}</span></td>
                        </>
                      )}
                      {reportType === 'sales' && (
                        <>
                          <td>{row.booking?.bookingReference || (row.booking?._id ? row.booking._id.slice(-6).toUpperCase() : (row._id ? row._id.slice(-6).toUpperCase() : 'N/A'))}</td>
                          <td>{row.booking?.customerName || row.customerName || row.guestName || 'N/A'}</td>
                          <td className="amount">{formatCurrency(row.amount || row.booking?.totalAmount || 0)}</td>
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