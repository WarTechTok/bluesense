// ============================================
// PDF EXPORT UTILITY
// ============================================
// Generates downloadable PDF reports using PDFKit
// Requires: npm install pdfkit
// Creates formatted PDF with header and data rows
// Auto-creates /reports directory if missing

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================
// GENERATE PDF REPORT
// ============================================
// Creates formatted PDF document from data array
// Params: data (array/object), reportType (string), filename (string)
// Returns: Promise with filepath to generated PDF
// Auto-creates backend/reports directory if needed
exports.generatePDFReport = (data, reportType, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filepath = path.join(__dirname, `../reports/${filename}.pdf`);

      // Ensure reports directory exists
      if (!fs.existsSync(path.join(__dirname, '../reports'))) {
        fs.mkdirSync(path.join(__dirname, '../reports'));
      }

      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text(`${reportType} Report`, { align: 'center' });
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Content
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          doc.fontSize(10).text(`Item ${index + 1}: ${JSON.stringify(item)}`);
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(10).text(JSON.stringify(data, null, 2));
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
};
