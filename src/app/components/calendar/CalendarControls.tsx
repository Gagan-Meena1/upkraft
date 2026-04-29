"use client";

import React from "react";

type CalendarView = "day" | "week" | "month";

interface CalendarControlsProps {
  currentDate: Date;
  activeView: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSetView: (view: CalendarView) => void;
}

export default function CalendarControls({
  currentDate,
  activeView,
  onPrev,
  onNext,
  onToday,
  onSetView,
}: CalendarControlsProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4 text-[20px] text-[#212121]">
        <button
          onClick={onPrev}
          className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
        >
          {"<"}
        </button>
        <span className="font-medium text-[20px] text-[#212121]">
          {currentDate.toLocaleDateString("en-US", {
            day: "2-digit",
            weekday: "long",
            year: "numeric",
            month: "long",
          })}
        </span>
        <button
          onClick={onNext}
          className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded"
        >
          {">"}
        </button>
        <button onClick={onToday} className="ml-3 px-3 py-1 rounded bg-gray-100 text-sm">
          Today
        </button>
      </div>

      <div className="inline-flex items-center gap-2">
        {(["day", "week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onSetView(v)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeView === v
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
