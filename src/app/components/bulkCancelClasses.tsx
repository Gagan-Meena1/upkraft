"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, CalendarX, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import CancellationReasonPicker from "@/app/components/reasonForCancellation";

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
    const [cancellationReason, setCancellationReason] = useState<string>("");
    const [creditDeduction, setCreditDeduction] = useState<boolean>(false);
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());

    const cacheRef = useRef<Student[]>([]);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch("/Api/students/recent", { credentials: "include" });
                const data = await res.json();
                if (data.success) cacheRef.current = data.students || [];
            } catch (e) {
                console.error("Failed to fetch recent students", e);
            }
        };
        fetchRecent();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const resetConfirmState = () => {
        setShowConfirm(false);
        setPreviewClasses([]);
        setGroupedClasses({});
        setSelectedClassIds(new Set());
        setCancellationReason("");
        setCreditDeduction(false);
    };

    const searchStudents = useCallback((query: string) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const lower = query.toLowerCase();
        const cacheResults = cacheRef.current.filter(
            s => s.username.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower)
        );

        if (cacheResults.length > 0) {
            setSuggestions(cacheResults.slice(0, 8));
            setShowSuggestions(true);
            return;
        }

        fetch(`/Api/students/search?q=${encodeURIComponent(query)}`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
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
        resetConfirmState();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchStudents(val), 300);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchTerm(student.username);
        setSuggestions([]);
        setShowSuggestions(false);
        resetConfirmState();
    };

    const toggleClass = (classId: string) => {
        setSelectedClassIds(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
            return next;
        });
    };

    const toggleAll = (classIds: string[]) => {
        setSelectedClassIds(prev => {
            const next = new Set(prev);
            const allSelected = classIds.every(id => next.has(id));
            if (allSelected) classIds.forEach(id => next.delete(id));
            else classIds.forEach(id => next.add(id));
            return next;
        });
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
            resetConfirmState();

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

            const grouped: GroupedClasses = {};
            classes.forEach(cls => {
                const name = cls.course?.name || "Unknown Course";
                if (!grouped[name]) grouped[name] = [];
                grouped[name].push(cls);
            });
            setGroupedClasses(grouped);
            setSelectedClassIds(new Set(classes.map(c => c._id)));

            if (classes.length > 0) setShowConfirm(true);
            else toast("No classes found in this date range", { icon: "ℹ️" });

        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (selectedClassIds.size === 0) {
            toast.error("No classes selected");
            return;
        }
        if (!cancellationReason.trim()) {
            toast.error("Please select a reason for cancellation");
            return;
        }

        try {
            setIsConfirming(true);
            const res = await fetch("/Api/classes/bulk-cancel", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    classIds: Array.from(selectedClassIds),
                    studentId: selectedStudent!._id,
                    creditDeduction,
                    reasonForCancellation: cancellationReason
                })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "Failed to cancel classes");
                return;
            }

            toast.success(`${data.cancelledCount} classes cancelled successfully`);
            setSelectedStudent(null);
            setSearchTerm("");
            setStartDate("");
            setEndDate("");
            resetConfirmState();

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
                                    resetConfirmState();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

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
                            onChange={e => { setStartDate(e.target.value); resetConfirmState(); }}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); resetConfirmState(); }}
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
                    ) : "Preview Classes to Cancel"}
                </button>

                {/* Preview Results with Checkboxes */}
                {Object.keys(groupedClasses).length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                {selectedClassIds.size} of {previewClasses.length} class{previewClasses.length !== 1 ? "es" : ""} selected
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    {Object.keys(groupedClasses).length} course{Object.keys(groupedClasses).length !== 1 ? "s" : ""}
                                </span>
                                <button
                                    onClick={() => {
                                        if (selectedClassIds.size === previewClasses.length) {
                                            setSelectedClassIds(new Set());
                                        } else {
                                            setSelectedClassIds(new Set(previewClasses.map(c => c._id)));
                                        }
                                    }}
                                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                                >
                                    {selectedClassIds.size === previewClasses.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                            {Object.entries(groupedClasses).map(([courseName, classes]) => {
                                const courseClassIds = classes.map(c => c._id);
                                const allCourseSelected = courseClassIds.every(id => selectedClassIds.has(id));
                                const someCourseSelected = courseClassIds.some(id => selectedClassIds.has(id));

                                return (
                                    <div key={courseName}>
                                        <div className="px-4 py-2 bg-red-50 sticky top-0 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={allCourseSelected}
                                                ref={el => { if (el) el.indeterminate = someCourseSelected && !allCourseSelected; }}
                                                onChange={() => toggleAll(courseClassIds)}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-400 cursor-pointer"
                                            />
                                            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                                                {courseName}
                                            </span>
                                            <span className="ml-1 text-xs text-red-500">
                                                ({courseClassIds.filter(id => selectedClassIds.has(id)).length}/{classes.length})
                                            </span>
                                        </div>

                                        {classes.map(cls => {
                                            const { date, day, time } = formatDate(cls.startTime);
                                            const isChecked = selectedClassIds.has(cls._id);
                                            return (
                                                <div
                                                    key={cls._id}
                                                    onClick={() => toggleClass(cls._id)}
                                                    className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${isChecked ? "hover:bg-gray-50" : "bg-gray-50 opacity-50 hover:opacity-70"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleClass(cls._id)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-400 cursor-pointer flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{cls.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{day} · {date}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Confirm Section */}
                {showConfirm && previewClasses.length > 0 && (
                    <div className="border border-red-200 rounded-xl p-4 bg-red-50 flex flex-col gap-4">

                        {/* Credit deduction toggle */}
                        <div className="flex items-center justify-between px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50">
                            <div>
                                <p className="text-sm font-medium text-amber-800">Credit Deduction</p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                    {creditDeduction
                                        ? "Attendance marked absent — credit deducted"
                                        : "Attendance marked cancelled — no credit impact"}
                                </p>
                            </div>
                            <button
                                onClick={() => setCreditDeduction(p => !p)}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${creditDeduction ? "bg-amber-500" : "bg-gray-300"
                                    }`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${creditDeduction ? "translate-x-5" : "translate-x-0"
                                    }`} />
                            </button>
                        </div>

                        {/* Reason picker */}
                        <CancellationReasonPicker
                            value={cancellationReason}
                            onChange={setCancellationReason}
                            onReset={() => setCancellationReason("")}
                        />

                        {/* Warning */}
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                                This will permanently cancel{" "}
                                <span className="font-semibold">{selectedClassIds.size} classes</span> for{" "}
                                <span className="font-semibold">{selectedStudent?.username}</span>. This action cannot be undone.
                            </p>
                        </div>

                        <button
                            onClick={handleConfirmCancel}
                            disabled={isConfirming || selectedClassIds.size === 0 || !cancellationReason.trim()}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isConfirming ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                            ) : (
                                `Confirm — Cancel ${selectedClassIds.size} Classes`
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}