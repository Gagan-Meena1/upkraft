import React from "react";

export type ViewType = "day" | "week" | "month";

export default function CalendarViewToggle({
  active,
  onChange,
}: {
  active: ViewType;
  onChange: (v: ViewType) => void;
}) {
  const btn = (v: ViewType, label: string) => (
    <button
      onClick={() => onChange(v)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        active === v ? "bg-purple-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-2">
      {btn("day", "Day")}
      {btn("week", "Week")}
      {btn("month", "Month")}
    </div>
  );
}