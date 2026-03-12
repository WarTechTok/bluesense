// ============================================
// EXCEL EXPORT UTILITY
// ============================================
// Generates formatted Excel spreadsheets using ExcelJS
// Requires: npm install exceljs
// Includes styled header row with blue background
// Auto-adjusts column widths for data readability
// Auto-creates /reports directory if missing

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// ============================================
// GENERATE EXCEL REPORT
// ============================================
// Creates formatted Excel spreadsheet from data
// Params: data (array), reportType (string), columns (array), filename (string)
// Returns: Promise with filepath to generated Excel file
// Styles: Bold white text on blue header background
// Dynamic: Auto-adjusts column widths based on content
exports.generateExcelReport = async (data, reportType, columns, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    // Add header
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data
    if (Array.isArray(data)) {
      data.forEach(row => {
        worksheet.addRow(row);
      });
    }

    // Auto-adjust column width
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength + 2;
    });

    // Save file
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const filepath = path.join(reportsDir, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filepath);

    return filepath;
  } catch (error) {
    throw error;
  }
};
