"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Info, ChevronLeft } from "lucide-react";

interface AttendanceRecord {
  classId: string;
  title: string;
  startTime: string;
  endTime: string;
  classStatus: string;
  attendanceStatus: string;
  reasonForCancellation: string;
  reasonForReschedule: string;
}

interface AttendanceHistoryProps {
  studentId: string;
  studentName?: string;
  onBack: () => void;
}

const STATUS_PILL: Record<string, { bg: string; text: string; label: string; dotColor: string }> = {
  present: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Present", dotColor: "bg-green-500" },
  absent: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Absent", dotColor: "bg-red-500" },
  canceled: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Class Cancelled", dotColor: "bg-orange-400" },
  cancelled: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Class Cancelled", dotColor: "bg-orange-400" },
  not_marked: { bg: "bg-gray-50 border-gray-200", text: "text-gray-500", label: "Not Marked", dotColor: "bg-gray-400" },
  marked: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Marked", dotColor: "bg-blue-500" },
};

const CLASS_STATUS_PILL: Record<string, { bg: string; text: string; label: string; dotColor: string }> = {
  rescheduled: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Class Rescheduled", dotColor: "bg-blue-500" },
  canceled: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Class Cancelled", dotColor: "bg-orange-400" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatTime(startTime: string, endTime: string): string {
  const s = new Date(startTime);
  const e = new Date(endTime);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${fmt(s)} - ${fmt(e)}`;
}

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-4 w-28 bg-gray-200 rounded" />
      <div className="h-4 w-10 bg-gray-200 rounded" />
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-6 w-24 bg-gray-200 rounded-full" />
      <div className="h-4 w-6 bg-gray-200 rounded ml-auto" />
    </div>
  );
}

function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setMonth(start.getMonth() - 1);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export default function AttendanceHistory({
  studentId,
  studentName,
  onBack,
}: AttendanceHistoryProps) {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReason, setExpandedReason] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/Api/relationship-manager/student/attendance-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, startDate, endDate }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch attendance history");
      }

      setRecords(data.records || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [studentId, startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusDisplay = (record: AttendanceRecord) => {
    if (record.classStatus === "canceled") {
      const s = CLASS_STATUS_PILL.canceled;
      return { ...s, hasReason: !!record.reasonForCancellation };
    }
    if (record.classStatus === "rescheduled") {
      const s = CLASS_STATUS_PILL.rescheduled;
      return { ...s, hasReason: !!record.reasonForReschedule };
    }
    const normalized = record.attendanceStatus === "canceled" ? "cancelled" : record.attendanceStatus;
    const s = STATUS_PILL[normalized] || STATUS_PILL.not_marked;
    const hasReason = normalized === "absent" || normalized === "cancelled"
      ? !!record.reasonForCancellation
      : false;
    return { ...s, hasReason };
  };

  const getReason = (record: AttendanceRecord): string => {
    if (record.classStatus === "canceled") return record.reasonForCancellation || "No reason provided";
    if (record.classStatus === "rescheduled") return record.reasonForReschedule || "No reason provided";
    return record.reasonForCancellation || "No reason provided";
  };

  // Stats summary
  const stats = {
    total: records.length,
    present: records.filter(r => r.attendanceStatus === "present").length,
    absent: records.filter(r => r.attendanceStatus === "absent").length,
    cancelled: records.filter(r => r.classStatus === "canceled" || r.attendanceStatus === "canceled" || r.attendanceStatus === "cancelled").length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Back to student info"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Attendance History</h3>
          </div>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs bg-transparent border-none focus:outline-none text-gray-700 w-[110px]"
          />
          <span className="text-xs text-gray-300">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs bg-transparent border-none focus:outline-none text-gray-700 w-[110px]"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-[1]">
            <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Class Time</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <>
                <tr><td colSpan={5} className="p-0"><SkeletonRow delay={0} /></td></tr>
                <tr><td colSpan={5} className="p-0"><SkeletonRow delay={50} /></td></tr>
                <tr><td colSpan={5} className="p-0"><SkeletonRow delay={100} /></td></tr>
                <tr><td colSpan={5} className="p-0"><SkeletonRow delay={150} /></td></tr>
                <tr><td colSpan={5} className="p-0"><SkeletonRow delay={200} /></td></tr>
              </>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No attendance records found</p>
                  <p className="text-xs text-gray-300 mt-1">Try adjusting the date range</p>
                </td>
              </tr>
            ) : (
              records.map((record, idx) => {
                const statusDisplay = getStatusDisplay(record);
                const isExpanded = expandedReason === record.classId;
                const isEven = idx % 2 === 0;

                return (
                  <React.Fragment key={record.classId}>
                    <tr className={`hover:bg-purple-50/30 transition-colors ${isEven ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="px-5 py-3.5 text-gray-800 font-medium whitespace-nowrap text-[13px]">
                        {formatDate(record.startTime)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-[13px]">
                        {formatDay(record.startTime)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-[13px]">
                        {formatTime(record.startTime, record.endTime)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusDisplay.bg} ${statusDisplay.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotColor}`} />
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {statusDisplay.hasReason ? (
                          <button
                            onClick={() =>
                              setExpandedReason(isExpanded ? null : record.classId)
                            }
                            className={`p-1.5 rounded-full transition-all ${
                              isExpanded
                                ? "bg-purple-100 text-purple-600 shadow-sm"
                                : "hover:bg-purple-50 text-gray-400 hover:text-purple-500"
                            }`}
                            title="View reason"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-200 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                    {/* Expanded reason row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="px-0 py-0">
                          <div className="mx-5 my-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
                            <div className="flex items-start gap-2.5 text-xs">
                              <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-purple-700">Reason: </span>
                                <span className="text-gray-700 leading-relaxed">{getReason(record)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="mt-3 flex items-center gap-2 px-1">
        <Info className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        <p className="text-[11px] text-gray-400">
          Click on the <span className="inline-flex items-center"><Info className="w-3 h-3 inline" /></span> icon to view reason for Absent, Cancelled or Rescheduled classes.
        </p>
      </div>
    </div>
  );
}
