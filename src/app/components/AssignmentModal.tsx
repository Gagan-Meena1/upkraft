"use client";

import { useState, useEffect } from "react";
import { ClipboardList, X, Loader2 } from "lucide-react";

interface AssignmentItem {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  status?: string;
  songName?: string;
  completionPercentage?: number;
  createdAt?: string;
}

interface AssignmentModalProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

function getStatusBadge(assignment: AssignmentItem) {
  const pct = assignment.completionPercentage ?? 0;
  if (pct >= 100) {
    return { label: "Completed", bg: "#dcfce7", color: "#16a34a" };
  }
  if (pct > 0) {
    return { label: `${pct}%`, bg: "#fef3c7", color: "#d97706" };
  }
  const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
  if (deadline && deadline < new Date()) {
    return { label: "Overdue", bg: "#fef2f2", color: "#dc2626" };
  }
  return { label: "Pending", bg: "#eff6ff", color: "#3b82f6" };
}

export default function AssignmentModal({
  studentId,
  studentName,
  onClose,
}: AssignmentModalProps) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/Api/assignment?userId=${studentId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch assignments");
        }

        setAssignments(data.data?.assignments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [studentId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assignments</h3>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No assignments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const badge = getStatusBadge(assignment);
                return (
                  <div
                    key={assignment._id}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {assignment.title}
                        </h4>
                        {assignment.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {assignment.songName && (
                            <span className="text-xs text-gray-400">
                              🎵 {assignment.songName}
                            </span>
                          )}
                          {assignment.deadline && (
                            <span className="text-xs text-gray-400">
                              Due:{" "}
                              {new Date(assignment.deadline).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
