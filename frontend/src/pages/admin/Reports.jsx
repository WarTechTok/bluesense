// frontend/src/pages/admin/Reports.jsx
// ============================================
// REPORTS - Clean design matching theme
// ============================================

import React, { useState, useEffect, useCallback } from "react";
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

  // Set default dates on component mount
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateStr = firstDayOfMonth.getFullYear() + "-" +
                         String(firstDayOfMonth.getMonth() + 1).padStart(2, "0") + "-" +
                         String(firstDayOfMonth.getDate()).padStart(2, "0");
    
    const endDateStr = today.getFullYear() + "-" +
                       String(today.getMonth() + 1).padStart(2, "0") + "-" +
                       String(today.getDate()).padStart(2, "0");
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
  }, []);

  // Helper function to get the data array based on report type
  const getDataArray = useCallback(() => {
    if (!reportData) return [];
    
    if (reportType === "sales") {
      // Ensure we return an array
      if (reportData.sales && Array.isArray(reportData.sales)) {
        return reportData.sales;
      }
      return [];
    }
    
    // For booking and inventory, ensure we return an array
    if (Array.isArray(reportData)) {
      return reportData;
    }
    
    console.error("getDataArray: Unexpected data structure", { reportType, reportData });
    return [];
  }, [reportData, reportType]);

  // Debug logging
  useEffect(() => {
    console.log("Current state:", { reportType, reportData, dataArray: getDataArray() });
  }, [reportType, reportData, getDataArray]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let data;

      let queryStartDate = startDate;
      let queryEndDate = endDate;

      console.log("Generating report:", reportType, "Dates:", queryStartDate, queryEndDate);

      if (reportType === "sales") {
        // Fetch sales using the reports endpoint first
        let result;
        try {
          result = await adminApi.getSalesReport(queryStartDate, queryEndDate);
          console.log("Sales Report API Response:", result);
        } catch (err) {
          console.error("Error from getSalesReport:", err);
          result = { sales: [], totalSales: 0 };
        }
        
        // Handle different response structures
        if (result && result.success) {
          data = { 
            sales: result.sales || result.data || [], 
            totalSales: result.totalSales || 0 
          };
        } else if (result && result.sales) {
          data = { 
            sales: result.sales, 
            totalSales: result.totalSales || 0 
          };
        } else if (Array.isArray(result)) {
          data = { 
            sales: result, 
            totalSales: result.reduce((sum, item) => sum + (item.amount || 0), 0)
          };
        } else {
          data = { sales: [], totalSales: 0 };
        }

        // If no data from reports endpoint, try fetching all sales and filter manually
        if (!data.sales || data.sales.length === 0) {
          console.log("No sales from reports endpoint, trying getAllSales...");
          try {
            const allSalesResult = await adminApi.getAllSales();
            const allSales = Array.isArray(allSalesResult) ? allSalesResult : (allSalesResult?.sales || []);
            
            if (allSales.length > 0 && queryStartDate && queryEndDate) {
              const start = new Date(queryStartDate);
              const end = new Date(queryEndDate);
              end.setHours(23, 59, 59, 999);
              
              const filteredSales = allSales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= start && saleDate <= end;
              });
              
              data = {
                sales: filteredSales,
                totalSales: filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
              };
              console.log(`Filtered ${filteredSales.length} sales from date range`);
            }
          } catch (err) {
            console.error("Error from getAllSales fallback:", err);
          }
        }

        // Sort sales by booking number
        if (data.sales && Array.isArray(data.sales) && data.sales.length > 0) {
          data.sales.sort((a, b) => {
            const aNum = a.booking?.bookingNumber || a.bookingNumber || 0;
            const bNum = b.booking?.bookingNumber || b.bookingNumber || 0;
            return aNum - bNum;
          });
        }
        
        console.log("Processed sales data:", data);
        
      } else if (reportType === "booking") {
        // Fetch booking report
        data = await adminApi.getAllBookings();
        
        if (!data || !Array.isArray(data)) {
          data = [];
        } else {
          // Filter to show only completed bookings
          data = data.filter((booking) => booking.status === "Completed");
          
          // Filter by date range
          if (queryStartDate && queryEndDate) {
            const start = new Date(queryStartDate);
            const end = new Date(queryEndDate);
            end.setHours(23, 59, 59, 999); // Include end date fully
            
            data = data.filter((booking) => {
              const createdDate = new Date(booking.createdAt);
              return createdDate >= start && createdDate <= end;
            });
          }
          
          // Sort by booking number
          data.sort((a, b) => {
            const aNum = a.bookingNumber || 0;
            const bNum = b.bookingNumber || 0;
            return aNum - bNum;
          });
        }
        
      } else if (reportType === "inventory") {
        // Fetch inventory report
        data = await adminApi.getInventoryUsageReport(queryStartDate, queryEndDate);
        
        if (!data || !Array.isArray(data)) {
          data = [];
        }
      }

      setReportData(data);
      
      // Show message if no data
      if (reportType === "sales" && (!data.sales || data.sales.length === 0)) {
        alert("No sales data found for the selected date range.");
      } else if (reportType !== "sales" && (!data || data.length === 0)) {
        alert("No data found for the selected date range.");
      }
      
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error generating report: ${error.response?.data?.message || error.message || "Unknown error"}`);
      setReportData(reportType === "sales" ? { sales: [], totalSales: 0 } : []);
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
        const salesData = reportData.sales || [];
        
        if (salesData.length === 0) {
          alert("No data to export");
          setExporting(false);
          return;
        }
        
        exportData = salesData.map((row) => ({
          "Booking ID": row.bookingNumber || row.booking?.bookingNumber || "N/A",
          "Reference Code": row.referenceCode || row.booking?.bookingReference || row.bookingReference || "N/A",
          "Location": row.location || row.booking?.oasis || "N/A",
          "Guest Name": row.booking?.customerName || row.customerName || row.guestName || "N/A",
          "Amount": row.amount || row.totalAmount || 0,
          "Date": row.date ? new Date(row.date).toLocaleDateString() : "N/A",
        }));
        
        sheetName = "Sales Report";
        filename = `sales-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        
      } else if (reportType === "booking") {
        const bookingData = Array.isArray(reportData) ? reportData : [];
        
        if (bookingData.length === 0) {
          alert("No data to export");
          setExporting(false);
          return;
        }
        
        exportData = bookingData.map((row) => ({
          "Booking ID": row.bookingNumber || "N/A",
          "Booking Reference": row.bookingReference || "N/A",
          "Guest Name": row.customerName || "N/A",
          "Contact No.": row.customerContact || "N/A",
          "Pool/Villa Name": row.oasis || "N/A",
          "Amount": row.totalAmount || 0,
          "Payment Status": row.paymentStatus || "Pending",
          "Booking Date": row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
          "Time Slot": row.session || "N/A",
          "No. of Guests": row.pax || 0,
          "Total Paid": row.paymentType === "fullpayment" ? row.totalAmount || 0 : row.downpayment || 0,
          "Balance": row.paymentType === "fullpayment" ? 0 : (row.totalAmount || 0) - (row.downpayment || 0),
          "Status": row.status || "Pending",
        }));
        
        sheetName = "Booking Report";
        filename = `booking-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        
      } else if (reportType === "inventory") {
        const inventoryData = Array.isArray(reportData) ? reportData : [];
        
        if (inventoryData.length === 0) {
          alert("No data to export");
          setExporting(false);
          return;
        }
        
        exportData = inventoryData.map((row) => ({
          "Item Name": row.item || row.name || "N/A",
          "Total Used": row.totalUsed || 0,
          "Current Stock": row.currentStock || 0,
        }));
        
        sheetName = "Inventory Report";
        filename = `inventory-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      }

      // Create worksheet and workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Auto-size columns (optional)
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.min(Math.max(key.length, 15), maxWidth)
      }));
      ws['!cols'] = colWidths;

      // Export to Excel
      XLSX.writeFile(wb, filename);
      
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Error exporting report: " + error.message);
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

  // Helper function to check if data is empty
  const isEmptyData = () => {
    const dataArray = getDataArray();
    return dataArray.length === 0;
  };

  // Helper function to get colSpan for no data message
  const getNoDataColSpan = () => {
    if (reportType === "booking") return "13";
    if (reportType === "sales") return "6";
    return "3";
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
            </select>
          </div>

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
              disabled={!reportData || exporting || loading}
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
                  {getDataArray().length}
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
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Booking ID</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Booking Reference</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Guest Name</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Contact No.</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Pool/Villa Name</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Amount</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Payment Status</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Booking Date</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Time Slot</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>No. of Guests</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Total Paid</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Balance</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Status</th>
                    </>
                  )}
                  {reportType === "sales" && (
                    <>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Booking ID</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Reference Code</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Location</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Guest Name</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Amount</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Date</th>
                    </>
                  )}
                  {reportType === "inventory" && (
                    <>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Item Name</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Total Used</th>
                      <th style={{ color: '#000000', backgroundColor: '#f3f4f6' }}>Current Stock</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isEmptyData() ? (
                  <tr>
                    <td colSpan={getNoDataColSpan()} className="no-data">
                      {reportType === "sales" 
                        ? "No sales data available for the selected date range"
                        : "No data available for the selected date range"}
                    </td>
                  </tr>
                ) : (
                  getDataArray().map((row, idx) => {
                    return (
                      <tr key={idx}>
                        {reportType === "booking" && (
                          <>
                            <td><strong>{row.bookingNumber || "N/A"}</strong></td>
                            <td><strong>{row.bookingReference || "N/A"}</strong></td>
                            <td>{row.customerName || "N/A"}</td>
                            <td>{row.customerContact || "N/A"}</td>
                            <td>{row.oasis || "N/A"}</td>
                            <td className="amount">{formatCurrency(row.totalAmount || 0)}</td>
                            <td>
                              <span className={`status-badge status-${(row.paymentStatus || "pending").toLowerCase()}`}>
                                {row.paymentStatus || "Pending"}
                              </span>
                            </td>
                            <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}</td>
                            <td>{row.session || "N/A"}</td>
                            <td>{row.pax || 0}</td>
                            <td className="amount">
                              {formatCurrency(
                                row.paymentType === "fullpayment"
                                  ? row.totalAmount || 0
                                  : row.downpayment || 0
                              )}
                            </td>
                            <td className="amount">
                              {formatCurrency(
                                row.paymentType === "fullpayment"
                                  ? 0
                                  : (row.totalAmount || 0) - (row.downpayment || 0)
                              )}
                            </td>
                            <td>
                              <span className={`status-badge status-${(row.status || "pending").toLowerCase()}`}>
                                {row.status || "Pending"}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === "sales" && (
                          <>
                            <td className="booking-id"><strong>{row.bookingNumber || row.booking?.bookingNumber || "N/A"}</strong></td>
                            <td className="reference-code"><strong>{row.referenceCode || row.booking?.bookingReference || row.bookingReference || "N/A"}</strong></td>
                            <td className="location">{row.location || row.booking?.oasis || "N/A"}</td>
                            <td>{row.booking?.customerName || row.customerName || row.guestName || "N/A"}</td>
                            <td className="amount">{formatCurrency(row.amount || row.totalAmount || 0)}</td>
                            <td>{row.date ? new Date(row.date).toLocaleDateString() : "N/A"}</td>
                          </>
                        )}
                        {reportType === "inventory" && (
                          <>
                            <td>{row.item || row.name || "N/A"}</td>
                            <td>{row.totalUsed || 0}</td>
                            <td>{row.currentStock || 0}</td>
                          </>
                        )}
                      </tr>
                    );
                  })
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