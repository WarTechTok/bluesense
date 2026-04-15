// frontend/src/pages/admin/Reports.jsx
// ============================================
// REPORTS - Clean design matching theme
// ============================================

import React, { useState } from "react";
import "./ManagementPages.css";
import * as adminApi from "../../services/admin/adminApi";
import * as XLSX from "xlsx";

const Reports = () => {
  const [reportType, setReportType] = useState("booking");
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let data;

      if (reportType === "sales") {
        const result = await adminApi.getSalesReport(startDate, endDate);
        console.log("Sales Report Result:", result);
        data = { sales: result.sales || [], totalSales: result.totalSales };

        if (data.sales && Array.isArray(data.sales)) {
          data.sales.sort((a, b) => {
            const aRef = a.booking?.bookingReference || "0";
            const bRef = b.booking?.bookingReference || "0";
            const aId = parseInt(aRef);
            const bId = parseInt(bRef);
            return aId - bId;
          });
        }
      } else if (reportType === "booking") {
        data = await adminApi.getAllBookings();

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          data = data.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= start && bookingDate <= end;
          });
        }

        if (Array.isArray(data)) {
          data.sort((a, b) => {
            const aRef = a.bookingReference || "0";
            const bRef = b.bookingReference || "0";
            const aId = parseInt(aRef);
            const bId = parseInt(bRef);
            return aId - bId;
          });
        }
      } else if (reportType === "inventory") {
        data = await adminApi.getInventoryUsageReport(startDate, endDate);
      } else if (reportType === "staff") {
        data = await adminApi.getStaffActivityReport();
      }

      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
  try {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }

    setExporting(true);

    let exportData = [];
    let sheetName = "";
    let filename = "";

    if (reportType === "sales") {
      exportData = reportData.sales || [];
      sheetName = "Sales Report";
      filename = `sales-report-${new Date().toISOString().split("T")[0]}.xlsx`;

      exportData = exportData.map((row) => ({
        "Booking ID": row.booking?.bookingReference || "N/A",
        "Guest Name": row.booking?.customerName || row.customerName || "N/A",
        Amount: row.amount || 0,
        Date: row.date ? new Date(row.date).toLocaleDateString() : "N/A",
      }));
    } else if (reportType === "booking") {
      exportData = reportData || [];
      sheetName = "Booking Report";
      filename = `booking-report-${new Date().toISOString().split("T")[0]}.xlsx`;

      exportData = exportData.map((row) => ({
        "Booking ID": row.bookingReference || "N/A",
        "Guest Name": row.customerName || "N/A",
        "Contact No.": row.customerContact || "N/A",
        "Pool/Villa Name": row.oasis || "N/A",
        Amount: row.totalAmount || 0,
        "Payment Status": row.paymentStatus || "Pending",
        "Booking Date": row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "N/A",
        "Reservation Date": row.bookingDate
          ? new Date(row.bookingDate).toLocaleDateString()
          : "N/A",
        "Time Slot": row.session || "N/A",
        "No. of Guests": row.pax || 0,
        "Total Paid":
          row.paymentType === "fullpayment"
            ? row.totalAmount || 0
            : row.downpayment || 0,
        Balance:
          row.paymentType === "fullpayment"
            ? 0
            : (row.totalAmount || 0) - (row.downpayment || 0),
        Status: row.status || "Pending",
      }));
    } else if (reportType === "inventory") {
      exportData = reportData || [];
      sheetName = "Inventory Report";
      filename = `inventory-report-${new Date().toISOString().split("T")[0]}.xlsx`;

      exportData = exportData.map((row) => ({
        "Item Name": row.item || row.name || "N/A",
        "Total Used": row.totalUsed || 0,
        "Current Stock": row.currentStock || 0,
      }));
    } else if (reportType === "staff") {
      exportData = reportData || [];
      sheetName = "Staff Activity Report";
      filename = `staff-report-${new Date().toISOString().split("T")[0]}.xlsx`;

      exportData = exportData.map((row) => ({
        "Staff Name": row.name || "N/A",
        Role: row.role || "Staff",
        Status: row.status || "Active",
        Activity: row.activityCount || 0,
      }));
    }

    if (!exportData.length) {
      alert("No data to export");
      setExporting(false);
      return;
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Export to Excel
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    alert("Error exporting report");
  } finally {
    setExporting(false);
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
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

          {reportType !== "staff" && (
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
            <button
              className="btn-primary"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
            <button
              className="btn-outline"
              onClick={handleExport}
              disabled={!reportData || exporting}
            >
              {exporting ? "Exporting..." : "Export Excel"}
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
                {new Date(startDate).toLocaleDateString()} -{" "}
                {new Date(endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Summary for Sales Report */}
          {reportType === "sales" && reportData.totalSales !== undefined && (
            <div className="stats-grid small">
              <div className="stat-card">
                <div className="stat-title">Total Sales</div>
                <div className="stat-value">
                  {formatCurrency(reportData.totalSales)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Transactions</div>
                <div className="stat-value">
                  {reportData.sales?.length || 0}
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {reportType === "booking" && (
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
                  {reportType === "sales" && (
                    <>
                      <th>Booking ID</th>
                      <th>Guest Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </>
                  )}
                  {reportType === "inventory" && (
                    <>
                      <th>Item Name</th>
                      <th>Total Used</th>
                      <th>Current Stock</th>
                    </>
                  )}
                  {reportType === "staff" && (
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
                {!reportData ||
                (Array.isArray(reportData) && reportData.length === 0) ||
                (reportData.sales && reportData.sales.length === 0) ? (
                  <tr>
                    <td colSpan="13" className="no-data">
                      No data available
                    </td>
                  </tr>
                ) : (
                  (reportData.sales || reportData || []).map((row, idx) => (
                    <tr key={idx}>
                      {reportType === "booking" && (
                        <>
                          <td>
                            <strong>{row.bookingReference || "N/A"}</strong>
                          </td>
                          <td>{row.customerName || "N/A"}</td>
                          <td>{row.customerContact || "N/A"}</td>
                          <td>{row.oasis || "N/A"}</td>
                          <td className="amount">
                            {formatCurrency(row.totalAmount || 0)}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${(row.paymentStatus || "pending").toLowerCase()}`}
                            >
                              {row.paymentStatus || "Pending"}
                            </span>
                          </td>
                          <td>
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            {row.bookingDate
                              ? new Date(row.bookingDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{row.session || "N/A"}</td>
                          <td>{row.pax || 0}</td>
                          <td className="amount">
                            {formatCurrency(
                              row.paymentType === "fullpayment"
                                ? row.totalAmount || 0
                                : row.downpayment || 0,
                            )}
                          </td>
                          <td className="amount">
                            {formatCurrency(
                              row.paymentType === "fullpayment"
                                ? 0
                                : (row.totalAmount || 0) -
                                    (row.downpayment || 0),
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${(row.status || "pending").toLowerCase()}`}
                            >
                              {row.status || "Pending"}
                            </span>
                          </td>
                        </>
                      )}
                      {reportType === "sales" && (
                        <>
                          <td>
                            <strong>
                              {row.booking?.bookingReference || "N/A"}
                            </strong>
                          </td>
                          <td>
                            {row.booking?.customerName ||
                              row.customerName ||
                              row.guestName ||
                              "N/A"}
                          </td>
                          <td className="amount">
                            {formatCurrency(
                              row.amount || row.booking?.totalAmount || 0,
                            )}
                          </td>
                          <td>
                            {new Date(
                              row.date || row.createdAt,
                            ).toLocaleDateString()}
                          </td>
                        </>
                      )}
                      {reportType === "inventory" && (
                        <>
                          <td>{row.item || row.name || "N/A"}</td>
                          <td>{row.totalUsed || 0}</td>
                          <td>{row.currentStock || 0}</td>
                        </>
                      )}
                      {reportType === "staff" && (
                        <>
                          <td>{row.name || "N/A"}</td>
                          <td>{row.role || "Staff"}</td>
                          <td>
                            <span
                              className={`status-badge ${row.status === "active" ? "status-active" : "status-inactive"}`}
                            >
                              {row.status || "Active"}
                            </span>
                          </td>
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
