// src/utils/helpers.js
// ============================================
// HELPERS - Reusable utility functions
// ============================================

// Format price to Philippine Peso
export const formatPrice = (amount) =>
  `₱${amount.toLocaleString("en-PH")}`;

// Check if a date is a weekend (Friday, Saturday, Sunday)
export const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 5 || day === 6; // 0=Sun, 5=Fri, 6=Sat
};

// Get required downpayment based on session
export const getDownpayment = (session) =>
  session === "22hrs" ? 5000 : 3000;

// Get package price based on session and date
export const getPackagePrice = (pkg, session, dateStr) => {
  if (!pkg || !session) return 0;
  if (pkg.id === "package-c") return null; // Special pricing
  const tier = isWeekend(dateStr) ? "weekend" : "weekday";
  return pkg.pricing[tier]?.[session] || 0;
};

// Get status badge colors
export const getStatusColor = (status) => {
  const map = {
    Pending:   { bg: "#FEF3C7", text: "#92400E" },
    Confirmed: { bg: "#D1FAE5", text: "#065F46" },
    Cancelled: { bg: "#FEE2E2", text: "#991B1B" },
    Completed: { bg: "#DBEAFE", text: "#1E40AF" },
    Paid:      { bg: "#D1FAE5", text: "#065F46" },
    Partial:   { bg: "#FEF3C7", text: "#92400E" },
  };
  return map[status] || { bg: "#F3F4F6", text: "#374151" };
};