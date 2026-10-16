// frontend/src/components/admin/SalesChart.jsx
// ============================================
// SALES CHART - Interactive charts for sales dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import * as adminApi from '../../services/admin';
import './SalesChart.css';

const SalesChart = () => {
  const [chartType, setChartType] = useState('mixed');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bookings, setBookings] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: Math.max(0, currentYear - 2015) + 1 }, (_, index) => currentYear - index);
  const bookingsForYear = bookings.filter(booking =>
    new Date(booking.bookingDate).getFullYear() === selectedYear
  );
  const walkInBookings = bookingsForYear.filter(booking => booking.bookingSource === 'Walk-in').length;
  const onlineBookings = bookingsForYear.filter(booking => booking.bookingSource === 'Online').length;
  const unclassifiedBookings = bookingsForYear.filter(booking => !booking.bookingSource).length;

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setBookings(await adminApi.getAllBookings());
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    const eligibleBookings = bookings.filter(booking =>
      booking.status === 'Confirmed' || booking.status === 'Completed'
    );
    const last7Days = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayBookings = eligibleBookings.filter(booking =>
        new Date(booking.bookingDate).toDateString() === date.toDateString()
      );

      last7Days.push({
        date: days[date.getDay()],
        sales: dayBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        bookings: dayBookings.length
      });
    }
    setWeeklyData(last7Days);

    const monthlySales = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthName = new Date(selectedYear, monthIndex, 1)
        .toLocaleDateString('en-US', { month: 'short' });
      const monthTotal = eligibleBookings
        .filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === selectedYear;
        })
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      return { month: monthName, sales: monthTotal, target: 100000 };
    });
    setMonthlyData(monthlySales);
  }, [bookings, selectedYear]);

  // Custom tooltip for professional look
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-header">{payload[0].payload.date || payload[0].payload.month}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ₱{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sales-chart-container">
      {/* Section Header */}
      <div className="chart-section-header">
        <div>
          <h2>Sales Analytics & Performance</h2>
          <p>Weekly trends and monthly performance by selected year</p>
        </div>
        <div className="chart-header-controls">
          <label className="chart-year-filter">
            Year
            <select value={selectedYear} onChange={event => setSelectedYear(Number(event.target.value))}>
              {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <div className="chart-toggles">
            <button
              className={`toggle-btn ${chartType === 'mixed' ? 'active' : ''}`}
              onClick={() => setChartType('mixed')}
            >
              <i className="fas fa-chart-line"></i> All Charts
            </button>
            <button
              className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              <i className="fas fa-line-chart"></i> Line
            </button>
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              <i className="fas fa-bar-chart"></i> Bar
            </button>
          </div>
        </div>
      </div>

      <div className="booking-source-summary">
        <div className="booking-source-card">
          <span>Walk-in Bookings</span>
          <strong>{walkInBookings}</strong>
          <small>{selectedYear}</small>
        </div>
        <div className="booking-source-card">
          <span>Online Bookings</span>
          <strong>{onlineBookings}</strong>
          <small>{selectedYear}</small>
        </div>
        {unclassifiedBookings > 0 && (
          <div className="booking-source-card unclassified">
            <span>Source Not Recorded</span>
            <strong>{unclassifiedBookings}</strong>
            <small>Older bookings</small>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Loading sales data...</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="charts-grid">
        {/* Left Side - Line Chart (Daily Sales for the Week) */}
        {(chartType === 'mixed' || chartType === 'line') && (
          <div className="chart-card line-chart-card">
            <div className="chart-header">
              <h3>
                <i className="fas fa-chart-line"></i>
                Weekly Sales Trend
              </h3>
              <span className="chart-badge">Daily Sales</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#0066cc"
                    strokeWidth={3}
                    dot={{ fill: '#0066cc', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Daily Sales"
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Weekly Total</span>
                <span className="stat-value">₱{weeklyData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Daily Average</span>
                <span className="stat-value">₱{Math.round(weeklyData.reduce((sum, d) => sum + d.sales, 0) / weeklyData.length).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Peak Day</span>
                <span className="stat-value">
                  {weeklyData.length > 0
                    ? `${weeklyData.reduce((a, b) => a.sales > b.sales ? a : b).date} - ₱${(weeklyData.reduce((a, b) => a.sales > b.sales ? a : b).sales / 1000).toFixed(0)}k`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Bar Chart (Monthly Sales Performance) */}
        {(chartType === 'mixed' || chartType === 'bar') && (
          <div className="chart-card bar-chart-card">
            <div className="chart-header">
              <h3>
                <i className="fas fa-bar-chart"></i>
                Monthly Performance — {selectedYear}
              </h3>
              <span className="chart-badge">Revenue vs Target</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar dataKey="sales" fill="#0066cc" name="Actual Sales" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#b3d9ff" name="Target Sales" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Year Total</span>
                <span className="stat-value">₱{monthlyData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target Completion</span>
                <span className="stat-value">
                  {monthlyData.length > 0
                    ? `${Math.round((monthlyData.reduce((sum, d) => sum + d.sales, 0) / (monthlyData.length * 100000)) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Month</span>
                <span className="stat-value">
                  {monthlyData.length > 0
                    ? `${monthlyData.reduce((a, b) => a.sales > b.sales ? a : b).month} - ₱${(monthlyData.reduce((a, b) => a.sales > b.sales ? a : b).sales / 1000).toFixed(0)}k`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Trends Section */}
      <div className="booking-trends-card">
        <div className="chart-header">
          <h3>
            <i className="fas fa-calendar-check"></i>
            Booking Trends
          </h3>
          <span className="chart-badge">Current Week</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={weeklyData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                dataKey="date"
                type="category"
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Bar dataKey="bookings" fill="#00c49f" name="Bookings" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default SalesChart;
