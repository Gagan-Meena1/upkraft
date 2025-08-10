import React from "react";
import { StarRating } from "./StarRating";

const stats = [
  { label: "Rhythm", value: 6.2 },
  { label: "Theoretical Understanding", value: 4.6 },
  { label: "Ear Training", value: 3.2 },
  { label: "Performance", value: 5.6 },
  { label: "Assignment Completion", value: 4.2 },
  { label: "Technique", value: 6.8 },
];

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between mb-2 w-full gap-6">
        <div className="flex flex-col gap-3 w-full">
          <span className="text-sm font-medium text-[#212121]">{label}</span>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${(value / 10) * 100}%` }}
            ></div>
          </div>
        </div>
        <span className="text-xl font-bold text-[#6E09BD]">
          {value}/
          <span className="text-sm font-semibold text-[#505050]">10</span>
        </span>
      </div>
    </div>
  );
};

export default function PerformanceOverview() {
  const overall = 7.6;
  const stars = 2;

  return (
    <div className=" mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-8 items-center justify-around">
        <h3 className="text-xl font-semibold text-[#212121]">
          Overall Course Performance
        </h3>
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl font-bold text-[#6E09BD]">
            {overall}
            <span className="text-2xl font-semibold text-[#505050]">/10</span>
          </div>
          <StarRating rating={stars} />
        </div>
        <p className="text-[16px] text-[#505050] text-wrap text-center">
          This performance score is based on 6 evaluated classes.
        </p>
      </div>

      {/* Other Stats */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} />
        ))}
      </div>
    </div>
  );
}
