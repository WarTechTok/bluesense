import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PHChart = React.memo(
  ({ data }) => {
    console.log("📊 PHChart rendered", data?.length);

    return (
      <div
        style={{
          backgroundColor: "#EFF6FF",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              interval={Math.floor(data?.length / 4) || 2}
              angle={-15}
              height={50}
            />
            <YAxis domain={[6, 9]} width={35} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  },
  (prev, next) => {
    if (prev.data.length !== next.data.length) return false;
    for (let i = 0; i < prev.data.length; i++) {
      const a = prev.data[i];
      const b = next.data[i];
      if (a?.ph !== b?.ph || a?.displayTime !== b?.displayTime) return false;
    }
    return true;
  }
);

export default PHChart;