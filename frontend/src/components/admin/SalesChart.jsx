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
  const [period, setPeriod] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: Math.max(0, currentYear - 2015) + 1 }, (_, index) => currentYear - index);
  const selectedDateValue = new Date(`${selectedDate}T00:00:00`);
  const selectedYear = selectedDateValue.getFullYear();
  const selectedMonthIndex = selectedDateValue.getMonth();
  const selectedMonth = selectedDate.slice(0, 7);
  const weekStart = new Date(`${selectedDate}T00:00:00`);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const periodTitle = period === 'weekly'
    ? `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : period === 'monthly'
      ? selectedDateValue.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `Year ${selectedYear}`;

  const periodData = React.useMemo(() => {
    const eligibleBookings = bookings.filter(booking =>
      booking.status === 'Confirmed' || booking.status === 'Completed'
    );
    let startDate;
    let pointCount;
    let getPointDate;

    if (period === 'weekly') {
      startDate = new Date(`${selectedDate}T00:00:00`);
      startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
      pointCount = 7;
      getPointDate = (index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        return date;
      };
    } else if (period === 'monthly') {
      startDate = new Date(selectedYear, selectedMonthIndex, 1);
      pointCount = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
      getPointDate = (index) => new Date(selectedYear, selectedMonthIndex, index + 1);
    } else {
      startDate = new Date(selectedYear, 0, 1);
      pointCount = 12;
      getPointDate = (index) => new Date(selectedYear, index, 1);
    }

    const points = Array.from({ length: pointCount }, (_, index) => {
      const date = getPointDate(index);
      const nextDate = period === 'yearly'
        ? new Date(selectedYear, index + 1, 1)
        : new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      const pointBookings = eligibleBookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= date && bookingDate < nextDate;
      });
      const label = period === 'yearly'
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : period === 'monthly'
          ? String(date.getDate())
          : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

      return {
        label,
        sales: pointBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        bookings: pointBookings.length,
      };
    });
    const rangeEnd = period === 'weekly'
      ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 7)
      : period === 'monthly'
        ? new Date(selectedYear, selectedMonthIndex + 1, 1)
        : new Date(selectedYear + 1, 0, 1);
    const filteredBookings = eligibleBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startDate && bookingDate < rangeEnd;
    });

    return { points, filteredBookings };
  }, [bookings, period, selectedDate, selectedMonthIndex, selectedYear]);

  const totalSales = periodData.points.reduce((sum, point) => sum + point.sales, 0);
  const averageSales = periodData.points.length
    ? Math.round(totalSales / periodData.points.length)
    : 0;
  const peakPeriod = periodData.points.reduce(
    (peak, point) => point.sales > peak.sales ? point : peak,
    { label: 'N/A', sales: 0 },
  );
  const busiestPeriod = periodData.points.reduce(
    (busiest, point) => point.bookings > busiest.bookings ? point : busiest,
    { label: 'N/A', bookings: 0 },
  );
  const walkInBookings = periodData.filteredBookings.filter(booking => booking.bookingSource === 'Walk-in').length;
  const onlineBookings = periodData.filteredBookings.filter(booking => booking.bookingSource === 'Online').length;
  const unclassifiedBookings = periodData.filteredBookings.filter(booking => !booking.bookingSource).length;

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

  // Custom tooltip for professional look
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-header">{payload[0].payload.label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Sales' ? `₱${entry.value?.toLocaleString()}` : entry.value}
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
          <p>Sales and booking statistics by week, month, or year</p>
        </div>
        <div className="chart-header-controls">
          <label className="chart-year-filter">
            Statistics
            <select value={period} onChange={event => setPeriod(event.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          {period === 'weekly' && (
            <label className="chart-year-filter">
              Week of
              <input
                type="date"
                value={selectedDate}
                onChange={event => event.target.value && setSelectedDate(event.target.value)}
              />
            </label>
          )}
          {period === 'monthly' && (
            <label className="chart-year-filter">
              Month
              <input
                type="month"
                value={selectedMonth}
                onChange={event => event.target.value && setSelectedDate(`${event.target.value}-01`)}
              />
            </label>
          )}
          {period === 'yearly' && (
            <label className="chart-year-filter">
              Year
              <select
                value={selectedYear}
                onChange={event => setSelectedDate(`${event.target.value}-01-01`)}
              >
                {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          )}
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
          <small>{periodTitle}</small>
        </div>
        <div className="booking-source-card">
          <span>Online Bookings</span>
          <strong>{onlineBookings}</strong>
          <small>{periodTitle}</small>
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
        {/* Left Side - Sales trend */}
        {(chartType === 'mixed' || chartType === 'line') && (
          <div className="chart-card line-chart-card">
            <div className="chart-header">
              <h3>
                <i className="fas fa-chart-line"></i>
                {periodTitle} Sales Trend
              </h3>
              <span className="chart-badge">Sales by {period === 'yearly' ? 'Month' : 'Day'}</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={periodData.points} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="label"
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
                    name="Sales"
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">{periodTitle} Total</span>
                <span className="stat-value">₱{totalSales.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average per {period === 'yearly' ? 'Month' : 'Day'}</span>
                <span className="stat-value">₱{averageSales.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Peak {period === 'yearly' ? 'Month' : 'Day'}</span>
                <span className="stat-value">
                  {periodData.points.length > 0
                    ? `${peakPeriod.label} - ₱${peakPeriod.sales.toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Sales and booking counts */}
        {(chartType === 'mixed' || chartType === 'bar') && (
          <div className="chart-card bar-chart-card">
            <div className="chart-header">
              <h3>
                <i className="fas fa-bar-chart"></i>
                {periodTitle} Statistics
              </h3>
              <span className="chart-badge">Sales & Bookings</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={periodData.points} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar dataKey="bookings" fill="#00c49f" name="Bookings" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Bookings</span>
                <span className="stat-value">{periodData.filteredBookings.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average per {period === 'yearly' ? 'Month' : 'Day'}</span>
                <span className="stat-value">
                  {periodData.points.length
                    ? (periodData.filteredBookings.length / periodData.points.length).toFixed(1)
                    : '0'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best {period === 'yearly' ? 'Month' : 'Day'}</span>
                <span className="stat-value">
                  {periodData.points.length > 0
                    ? `${busiestPeriod.label} - ${busiestPeriod.bookings} bookings`
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
          <span className="chart-badge">{periodTitle}</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={periodData.points}
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
                dataKey="label"
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
