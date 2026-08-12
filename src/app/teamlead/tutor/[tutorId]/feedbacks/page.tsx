"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, User, ArrowRightLeft, X, Loader2 } from "lucide-react";

interface UserInfo {
    _id: string;
    username: string;
    email: string;
}

interface ClassInfo {
    _id: string;
    title: string;
    startTime: string;
    endTime: string;
}

interface CourseInfo {
    _id: string;
    title: string;
}

interface RatingsInfo {
    rhythm?: string | number;
    theoreticalUnderstanding?: string | number;
    performance?: string | number;
    earTraining?: string | number;
    assignment?: string | number;
    technique?: string | number;
    attendance?: string | number;
    overallRating?: number;
    naFields?: string[];
}

interface FeedbackItem {
    _id: string;
    createdAt: string;
    student: UserInfo;
    class: ClassInfo;
    course: CourseInfo;
    ratings: RatingsInfo;
    personalFeedback: string;
    isEditable?: boolean;
}

interface StudentSummary {
    student: UserInfo;
    feedbacksCount: number;
    lastFeedbackDate: string;
    pendingFeedbacks?: any[];
    pendingCount?: number;
}

export default function TeamLeadStudentFeedbacksPage() {
    const params = useParams();
    const tutorId = typeof params?.tutorId === "string" ? params.tutorId : null;

    const [tutor, setTutor] = useState<UserInfo | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [feedbackFilter, setFeedbackFilter] = useState<"all" | "pending" | "completed">("all");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [enablingFeedbackId, setEnablingFeedbackId] = useState<string | null>(null);

    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [studentToReassign, setStudentToReassign] = useState<UserInfo | null>(null);
    const [availableTutors, setAvailableTutors] = useState<any[]>([]);
    const [newTutorId, setNewTutorId] = useState<string>("");
    const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);
    const [isLoadingTutors, setIsLoadingTutors] = useState(false);
    const [reassignType, setReassignType] = useState<"permanent" | "temporary">("permanent");
    const [students, setStudents] = useState<UserInfo[]>([]);
    const [pendingFeedbacks, setPendingFeedbacks] = useState<any[]>([]);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [selectedStudentForPending, setSelectedStudentForPending] = useState<UserInfo | null>(null);
    const [selectedStudentPendingList, setSelectedStudentPendingList] = useState<any[]>([]);

    useEffect(() => {
        if (!tutorId) {
            setLoading(false);
            setError("Tutor not found");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [res, pendingRes] = await Promise.all([
                    fetch(`/Api/relationship-manager/tutor/${tutorId}/feedbacks`, {
                        credentials: "include",
                    }),
                    fetch(`/Api/pendingFeedback?tutorId=${tutorId}`, {
                        credentials: "include",
                    })
                ]);

                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to load feedbacks");
                }

                let pendingData = { missingFeedbackClasses: [] };
                if (pendingRes.ok) {
                    try {
                        pendingData = await pendingRes.json();
                    } catch (e) {
                        console.error("Failed to parse pending feedbacks", e);
                    }
                }

                setTutor(data.tutor || null);
                setFeedbacks(data.feedbacks || []);
                setStudents(data.students || []);
                setPendingFeedbacks(pendingData.missingFeedbackClasses || []);

            } catch (err: any) {
                setError(err.message || "Failed to load student feedbacks");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tutorId]);

    // Derived state: unique students list
    const studentSummaries = useMemo(() => {
        return students.map(student => {
            const studentFeedbacks = feedbacks.filter(fb => fb.student._id === student._id);
            const studentPending = pendingFeedbacks.filter(fb => fb.studentId === student._id);
            const sorted = [...studentFeedbacks].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return {
                student,
                feedbacksCount: studentFeedbacks.length,
                lastFeedbackDate: sorted[0]?.createdAt || "",
                pendingFeedbacks: studentPending,
                pendingCount: studentPending.length
            };
        }).sort((a, b) =>
            new Date(b.lastFeedbackDate).getTime() - new Date(a.lastFeedbackDate).getTime()
        );
    }, [students, feedbacks, pendingFeedbacks]);

    // Filtered views based on search term and feedback status filter
    const filteredStudents = useMemo(() => {
        let list = studentSummaries;

        if (feedbackFilter === "pending") {
            list = list.filter(s => (s.pendingCount ?? 0) > 0);
        } else if (feedbackFilter === "completed") {
            list = list.filter(s => (s.pendingCount ?? 0) === 0);
        }

        if (!searchTerm) return list;
        const lowerSearch = searchTerm.toLowerCase();
        return list.filter(s =>
            s.student.username.toLowerCase().includes(lowerSearch) ||
            s.student.email.toLowerCase().includes(lowerSearch)
        );
    }, [studentSummaries, searchTerm, feedbackFilter]);

    const selectedStudentFeedbacks = useMemo(() => {
        if (!selectedStudentId) return [];

        const filtered = feedbacks.filter(fb => fb.student._id === selectedStudentId);

        if (!searchTerm) return filtered;

        const lowerSearch = searchTerm.toLowerCase();
        return filtered.filter(fb =>
            fb.course.title.toLowerCase().includes(lowerSearch) ||
            fb.class.title.toLowerCase().includes(lowerSearch)
        );
    }, [feedbacks, selectedStudentId, searchTerm]);

    const handleOpenReassignModal = async (student: UserInfo) => {
        setStudentToReassign(student);
        setIsReassignModalOpen(true);
        setNewTutorId("");
        setReassignType("permanent");

        if (availableTutors.length === 0) {
            setIsLoadingTutors(true);
            try {
                const res = await fetch('/Api/relationship-manager/tutors', {
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setAvailableTutors(data.tutors || []);
                } else {
                    alert(data.error || "Failed to load tutors");
                }
            } catch (err) {
                console.error("Error fetching tutors:", err);
            } finally {
                setIsLoadingTutors(false);
            }
        }
    };

    const handleReassignSubmit = async () => {
        if (!newTutorId || !studentToReassign || !tutorId) return;

        setIsSubmittingReassign(true);
        try {
            const res = await fetch('/Api/relationship-manager/student/reassign', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    studentId: studentToReassign._id,
                    oldTutorId: tutorId,
                    newTutorId: newTutorId,
                    reassignType: reassignType
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert(data.message || "Reassignment processed successfully.");
                setIsReassignModalOpen(false);
                setStudentToReassign(null);
            } else {
                alert(data.error || "Failed to submit reassignment request");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred during reassignment.");
        } finally {
            setIsSubmittingReassign(false);
        }
    };

    const handleOpenPendingModal = (student: UserInfo, pendingList: any[]) => {
        setSelectedStudentForPending(student);
        setSelectedStudentPendingList(pendingList);
        setIsPendingModalOpen(true);
    };

    const handleEnableEdit = async (feedbackId: string) => {
        if (!tutorId) return;
        try {
            setEnablingFeedbackId(feedbackId);
            const res = await fetch(`/Api/relationship-manager/tutor/${tutorId}/feedbacks/${feedbackId}/enable-edit`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.error || "Failed to enable edit.");
                return;
            }

            // Update local state
            setFeedbacks(prev => prev.map(fb =>
                fb._id === feedbackId ? { ...fb, isEditable: true } : fb
            ));

        } catch (err: any) {
            alert(err.message || "An error occurred while enabling edit.");
        } finally {
            setEnablingFeedbackId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link
                        href={`/teamlead/tutor/${tutorId}`}
                        className="inline-flex items-center gap-2 text-purple-600 hover:underline"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to tutor calendar
                    </Link>
                </div>
            </div>
        );
    }

    const selectedStudentNode = selectedStudentId
        ? studentSummaries.find(s => s.student._id === selectedStudentId)?.student
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {selectedStudentId ? (
                            <button
                                onClick={() => {
                                    setSelectedStudentId(null);
                                    setSearchTerm("");
                                }}
                                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
                                title="Back to students list"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                        ) : (
                            <Link
                                href={`/teamlead/tutor/${tutorId}`}
                                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
                                title="Back to tutor calendar"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </Link>
                        )}

                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {selectedStudentNode
                                    ? `${selectedStudentNode.username}'s Feedbacks`
                                    : `${tutor?.username ? tutor.username + "'s" : "Tutor"} Students`}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {selectedStudentNode
                                    ? `Feedbacks given by ${tutor?.username || "Tutor"}`
                                    : "Select a student to view their feedbacks"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder={selectedStudentId ? "Search courses, classes..." : "Search students..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {!selectedStudentId ? (
                    // View 1: List of Students
                    <>
                        <div className="flex bg-gray-200/60 p-1 rounded-xl w-fit mb-6 gap-1">
                            <button
                                onClick={() => setFeedbackFilter("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    feedbackFilter === "all"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <span>All</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                                    feedbackFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-300/50 text-gray-600"
                                }`}>
                                    {studentSummaries.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setFeedbackFilter("pending")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    feedbackFilter === "pending"
                                        ? "bg-white text-red-600 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <span>Pending</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                                    feedbackFilter === "pending" ? "bg-red-100 text-red-600" : "bg-gray-300/50 text-gray-600"
                                }`}>
                                    {studentSummaries.filter(s => (s.pendingCount ?? 0) > 0).length}
                                </span>
                            </button>
                            <button
                                onClick={() => setFeedbackFilter("completed")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    feedbackFilter === "completed"
                                        ? "bg-white text-green-700 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <span>Completed</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                                    feedbackFilter === "completed" ? "bg-green-100 text-green-700" : "bg-gray-300/50 text-gray-600"
                                }`}>
                                    {studentSummaries.filter(s => (s.pendingCount ?? 0) === 0).length}
                                </span>
                            </button>
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center w-full">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    No students found
                                </h2>
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? "No students match your search criteria."
                                        : feedbackFilter === "pending"
                                        ? "No students with pending feedbacks."
                                        : feedbackFilter === "completed"
                                        ? "No students with completed feedbacks."
                                        : "This tutor hasn't submitted feedbacks for any students yet."}
                                </p>
                                {(searchTerm || feedbackFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFeedbackFilter("all");
                                        }}
                                        className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStudents.map((summary) => (
                                    <div
                                        key={summary.student._id}
                                        onClick={() => {
                                            setSelectedStudentId(summary.student._id);
                                            setSearchTerm("");
                                        }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-base font-bold">
                                                        {summary.student.username?.charAt(0).toUpperCase() || "S"}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                            {summary.student.username}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">{summary.student.email}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenReassignModal(summary.student);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                                                    title="Reassign Student"
                                                >
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                                <div>
                                                    <span className="font-medium text-gray-700">{summary.feedbacksCount}</span> Feedback{summary.feedbacksCount !== 1 ? "s" : ""}
                                                </div>
                                                {summary.lastFeedbackDate && (
                                                    <div>
                                                        Last: {new Date(summary.lastFeedbackDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </div>
                                                )}
                                            </div>

                                            {(summary.pendingCount ?? 0) > 0 && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenPendingModal(summary.student, summary.pendingFeedbacks || []);
                                                    }}
                                                    className="mt-3 py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer"
                                                >
                                                    <span className="text-red-700 font-medium flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                        {summary.pendingCount} Pending Feedback{summary.pendingCount !== 1 ? "s" : ""}
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-red-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 text-xs font-medium text-purple-600 flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                                            <span>View Feedbacks</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // View 2: Feedbacks of Selected Student
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Feedbacks History ({selectedStudentFeedbacks.length})
                            </h2>
                        </div>

                        {selectedStudentFeedbacks.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
                                <p className="text-gray-500">No feedbacks found for this student.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {selectedStudentFeedbacks.map((fb) => (
                                    <div
                                        key={fb._id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                                            <div>
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                                                    {fb.course?.title || "Course"}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 mt-2">
                                                    {fb.class?.title || "Class"}
                                                </h3>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(fb.createdAt).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </div>
                                        </div>

                                        {/* Ratings grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-100 text-xs">
                                            {Object.entries(fb.ratings || {}).map(([key, val]) => {
                                                if (key === "overallRating" || key === "naFields") return null;
                                                return (
                                                    <div key={key} className="bg-gray-50 p-2.5 rounded-lg">
                                                        <span className="text-gray-500 capitalize block mb-1">
                                                            {key.replace(/([A-Z])/g, ' $1')}
                                                        </span>
                                                        <span className="font-semibold text-gray-900">
                                                            {val !== undefined && val !== null ? String(val) : "N/A"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Feedback text */}
                                        {fb.personalFeedback && (
                                            <div className="pt-4">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Feedback Note:</p>
                                                <p className="text-sm text-gray-700 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                                                    {fb.personalFeedback}
                                                </p>
                                            </div>
                                        )}

                                        {/* Enable edit control if allowed */}
                                        {!fb.isEditable && (
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                                <button
                                                    onClick={() => handleEnableEdit(fb._id)}
                                                    disabled={enablingFeedbackId === fb._id}
                                                    className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {enablingFeedbackId === fb._id ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            <span>Enabling...</span>
                                                        </>
                                                    ) : (
                                                        <span>Enable Edit for Tutor</span>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Reassign Modal */}
            {isReassignModalOpen && studentToReassign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setIsReassignModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Reassign {studentToReassign.username}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Select a new tutor to assign this student to.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Reassignment Type
                                </label>
                                <div className="flex gap-4 text-xs">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reassignType"
                                            value="permanent"
                                            checked={reassignType === "permanent"}
                                            onChange={() => setReassignType("permanent")}
                                        />
                                        Permanent
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reassignType"
                                            value="temporary"
                                            checked={reassignType === "temporary"}
                                            onChange={() => setReassignType("temporary")}
                                        />
                                        Temporary
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Select New Tutor
                                </label>
                                {isLoadingTutors ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                        <span>Loading tutors...</span>
                                    </div>
                                ) : (
                                    <select
                                        value={newTutorId}
                                        onChange={(e) => setNewTutorId(e.target.value)}
                                        className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select tutor...</option>
                                        {availableTutors
                                            .filter(t => t._id !== tutorId)
                                            .map((t) => (
                                                <option key={t._id} value={t._id}>
                                                    {t.username} ({t.email})
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setIsReassignModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReassignSubmit}
                                    disabled={!newTutorId || isSubmittingReassign}
                                    className="px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                                >
                                    {isSubmittingReassign ? "Submitting..." : "Submit Reassignment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Feedbacks Modal */}
            {isPendingModalOpen && selectedStudentForPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-base">
                                Pending Feedbacks: {selectedStudentForPending.username}
                            </h3>
                            <button
                                onClick={() => setIsPendingModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {selectedStudentPendingList.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="font-medium">All caught up!</p>
                                    <p className="text-xs mt-1">No pending feedbacks for this student.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedStudentPendingList.map((item, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg border border-red-100 bg-red-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div>
                                                <div className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                                                    {item.courseName}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm">
                                                    {item.className}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                    <span>Class Date:</span>
                                                    <span className="font-medium text-gray-700">
                                                        {new Date(item.classDate).toLocaleDateString("en-US", {
                                                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className="text-[11px] font-semibold text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded-md">
                                                    Pending
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsPendingModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
