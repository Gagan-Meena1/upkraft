// MonthlyClassesPage.tsx
"use client";

import Link from "next/link";
import { useMonthlyClasses, MonthlyCount, ClassDetail } from "./hooks/useMonthlyClasses";

export default function MonthlyClassesPage() {
    const { monthlyClasses, totalClasses, loading, error, selectedMonth, setSelectedMonth } =
        useMonthlyClasses();

    return (
        <div className="min-h-screen bg-[#f4f4f9] text-[#1a1a2e] font-sans pb-10">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 h-[54px] flex items-center px-5 sticky top-0 z-50 shadow-sm gap-3">
                <div className="text-[17px] font-extrabold tracking-tight">
                    <span className="text-[#5C16C5]">Up</span>
                    <span className="text-gray-600">Kraft</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 rounded px-2 py-0.5 font-bold hidden md:inline-block">
                    MONTHLY CLASSES
                </span>
                <div className="ml-auto flex gap-2 items-center">
                    <Link
                        href="/salesHead/studentPackage"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        ← Back to Packages
                    </Link>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-5 pt-6">
                {/* Total banner */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-[16px] font-bold text-gray-900">All Classes Happened</h1>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Counted from student attendance records (present or absent) · Click a month to debug
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-center">
                        <span className="text-[10px] font-medium block leading-tight">Total Classes</span>
                        <span className="text-[22px] font-black leading-tight">{loading ? "…" : totalClasses}</span>
                    </div>
                </div>

                {loading && (
                    <div className="p-10 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        <div className="text-[11px] text-gray-400 mt-2">Loading…</div>
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && monthlyClasses.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-3xl mb-2">📭</div>
                        No classes found
                    </div>
                )}

                {!loading && !error && monthlyClasses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {monthlyClasses.map((m) => (
                            <div
                                key={m.month}
                                onClick={() => setSelectedMonth(m)}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-semibold text-gray-700">{m.label}</span>
                                    <span className="text-[16px] font-black text-blue-700">{m.count}</span>
                                </div>
                                <div className="text-[9px] text-gray-400 mt-1">
                                    {m.count} class{m.count !== 1 ? "es" : ""} · click to inspect
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedMonth && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMonth(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-[15px] font-bold text-gray-900">
                                    {selectedMonth.label} — Debug View
                                </h2>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {selectedMonth.count} attendance records
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-[11px] border-collapse">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {["#", "Class ID", "Start Time (IST)", "Course", "Tutor", "Tutor Email", "Student", "Attendance"].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMonth.classes.map((cls, i) => (
                                        <tr
                                            key={`${cls.classId}-${i}`}
                                            className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                            <td className="px-3 py-2 font-mono text-gray-600 text-[10px]">
                                                {cls.classId}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                {cls.startTime}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">{cls.courseName}</td>
                                            <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{cls.tutorName}</td>
                                            <td className="px-3 py-2 text-gray-500">{cls.tutorEmail}</td>
                                            <td className="px-3 py-2 text-gray-700">{cls.studentName}</td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${cls.attendanceStatus === "present"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                        }`}
                                                >
                                                    {cls.attendanceStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}