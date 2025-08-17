// src/components/StatCard.jsx
import React from "react";

export default function StatCard({ title, value, hint, icon }) {
  return (
    <div className="bg-zinc-800 rounded-2xl p-4 shadow border border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
        </div>
        {icon && <div className="text-zinc-400">{icon}</div>}
      </div>
    </div>
  );
}
