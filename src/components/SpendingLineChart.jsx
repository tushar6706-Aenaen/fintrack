// src/components/SpendingLineChart.jsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function SpendingLineChart({ data = [] }) {
  // data expected: [{ date: '08-01', total: 120 }, ...]
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <h3 className="text-lg font-semibold mb-3">Monthly Trend</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#0b1220", border: "none" }} />
            <Line type="monotone" dataKey="total" stroke="#34d399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
