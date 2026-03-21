// ============================================
// CHART DATA FORMATTING UTILITY
// ============================================
// Formats data arrays for Chart.js visualization
// Supports: Line charts, Bar charts, Pie charts
// Used for dashboard analytics and report visualizations

// ============================================
// FORMAT LINE CHART DATA
// ============================================
// Creates line chart dataset with gradient fill
// Params: data (array), labels (array), dataLabel (string)
// Returns: Chart.js compatible config object
exports.formatChartData = (data, labels, dataLabel) => {
  return {
    labels: labels,
    datasets: [
      {
        label: dataLabel,
        data: data,
        borderColor: '#4472C4',
        backgroundColor: 'rgba(68, 114, 196, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };
};

// ============================================
// FORMAT BAR CHART DATA
// ============================================
// Creates bar chart with 6-color palette
// Params: data (array), labels (array), dataLabel (string)
// Returns: Chart.js compatible config object
// Colors: Blue, Orange, Gray, Yellow, Light Blue, Green
exports.formatBarChartData = (data, labels, dataLabel) => {
  return {
    labels: labels,
    datasets: [
      {
        label: dataLabel,
        data: data,
        backgroundColor: [
          '#4472C4',
          '#ED7D31',
          '#A5A5A5',
          '#FFC000',
          '#5B9BD5',
          '#70AD47'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2
      }
    ]
  };
};

// ============================================
// FORMAT PIE CHART DATA
// ============================================
// Creates pie chart with 6-color palette for segments
// Params: data (array), labels (array)
// Returns: Chart.js compatible config object
// Colors: Blue, Orange, Gray, Yellow, Light Blue, Green
exports.formatPieChartData = (data, labels) => {
  return {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [
          '#4472C4',
          '#ED7D31',
          '#A5A5A5',
          '#FFC000',
          '#5B9BD5',
          '#70AD47'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2
      }
    ]
  };
};
