// frontend/src/utils/excelExport.js
// ============================================
// EXCEL EXPORT - Download reports as Excel files
// ============================================

/**
 * Export data to Excel using dynamic sheet creation
 * @param {Array} data - Array of objects to export
 * @param {string} reportType - Type of report (reservation, sales, inventory, staff)
 * @param {string} fileName - Name of the file
 */
export const exportToExcel = (data, reportType, fileName) => {
  try {
    // Define columns based on report type
    let columns = [];

    if (reportType === 'reservation') {
      columns = ['Guest Name', 'Email', 'Check-In', 'Check-Out', 'Status'];
    } else if (reportType === 'sales') {
      columns = ['Booking ID', 'Guest Name', 'Amount', 'Date'];
    } else if (reportType === 'inventory') {
      columns = ['Item Name', 'Total Used', 'Current Stock'];
    } else if (reportType === 'staff') {
      columns = ['Staff Name', 'Role', 'Status', 'Activity'];
    }

    // Prepare CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += columns.join(',') + '\r\n';

    // Add data rows
    data.forEach(row => {
      let rowData = [];

      if (reportType === 'reservation') {
        rowData = [
          row.guestName || row.customerName || 'N/A',
          row.guestEmail || row.customerEmail || 'N/A',
          row.checkIn ? new Date(row.checkIn).toLocaleDateString() : 'N/A',
          row.checkOut ? new Date(row.checkOut).toLocaleDateString() : 'N/A',
          row.status || 'Pending'
        ];
      } else if (reportType === 'sales') {
        rowData = [
          row.booking?.bookingReference || (row.booking?._id ? row.booking._id.slice(-6).toUpperCase() : row._id || 'N/A'),
          row.booking?.customerName || row.customerName || row.guestName || 'N/A',
          row.amount || row.downpayment || 0,
          new Date(row.date || row.createdAt).toLocaleDateString()
        ];
      } else if (reportType === 'inventory') {
        rowData = [
          row.item || row.name || 'N/A',
          row.totalUsed || 0,
          row.currentStock || 0
        ];
      } else if (reportType === 'staff') {
        rowData = [
          row.name || 'N/A',
          row.role || 'Staff',
          row.status || 'Active',
          row.activityCount || 0
        ];
      }

      // Escape quotes and join
      csvContent += rowData.map(item => {
        const itemStr = String(item).replace(/"/g, '""');
        return `"${itemStr}"`;
      }).join(',') + '\r\n';
    });

    // Create blob and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export with summary (for sales reports)
 */
export const exportToExcelWithSummary = (data, summary, reportType, fileName) => {
  try {
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Add summary section
    if (summary) {
      csvContent += 'REPORT SUMMARY\r\n';
      if (summary.totalSales !== undefined) {
        csvContent += `Total Sales,₱${summary.totalSales.toLocaleString()}\r\n`;
      }
      if (summary.transactionCount !== undefined) {
        csvContent += `Total Transactions,${summary.transactionCount}\r\n`;
      }
      csvContent += '\r\n';
    }

    // Add headers
    const columns = reportType === 'sales' 
      ? ['Booking ID', 'Guest Name', 'Amount', 'Date']
      : ['Data'];
    
    csvContent += columns.join(',') + '\r\n';

    // Add data rows
    if (Array.isArray(data)) {
      data.forEach(row => {
        let rowData = [];
        if (reportType === 'sales') {
          rowData = [
            row.booking?.bookingReference || (row.booking?._id ? row.booking._id.slice(-6).toUpperCase() : row._id || 'N/A'),
            row.booking?.customerName || row.customerName || row.guestName || 'N/A',
            row.amount || row.downpayment || 0,
            new Date(row.date || row.createdAt).toLocaleDateString()
          ];
        }
        csvContent += rowData.map(item => {
          const itemStr = String(item).replace(/"/g, '""');
          return `"${itemStr}"`;
        }).join(',') + '\r\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export as JSON (alternative format)
 */
export const exportToJSON = (data, reportType, fileName) => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
};
