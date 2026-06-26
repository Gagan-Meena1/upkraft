"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, CalendarX, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Student {
    _id: string;
    username: string;
    email: string;
}

interface ClassPreview {
    _id: string;
    title: string;
    startTime: string;
    endTime: string;
    course: { _id: string; name: string };
}

interface GroupedClasses {
    [courseName: string]: ClassPreview[];
}

export default function BulkCancelClasses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [suggestions, setSuggestions] = useState<Student[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [previewClasses, setPreviewClasses] = useState<ClassPreview[]>([]);
    const [groupedClasses, setGroupedClasses] = useState<GroupedClasses>({});
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const cacheRef = useRef<Student[]>([]);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLDivElement>(null);

    // Fetch recent students on mount
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch("/Api/students/recent", { credentials: "include" });
                const data = await res.json();
                if (data.success) {
                    cacheRef.current = data.students || [];
                }
            } catch (e) {
                console.error("Failed to fetch recent students", e);
            }
        };
        fetchRecent();
    }, []);

    // Click outside to close suggestions
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const searchStudents = useCallback((query: string) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const lower = query.toLowerCase();

        // Check cache first
        const cacheResults = cacheRef.current.filter(
            s => s.username.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower)
        );

        if (cacheResults.length > 0) {
            setSuggestions(cacheResults.slice(0, 8));
            setShowSuggestions(true);
            return;
        }

        // Cache miss — hit DB
        fetch(`/Api/students/search?q=${encodeURIComponent(query)}`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Merge into cache
                    const newEntries = data.students.filter(
                        (s: Student) => !cacheRef.current.find(c => c._id === s._id)
                    );
                    cacheRef.current = [...cacheRef.current, ...newEntries];
                    setSuggestions(data.students.slice(0, 8));
                    setShowSuggestions(true);
                }
            })
            .catch(console.error);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        setSelectedStudent(null);
        setPreviewClasses([]);
        setGroupedClasses({});
        setShowConfirm(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchStudents(val), 300);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchTerm(student.username);
        setSuggestions([]);
        setShowSuggestions(false);
        setPreviewClasses([]);
        setGroupedClasses({});
        setShowConfirm(false);
    };

    const handlePreview = async () => {
        if (!selectedStudent || !startDate || !endDate) {
            toast.error("Please fill all fields");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Start date must be before end date");
            return;
        }

        try {
            setIsLoadingPreview(true);
            setShowConfirm(false);
            const res = await fetch("/Api/classes/bulk-cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    studentId: selectedStudent._id,
                    startDate,
                    endDate
                })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "Failed to fetch classes");
                return;
            }

            const classes: ClassPreview[] = data.classes || [];
            setPreviewClasses(classes);

            // Group by course name
            const grouped: GroupedClasses = {};
            classes.forEach(cls => {
                const courseName = cls.course?.name || "Unknown Course";
                if (!grouped[courseName]) grouped[courseName] = [];
                grouped[courseName].push(cls);
            });
            setGroupedClasses(grouped);

            if (classes.length > 0) setShowConfirm(true);
            else toast("No classes found in this date range", { icon: "ℹ️" });

        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (previewClasses.length === 0) return;

        try {
            setIsConfirming(true);
            const res = await fetch("/Api/classes/bulk-cancel", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    classIds: previewClasses.map(c => c._id)
                })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "Failed to cancel classes");
                return;
            }

            toast.success(`${data.cancelledCount} classes cancelled successfully`);
            // Reset
            setSelectedStudent(null);
            setSearchTerm("");
            setStartDate("");
            setEndDate("");
            setPreviewClasses([]);
            setGroupedClasses({});
            setShowConfirm(false);

        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsConfirming(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            day: d.toLocaleDateString("en-US", { weekday: "long" }),
            time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        };
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-2xl w-full mx-auto">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                        <CalendarX className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Bulk Cancel Classes</h2>
                </div>
                <p className="text-sm text-gray-500 ml-12">Cancel all classes for a student within a date range</p>
            </div>

            <div className="space-y-4">
                {/* Student Search */}
                <div ref={searchInputRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedStudent(null);
                                    setSuggestions([]);
                                    setPreviewClasses([]);
                                    setGroupedClasses({});
                                    setShowConfirm(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {suggestions.map(s => (
                                <button
                                    key={s._id}
                                    onClick={() => handleSelectStudent(s)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                >
                                    <span className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                                        {s.username}
                                    </span>
                                    <span className="text-xs text-gray-400">{s.email}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedStudent && (
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-green-700 font-medium">
                                Selected: {selectedStudent.username} · {selectedStudent.email}
                            </span>
                        </div>
                    )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setShowConfirm(false); setPreviewClasses([]); setGroupedClasses({}); }}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); setShowConfirm(false); setPreviewClasses([]); setGroupedClasses({}); }}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Preview Button */}
                <button
                    onClick={handlePreview}
                    disabled={!selectedStudent || !startDate || !endDate || isLoadingPreview}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {isLoadingPreview ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Fetching classes...</>
                    ) : (
                        "Preview Classes to Cancel"
                    )}
                </button>

                {/* Preview Results */}
                {Object.keys(groupedClasses).length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                {previewClasses.length} class{previewClasses.length !== 1 ? "es" : ""} will be cancelled
                            </span>
                            <span className="text-xs text-gray-500">
                                {Object.keys(groupedClasses).length} course{Object.keys(groupedClasses).length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                            {Object.entries(groupedClasses).map(([courseName, classes]) => (
                                <div key={courseName}>
                                    <div className="px-4 py-2 bg-red-50 sticky top-0">
                                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                                            {courseName}
                                        </span>
                                        <span className="ml-2 text-xs text-red-500">
                                            ({classes.length} class{classes.length !== 1 ? "es" : ""})
                                        </span>
                                    </div>
                                    {classes.map(cls => {
                                        const { date, day, time } = formatDate(cls.startTime);
                                        return (
                                            <div key={cls._id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{cls.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{day} · {date}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirm Cancel Button */}
                {showConfirm && previewClasses.length > 0 && (
                    <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                        <div className="flex items-start gap-3 mb-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                                This will permanently cancel <span className="font-semibold">{previewClasses.length} classes</span> for{" "}
                                <span className="font-semibold">{selectedStudent?.username}</span>. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={handleConfirmCancel}
                            disabled={isConfirming}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isConfirming ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                            ) : (
                                `Confirm — Cancel ${previewClasses.length} Classes`
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}