"use client";

import { TutorClassData } from "../types";

interface TutorListPanelProps {
  tutors: TutorClassData[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  selectedTutorId: string | null;
  onSelectTutor: (id: string) => void;
}

export default function TutorListPanel({
  tutors,
  loading,
  error,
  search,
  onSearchChange,
  selectedTutorId,
  onSelectTutor,
}: TutorListPanelProps) {
  return (
    <div className="w-[320px] min-w-[280px] bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Search header */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tutor..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-purple-400 focus:bg-white transition-all"
          />
        </div>
        <div className="text-[10px] text-gray-400 mt-1.5 px-1">
          {loading ? "Loading..." : `${tutors.length} tutor${tutors.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Tutor list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <div className="text-[11px] text-gray-400 mt-2">Loading tutors…</div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 m-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && tutors.length === 0 && (
          <div className="p-6 text-center text-[11px] text-gray-400">
            No tutors found
          </div>
        )}

        {!loading &&
          !error &&
          tutors.map((tutor) => (
            <button
              key={tutor._id}
              onClick={() => onSelectTutor(tutor._id)}
              className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-all hover:bg-purple-50 cursor-pointer ${
                selectedTutorId === tutor._id
                  ? "bg-purple-50 border-l-[3px] border-l-purple-600"
                  : "border-l-[3px] border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div
                    className={`text-[12px] font-semibold truncate ${
                      selectedTutorId === tutor._id
                        ? "text-purple-700"
                        : "text-gray-800"
                    }`}
                  >
                    {tutor.username}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tutor.totalClasses > 0
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tutor.totalClasses}
                  </span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
