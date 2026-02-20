import React from "react";

const TurbidityList = React.memo(
  ({ data }) => {
    console.log("📋 TurbidityList rendered", data?.length);

    const getStyle = (turbidity) => {
      if (turbidity === "Clear")
        return {
          bg: "#F0FDF4",
          border: "#86EFAC",
          badge: "#059669",
          badgeBg: "#D1FAE5",
          icon: "✅",
          text: "Clear",
        };
      if (turbidity === "Cloudy")
        return {
          bg: "#FFFBEB",
          border: "#FCD34D",
          badge: "#B45309",
          badgeBg: "#FEF3C7",
          icon: "🟡",
          text: "Cloudy",
        };
      if (turbidity === "Dirty")
        return {
          bg: "#FEF2F2",
          border: "#FCA5A5",
          badge: "#B91C1C",
          badgeBg: "#FEE2E2",
          icon: "🔴",
          text: "Dirty",
        };
      return {
        bg: "#F9FAFB",
        border: "#E5E7EB",
        badge: "#6B7280",
        badgeBg: "#F3F4F6",
        icon: "⚪",
        text: "Unknown",
      };
    };

    if (!data?.length) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
          📭 No turbidity data
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((item, idx) => {
          const style = getStyle(item.turbidity);
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                backgroundColor: style.bg,
                borderRadius: "12px",
                border: `1px solid ${style.border}`,
                transition: "all 0.2s ease",
              }}
            >
              <span>{item.displayTime}</span>
              <span
                style={{
                  backgroundColor: style.badgeBg,
                  color: style.badge,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                {style.icon} {style.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
  (prev, next) => {
    if (prev.data.length !== next.data.length) return false;
    for (let i = 0; i < prev.data.length; i++) {
      const a = prev.data[i];
      const b = next.data[i];
      if (a?.turbidity !== b?.turbidity || a?.displayTime !== b?.displayTime)
        return false;
    }
    return true;
  }
);

export default TurbidityList;