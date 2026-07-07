// ============================================
// EXPORT UTILITY - EXCEL & PDF
// ============================================
// Generates formatted Excel spreadsheets or PDF reports
// Requires: npm install exceljs pdfkit
// Features:
// - Center-aligned content with proper capitalization
// - Auto-fit columns with minimum width
// - Styled header row (blue background, white bold text)
// - Professional PDF export option
// - Auto-creates /reports directory if missing

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ============================================
// UTILITY FUNCTION - CAPITALIZE TEXT
// ============================================
// Converts text to Title Case with proper formatting
const capitalizeHeader = (text) => {
  return String(text)
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// GENERATE EXCEL REPORT
// ============================================
// Creates formatted Excel spreadsheet from data
// Params: data (array), reportType (string), columns (array), filename (string)
// Returns: Promise with filepath to generated Excel file
// Features: Centered cells, auto-fit columns, proper capitalization
exports.generateExcelReport = async (data, reportType, columns, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    // Format and add header with capitalization
    const formattedColumns = columns.map(col => ({
      header: capitalizeHeader(col.header || col.key),
      key: col.key,
      width: col.width || 15
    }));

    worksheet.columns = formattedColumns;

    // Style header row - bold white text on blue background, centered
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

    // Add data and center align all cells
    if (Array.isArray(data)) {
      data.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
      });
    }

    // Auto-adjust column widths based on content
    worksheet.columns.forEach(column => {
      let maxLength = column.header ? column.header.toString().length : 0;
      
      column.eachCell?.({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      
      // Set width with minimum of 12 and maximum padding
      column.width = Math.min(Math.max(maxLength + 3, 12), 50);
    });

    // Set row height for better appearance
    worksheet.getRow(1).height = 25;

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

// ============================================
// GENERATE PDF REPORT
// ============================================
// Creates professional PDF report from data
// Params: data (array), reportType (string), columns (array), filename (string)
// Returns: Promise with filepath to generated PDF file
// Features: Professional table layout, centered text, proper headers
exports.generatePDFReport = async (data, reportType, columns, filename) => {
  try {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const filepath = path.join(reportsDir, `${filename}.pdf`);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          bufferPages: true,
          size: 'A4',
          margin: 30
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text(capitalizeHeader(reportType), { align: 'center' });
        doc.moveDown(0.5);

        // Table data
        if (Array.isArray(data) && data.length > 0) {
          // Table settings
          const pageWidth = doc.page.width - 60;
          const colWidth = pageWidth / columns.length;
          const rowHeight = 20;
          const headerHeight = 25;

          // Draw header
          doc.fontSize(10).font('Helvetica-Bold');
          doc.fillColor('#FFFFFF').rect(30, doc.y, pageWidth, headerHeight).fill('#4472C4');
          
          let x = 30;
          columns.forEach(col => {
            const header = capitalizeHeader(col.header || col.key);
            doc.fillColor('#FFFFFF').text(header, x + 5, doc.y - headerHeight + 5, {
              width: colWidth - 10,
              align: 'center',
              height: headerHeight
            });
            x += colWidth;
          });

          doc.moveDown(headerHeight / 12);

          // Draw data rows
          doc.fontSize(9).font('Helvetica').fillColor('#000000');
          data.forEach((rowData, idx) => {
            const yPosition = doc.y;
            x = 30;

            columns.forEach(col => {
              const cellValue = String(rowData[col.key] || '');
              doc.rect(x, yPosition, colWidth, rowHeight).stroke();
              doc.text(cellValue, x + 5, yPosition + 3, {
                width: colWidth - 10,
                align: 'center',
                height: rowHeight
              });
              x += colWidth;
            });

            doc.y = yPosition + rowHeight;

            // Add new page if content goes beyond current page
            if (doc.y > doc.page.height - 50) {
              doc.addPage();
            }
          });
        }

        // Footer
        doc.fontSize(8).fillColor('#666666').text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          { align: 'center', margin: 0 }
        );

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    throw error;
  }
};

// ============================================
// GENERATE REPORT (Auto-detect format)
// ============================================
// Automatically generates Excel or PDF based on format parameter
// Params: data (array), reportType (string), columns (array), filename (string), format (string: 'excel' or 'pdf')
// Returns: Promise with filepath to generated file
exports.generateReport = async (data, reportType, columns, filename, format = 'excel') => {
  const exportFormat = String(format).toLowerCase();
  
  if (exportFormat === 'pdf') {
    return exports.generatePDFReport(data, reportType, columns, filename);
  } else {
    return exports.generateExcelReport(data, reportType, columns, filename);
  }
};
