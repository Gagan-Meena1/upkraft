"use client";

import { TutorClassData } from "../types";

interface MonthlyClassBreakdownProps {
  tutor: TutorClassData | null;
}

export default function MonthlyClassBreakdown({
  tutor,
}: MonthlyClassBreakdownProps) {
  if (!tutor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#faf9ff]">
        <div className="text-center">
          <div className="text-4xl mb-3">👈</div>
          <div className="text-[13px] text-gray-500 font-medium">
            Select a tutor to view their monthly class breakdown
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Click on any tutor from the list
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#faf9ff] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">
              {tutor.username}
            </h2>
            <span className="text-[11px] text-gray-500">
              Monthly class breakdown
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-lg">
              <span className="text-[10px] font-medium block leading-tight">
                Total Classes
              </span>
              <span className="text-[18px] font-black leading-tight">
                {tutor.totalClasses}
              </span>
            </div>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-lg">
              <span className="text-[10px] font-medium block leading-tight">
                Price / Class / Student
              </span>
              <span className="text-[18px] font-black leading-tight">
                ₹{tutor.pricePerClassPerStudent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly cards */}
      <div className="p-5">
        {tutor.monthlyClasses.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-[12px] text-gray-500">
              No classes recorded for this tutor
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tutor.monthlyClasses.map((m) => (
              <div
                key={m.month}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-700">
                    {m.label}
                  </span>
                  <span className="text-[16px] font-black text-purple-700">
                    {m.count}
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 mt-1">
                  {m.count} class{m.count !== 1 ? "es" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}