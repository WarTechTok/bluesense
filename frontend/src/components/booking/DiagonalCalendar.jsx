// frontend/src/components/booking/DiagonalCalendar.jsx
import React, { useState, useEffect } from "react";
import "./DiagonalCalendar.css";

// Get API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function DiagonalCalendar({
  selectedDate,
  onDateChange,
  oasis,
  packageName,
  minDate,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  // showOwnBookingModal removed - no longer needed

  // Helper to convert date to YYYY-MM-DD using local date (not UTC/ISO)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get logged-in user email
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = loggedInUser.email || "";

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!oasis || !packageName) {
        console.log("⚠️ Missing oasis or packageName for booked dates");
        return;
      }

      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/bookings/booked-dates?oasis=${encodeURIComponent(oasis)}&package=${encodeURIComponent(packageName)}&email=${encodeURIComponent(currentUserEmail)}`;

        console.log("📅 Fetching booked dates from:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("📅 Booked dates response:", data);

        if (data.success && data.bookedDates) {
          console.log("✅ Booked dates loaded:", data.bookedDates);
          setBookedDates(data.bookedDates);
        } else {
          console.warn("⚠️ Invalid response format:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching booked dates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedDates();
  }, [oasis, packageName, currentUserEmail]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    const prev = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
    );
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const next = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
    );
    if (next <= maxDate) {
      setCurrentMonth(next);
    }
  };

  const isDateDisabled = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    date.setHours(0, 0, 0, 0);

    // Get min allowed date (from prop or default to tomorrow)
    const minAllowedDate =
      minDate ||
      (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      })();
    minAllowedDate.setHours(0, 0, 0, 0);

    // Disable dates before minAllowedDate
    if (date < minAllowedDate) return true;

    // Disable dates beyond 3 months
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(0, 0, 0, 0);
    if (date > maxDate) return true;

    return false;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    clickedDate.setHours(0, 0, 0, 0);

    // Get min allowed date
    const minAllowedDate =
      minDate ||
      (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      })();
    minAllowedDate.setHours(0, 0, 0, 0);

    // Check if date is before min allowed date
    if (clickedDate < minAllowedDate) {
      return;
    }

    // Check if date is beyond 3 months
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(0, 0, 0, 0);
    if (clickedDate > maxDate) {
      return;
    }

    const dateStr = getLocalDateString(clickedDate);
    const status = bookedDates[dateStr];

    // USER BOOKING CHECK - REMOVED per client request
    // Customers can now book multiple times on the same date

    // Check if date is fully booked (Day and Night both booked by others)
    if (status && status.Day?.booked && status.Night?.booked) {
      setShowDuplicateModal(true);
      return;
    }

    // Only select date if available
    onDateChange(clickedDate);
  };

  const getDateStatus = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const dateStr = getLocalDateString(date);
    const status = bookedDates[dateStr] || null;

    if (status) {
      console.log(
        `📍 ${dateStr}: Day=${status.Day?.booked ? "❌ Booked" : "✅ Available"}, Night=${status.Night?.booked ? "❌ Booked" : "✅ Available"}`,
      );
    }

    return status;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentMonth.getFullYear() &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDateStatus(day);
    const disabled = isDateDisabled(day);
    const selected = isDateSelected(day);
    const hasBooked =
      status &&
      (status.Day?.booked || status.Night?.booked || status["22hrs"]?.booked);

    days.push(
      <div
        key={day}
        className={`calendar-day ${disabled ? "disabled" : ""} ${selected ? "selected" : ""} ${hasBooked ? "has-booked" : ""}`}
        onClick={() => !disabled && handleDateClick(day)}
      >
        <div className="day-number">{day}</div>

        {status && (
          <svg
            className="diagonal-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke="#e8e8e8"
              strokeWidth="1"
              opacity="0.4"
            />

            <circle
              cx="25"
              cy="50"
              r="7"
              className={`session-indicator ${status.Day?.booked ? "booked" : "available"}`}
              fill={
                !status.Day?.booked
                  ? "#10b981"
                  : status.Day?.status === "confirmed"
                    ? "#dc2626"
                    : status.Day?.status === "pending"
                      ? "#f59e0b"
                      : "#dc2626"
              }
              opacity="1"
            />

            <circle
              cx="75"
              cy="50"
              r="7"
              className={`session-indicator ${status.Night?.booked ? "booked" : "available"}`}
              fill={
                !status.Night?.booked
                  ? "#10b981"
                  : status.Night?.status === "confirmed"
                    ? "#dc2626"
                    : status.Night?.status === "pending"
                      ? "#f59e0b"
                      : "#dc2626"
              }
              opacity="1"
            />
          </svg>
        )}

        {!status && !disabled && (
          <svg
            className="diagonal-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
            <circle cx="25" cy="50" r="6" fill="#10b981" />
            <circle cx="75" cy="50" r="6" fill="#10b981" />
          </svg>
        )}
      </div>,
    );
  }

  return (
    <div className="diagonal-calendar">
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={handlePrevMonth}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3 className="month-title">{monthName}</h3>
        <button className="month-nav-btn" onClick={handleNextMonth}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-info">
        <div className="info-item">
          <span className="label">Left (Day)</span>
          <span className="badge">8AM - 5PM</span>
        </div>
        <div className="info-item">
          <span className="label">Right (Night)</span>
          <span className="badge">6PM - 6AM</span>
        </div>
      </div>

      <div className="legend">
        <span>
          <span className="legend-mark available"></span> Available
        </span>
        <span>
          <span className="legend-mark booked"></span> Booked
        </span>
      </div>

      <div className="weekday-headers">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>

      <div className="calendar-grid">{days}</div>

      {loading && (
        <div className="calendar-loading">Loading availability...</div>
      )}

      {/* Date Fully Booked Modal */}
      {showDuplicateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <i
                  className="fas fa-calendar-times"
                  style={{ color: "#dc2626", fontSize: "28px" }}
                ></i>
              </div>

              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#1e293b",
                }}
              >
                Date Fully Booked
              </h2>

              <p
                style={{
                  color: "#475569",
                  marginBottom: "8px",
                  lineHeight: "1.5",
                }}
              >
                This date is already fully booked.
              </p>

              <p
                style={{
                  color: "#475569",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                Please choose another date for your reservation.
              </p>
            </div>

            <div
              style={{
                padding: "16px 24px 24px",
                display: "flex",
                justifyContent: "center",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  padding: "10px 24px",
                  background: "#0284c7",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                <i className="fas fa-check"></i> OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagonalCalendar;