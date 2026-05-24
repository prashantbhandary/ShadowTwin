"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const mockData = [
  { day: "Mon", threats: 2, scans: 8, alerts: 1 },
  { day: "Tue", threats: 5, scans: 12, alerts: 3 },
  { day: "Wed", threats: 3, scans: 6, alerts: 2 },
  { day: "Thu", threats: 8, scans: 15, alerts: 5 },
  { day: "Fri", threats: 4, scans: 10, alerts: 2 },
  { day: "Sat", threats: 1, scans: 4, alerts: 0 },
  { day: "Sun", threats: 6, scans: 11, alerts: 4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a1628] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 capitalize">{entry.name}:</span>
            <span className="text-white font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface ThreatChartProps {
  type?: "area" | "bar";
}

export function ThreatChart({ type = "area" }: ThreatChartProps) {
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={mockData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="threats" fill="#ef4444" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          <Bar dataKey="alerts" fill="#f97316" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          <Bar dataKey="scans" fill="#00f5ff" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={mockData}>
        <defs>
          <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="scans" stroke="#00f5ff" strokeWidth={2} fill="url(#scanGrad)" />
        <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#threatGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
