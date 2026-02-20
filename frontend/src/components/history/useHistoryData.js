import { useState, useEffect, useMemo } from "react";
import { getHistory } from "../../services/api";

export function useHistoryData(dateFilter, refreshTrigger = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const filterByDate = (data, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    switch (filter) {
      case "today":
        return data.filter((item) => new Date(item.originalTimestamp) >= today);
      case "yesterday":
        return data.filter(
          (item) =>
            new Date(item.originalTimestamp) >= yesterday &&
            new Date(item.originalTimestamp) < today
        );
      case "week":
        return data.filter((item) => new Date(item.originalTimestamp) >= weekAgo);
      default:
        return data;
    }
  };

  const getDateRangeText = () => {
    switch (dateFilter) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "Last 7 Days";
      default:
        return "Today";
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await getHistory();

        if (!mounted) return;

        const formatted = rawData.map((item) => ({
          ...item,
          originalTimestamp: new Date(item.timestamp),
          displayTime: new Date(item.timestamp).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        }));

        const filtered = filterByDate(formatted, dateFilter);
        filtered.sort((a, b) => b.originalTimestamp - a.originalTimestamp);

        setCount(filtered.length);
        setData(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [dateFilter, refreshTrigger]);

  // ✅ Stable reference — prevents chart re-renders
  const stableData = useMemo(() => data, [data]);

  return {
    data: stableData,
    loading,
    isEmpty: data.length === 0,
    count,
    dateRangeText: getDateRangeText(),
  };
}