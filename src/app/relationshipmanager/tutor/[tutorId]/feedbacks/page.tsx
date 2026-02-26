"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";

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
}

interface FeedbackItem {
    _id: string;
    createdAt: string;
    student: UserInfo;
    class: ClassInfo;
    course: CourseInfo;
    ratings: RatingsInfo;
    personalFeedback: string;
}

interface StudentSummary {
    student: UserInfo;
    feedbacksCount: number;
    lastFeedbackDate: string;
}

export default function RMStudentFeedbacksPage() {
    const params = useParams();
    const tutorId = typeof params?.tutorId === "string" ? params.tutorId : null;

    const [tutor, setTutor] = useState<UserInfo | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

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

                const res = await fetch(`/Api/relationship-manager/tutor/${tutorId}/feedbacks`, {
                    credentials: "include",
                });
                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to load feedbacks");
                }

                setTutor(data.tutor || null);
                setFeedbacks(data.feedbacks || []);
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
        const map = new Map<string, StudentSummary>();

        feedbacks.forEach(fb => {
            const sId = fb.student._id;
            if (!map.has(sId)) {
                map.set(sId, {
                    student: fb.student,
                    feedbacksCount: 1,
                    lastFeedbackDate: fb.createdAt
                });
            } else {
                const existing = map.get(sId)!;
                existing.feedbacksCount += 1;
                if (new Date(fb.createdAt) > new Date(existing.lastFeedbackDate)) {
                    existing.lastFeedbackDate = fb.createdAt;
                }
            }
        });

        return Array.from(map.values()).sort((a, b) =>
            new Date(b.lastFeedbackDate).getTime() - new Date(a.lastFeedbackDate).getTime()
        );
    }, [feedbacks]);

    // Filtered views based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return studentSummaries;
        const lowerSearch = searchTerm.toLowerCase();
        return studentSummaries.filter(s =>
            s.student.username.toLowerCase().includes(lowerSearch) ||
            s.student.email.toLowerCase().includes(lowerSearch)
        );
    }, [studentSummaries, searchTerm]);

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
                        href={`/relationshipmanager/tutor/${tutorId}`}
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
                                href={`/relationshipmanager/tutor/${tutorId}`}
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
                    filteredStudents.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                No students found
                            </h2>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No students match your search criteria."
                                    : "This tutor hasn't submitted feedbacks for any students yet."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                                >
                                    Clear Search
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
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
                                                {summary.student.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                    {summary.student.username}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate w-32 sm:w-40">
                                                    {summary.student.email}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 mt-3 transition-colors" />
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                        <div className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{summary.feedbacksCount}</span> feedbacks
                                        </div>
                                        <div className="text-gray-500 text-xs text-right">
                                            Last: {new Date(summary.lastFeedbackDate).toLocaleDateString("en-US", {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // View 2: Feedbacks for Selected Student
                    selectedStudentFeedbacks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                No feedbacks found
                            </h2>
                            <p className="text-gray-500">
                                {searchTerm && "No feedbacks match your search criteria."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {selectedStudentFeedbacks.map((fb) => (
                                <div key={fb._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="border-b border-gray-100 bg-gray-50 p-4 sm:px-6 flex flex-wrap gap-4 justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full inline-block mb-2">
                                                {fb.course.title}
                                            </div>
                                            <div className="text-gray-900 font-semibold">{fb.class.title}</div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">Feedback Submitted On</div>
                                            <div className="text-sm text-gray-800 font-medium">
                                                {new Date(fb.createdAt).toLocaleDateString("en-US", {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Ratings */}
                                        <div className="md:col-span-1 border-r border-gray-100 pr-4">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Ratings</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "Rhythm", value: fb.ratings.rhythm },
                                                    { label: "Theory", value: fb.ratings.theoreticalUnderstanding },
                                                    { label: "Performance", value: fb.ratings.performance },
                                                    { label: "Ear Training", value: fb.ratings.earTraining },
                                                    { label: "Technique", value: fb.ratings.technique },
                                                    { label: "Assignment", value: fb.ratings.assignment },
                                                ].map((stat, idx) => (
                                                    stat.value !== undefined && stat.value !== null && stat.value !== "" && (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">{stat.label}</span>
                                                            <span className="font-medium flex items-center gap-1">
                                                                {stat.value}
                                                                <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                                            </span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        {/* Personal Feedback */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Tutor's Personal Feedback</h4>
                                            <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 text-gray-700 text-sm italic whitespace-pre-wrap min-h-[100px]">
                                                {fb.personalFeedback || "No written feedback provided."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
