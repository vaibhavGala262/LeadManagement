"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  NEW: "#3b82f6",
  CONTACTED: "#f59e0b",
  QUALIFIED: "#8b5cf6",
  CONVERTED: "#10b981",
  LOST: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

interface LeadDistribution {
  status: string;
  count: number;
}

interface LeadsChartProps {
  data: LeadDistribution[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-zinc-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
    color: COLORS[d.status as keyof typeof COLORS] || "#6b7280",
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e4e4e7",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="h-48 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
