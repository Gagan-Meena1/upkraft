"use client";

import Link from "next/link";
import { useTutorClasses } from "./hooks/useTutorClasses";
import TutorListPanel from "./components/TutorListPanel";
import MonthlyClassBreakdown from "./components/MonthlyClassBreakdown";

export default function TutorClassesPage() {
  const {
    filteredTutors,
    loading,
    error,
    search,
    setSearch,
    selectedTutorId,
    setSelectedTutorId,
    selectedTutor,
  } = useTutorClasses();

  return (
    <div className="h-screen flex flex-col bg-[#f4f4f9] text-[#1a1a2e] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-[54px] flex items-center px-5 sticky top-0 z-50 shadow-sm gap-3 flex-shrink-0">
        <div className="text-[17px] font-extrabold tracking-tight">
          <span className="text-[#5C16C5]">Up</span>
          <span className="text-gray-600">Kraft</span>
        </div>
        <span className="text-[10px] bg-teal-100 text-teal-800 rounded px-2 py-0.5 font-bold hidden md:inline-block">
          TUTOR CLASSES
        </span>
        <div className="ml-auto flex gap-2 items-center">
          <span className="text-[11px] text-gray-400">
            Updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <Link
            href="/salesHead/studentPackage"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            ← Back to Packages
          </Link>
        </div>
      </nav>

      {/* Main layout: left panel + center */}
      <div className="flex flex-1 overflow-hidden">
        <TutorListPanel
          tutors={filteredTutors}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          selectedTutorId={selectedTutorId}
          onSelectTutor={setSelectedTutorId}
        />
        <MonthlyClassBreakdown tutor={selectedTutor} />
      </div>
    </div>
  );
}
