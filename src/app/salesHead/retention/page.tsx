"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import RetentionView from "@/app/components/RetentionView";
import RetentionStudentList from "@/app/components/RetentionStudentList";
import DropCompositionModal from "@/app/components/DropCompositionModal";

interface MonthData {
    month: string;
    label: string;
    total: number;
    active: number;
    churned: number;
    retention: number;
}

interface Student {
    studentId: string;
    name: string;
    phone: string;
    email: string;
    society: string;
    firstClassDate: string;
    dynamicEndDate: string | null;
    status: "active" | "churned";
    consider: boolean;
}

export default function RetentionPage() {
    const [months, setMonths] = useState<MonthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [showDropComposition, setShowDropComposition] = useState(false);

    // Pre-fetched student data cache: month -> students[]
    const studentCache = useRef<Record<string, Student[]>>({});
    const [currentStudents, setCurrentStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Fetch monthly stats
    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/Api/salesHead/studentPackage/retention");
            const data = await res.json();
            if (data.success) {
                setMonths(data.data);
                // Pre-fetch student data for all months
                prefetchAllMonths(data.data);
            } else {
                toast.error(data.error || "Failed to load retention data");
            }
        } catch {
            toast.error("Failed to load retention data");
        } finally {
            setLoading(false);
        }
    }, []);

    // Pre-fetch students for all months in background
    const prefetchAllMonths = async (monthsData: MonthData[]) => {
        for (const m of monthsData) {
            if (m.total === 0) continue; // skip empty months
            try {
                const res = await fetch(`/Api/salesHead/studentPackage/retention/students?month=${m.month}`);
                const data = await res.json();
                if (data.success) {
                    studentCache.current[m.month] = data.data;
                    // If this month is currently selected, update the display
                    if (m.month === selectedMonth) {
                        setCurrentStudents(data.data);
                    }
                }
            } catch {
                // silently fail for pre-fetch
            }
        }
    };

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle month card click
    const handleMonthClick = async (month: string) => {
        if (selectedMonth === month) {
            setSelectedMonth(null);
            setCurrentStudents([]);
            return;
        }

        setSelectedMonth(month);

        // Check cache first
        if (studentCache.current[month]) {
            setCurrentStudents(studentCache.current[month]);
            return;
        }

        // Fetch if not cached
        setStudentsLoading(true);
        try {
            const res = await fetch(`/Api/salesHead/studentPackage/retention/students?month=${month}`);
            const data = await res.json();
            if (data.success) {
                studentCache.current[month] = data.data;
                setCurrentStudents(data.data);
            }
        } catch {
            toast.error("Failed to load students");
        } finally {
            setStudentsLoading(false);
        }
    };

    // Toggle consider
    const handleConsiderToggle = async (studentId: string, consider: boolean) => {
        // Optimistic UI update
        setCurrentStudents(prev =>
            prev.map(s => s.studentId === studentId ? { ...s, consider } : s)
        );
        if (selectedMonth) {
            studentCache.current[selectedMonth] = currentStudents.map(s =>
                s.studentId === studentId ? { ...s, consider } : s
            );
        }

        try {
            const res = await fetch("/Api/salesHead/studentPackage/retention/consider", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, consider }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(consider ? "Included in retention" : "Excluded from retention");
                // Refresh stats to update counts
                fetchStats();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update");
            // Revert on failure
            setCurrentStudents(prev =>
                prev.map(s => s.studentId === studentId ? { ...s, consider: !consider } : s)
            );
        }
    };

    const selectedMonthData = months.find(m => m.month === selectedMonth);

    // Calculate summary stats
    const totalStudents = months.reduce((sum, m) => sum + m.total, 0);
    const totalActive = months.reduce((sum, m) => sum + m.active, 0);
    const overallRetention = totalStudents > 0 ? ((totalActive / totalStudents) * 100).toFixed(1) : "0";

    return (
        <div className="min-h-screen bg-[#faf9ff]">
            <Toaster position="top-right" />

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-[16px] font-black text-gray-900">UpKraft</h1>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Retention View
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDropComposition(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
                    >
                        📊 Drop Composition
                    </button>
                    <div className="text-[11px] text-gray-400">
                        {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="px-5 py-5">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Total Students (2026)</div>
                        <div className="text-[28px] font-black text-gray-900 leading-tight">{totalStudents}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-green-200 p-4">
                        <div className="text-[10px] text-green-600 uppercase font-semibold tracking-wider">Still Active</div>
                        <div className="text-[28px] font-black text-green-600 leading-tight">{totalActive}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-purple-200 p-4">
                        <div className="text-[10px] text-purple-600 uppercase font-semibold tracking-wider">Overall Retention</div>
                        <div className="text-[28px] font-black text-purple-700 leading-tight">{overallRetention}%</div>
                    </div>
                </div>
            </div>

            {/* Monthly Cards */}
            <RetentionView
                months={months}
                loading={loading}
                selectedMonth={selectedMonth}
                onMonthClick={handleMonthClick}
            />

            {/* Student Drill-down */}
            {selectedMonth && selectedMonthData && (
                <div className="pb-8">
                    <RetentionStudentList
                        monthLabel={selectedMonthData.label}
                        students={currentStudents}
                        loading={studentsLoading}
                        onConsiderToggle={handleConsiderToggle}
                    />
                </div>
            )}

            {/* Drop Composition Modal */}
            <DropCompositionModal
                isOpen={showDropComposition}
                onClose={() => setShowDropComposition(false)}
            />
        </div>
    );
}
