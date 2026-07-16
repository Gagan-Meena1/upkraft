"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Music,
  ClipboardList,
  IndianRupee,
} from "lucide-react";
import AttendanceHistory from "@/app/components/AttendanceHistory";

interface StudentInfoPopupProps {
  studentId: string;
  studentName?: string;
  onClose: () => void;
}

interface ContactInfo {
  username: string;
  email: string;
  contact: string;
  address: string;
  city: string;
}

interface PackageInfo {
  courseId: string;
  courseName: string;
  instrument: string;
  totalClasses: number;
  completedClasses: number;
  remainingClasses: number;
  lastClass: { title: string; startTime: string; _id: string } | null;
  nextClass: { title: string; startTime: string; _id: string } | null;
  endDate: string | null;
  packageEndDate: string | null;
  paymentCycle: number;
}

interface PaymentHistoryItem {
  cycle: number;
  amount: number;
  classesPaid: number;
  date: string | null;
}

interface PaymentHistoryGroup {
  courseId: string;
  courseName: string;
  history: PaymentHistoryItem[];
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div className={`h-4 ${width} bg-gray-200 rounded animate-pulse`} />
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
      <SkeletonLine width="w-1/3" />
      <SkeletonLine width="w-2/3" />
      <SkeletonLine width="w-1/2" />
      <SkeletonLine width="w-3/4" />
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "short",
  });
}

export default function StudentInfoPopup({
  studentId,
  studentName,
  onClose,
}: StudentInfoPopupProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryGroup[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/Api/relationship-manager/student/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch student info");
        }

        // Show contact info immediately
        setContactInfo(data.contactInfo);
        setPackages(data.packages || []);
        setPaymentHistory(data.paymentHistory || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const initials = (contactInfo?.username || studentName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                {contactInfo ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {contactInfo.username || "—"}
                    </h2>
                    {contactInfo.email && (
                      <p className="text-sm text-gray-500 truncate">{contactInfo.email}</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <SkeletonLine width="w-40" />
                    <SkeletonLine width="w-56" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View Attendance button */}
              {!showAttendance && (
                <button
                  onClick={() => setShowAttendance(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  View Attendance
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="px-6 py-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Body — conditional view */}
        {showAttendance ? (
          <div className="px-6 py-5 min-h-[400px]">
            <AttendanceHistory
              studentId={studentId}
              studentName={contactInfo?.username || studentName}
              onBack={() => setShowAttendance(false)}
            />
          </div>
        ) : (
        <>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Package Details */}
          <div className="space-y-4">
            {loading ? (
              <>
                <SkeletonBlock />
                <SkeletonBlock />
              </>
            ) : packages.length > 0 ? (
              packages.map((pkg, idx) => (
                <div
                  key={pkg.courseId + idx}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  {/* Package header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Package Details
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 mt-0.5 font-medium">
                      {pkg.courseName}
                    </p>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Remaining classes pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Remaining Classes</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        {pkg.remainingClasses} classes left
                      </span>
                    </div>

                    {/* Total / Completed */}
                    <div className="flex gap-3">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                          Total
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {pkg.totalClasses}
                        </div>
                      </div>
                      <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                          Completed
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {pkg.completedClasses}
                        </div>
                      </div>
                    </div>

                    {/* Previous / Upcoming class */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                            Previous Class
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-800">
                          {pkg.lastClass
                            ? formatDate(pkg.lastClass.startTime)
                            : "—"}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[10px] uppercase tracking-wide text-blue-500 font-medium">
                            Upcoming Class
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-800">
                          {pkg.nextClass
                            ? formatDate(pkg.nextClass.startTime)
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {/* End date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <span>Package End</span>
                      <span className="font-medium text-gray-700">
                        {formatDate(pkg.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-gray-200 p-6 text-center">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No package info available</p>
              </div>
            )}
          </div>

          {/* Right: Contact + Meta */}
          <div className="space-y-4">
            {/* Contact Details Card */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    Contact Details
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {loading ? (
                  <>
                    <SkeletonLine width="w-2/3" />
                    <SkeletonLine width="w-1/2" />
                    <SkeletonLine width="w-3/4" />
                  </>
                ) : contactInfo ? (
                  <>
                    {contactInfo.contact && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                            Phone
                          </div>
                          <div className="text-sm text-gray-800">
                            {contactInfo.contact}
                          </div>
                        </div>
                      </div>
                    )}

                    {contactInfo.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                            Email
                          </div>
                          <div className="text-sm text-gray-800">
                            {contactInfo.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {(contactInfo.address || contactInfo.city) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                            Address
                          </div>
                          <div className="text-sm text-gray-800">
                            {[contactInfo.address, contactInfo.city]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </div>
                      </div>
                    )}

                    {!contactInfo.contact &&
                      !contactInfo.email &&
                      !contactInfo.address &&
                      !contactInfo.city && (
                        <p className="text-sm text-gray-400 italic">
                          No contact info available
                        </p>
                      )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Payment Cycle + Instrument */}
            {!loading && packages.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="p-4 space-y-3">
                  {packages.map((pkg, idx) => (
                    <div key={pkg.courseId + idx} className="space-y-2">
                      {idx > 0 && <hr className="border-gray-100" />}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span>Payment Cycle</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {pkg.paymentCycle}
                        </span>
                      </div>
                      {pkg.instrument && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Music className="w-4 h-4 text-gray-400" />
                            <span>Instrument</span>
                          </div>
                          <span className="text-sm font-semibold text-purple-700">
                            {pkg.instrument}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && <SkeletonBlock />}
          </div>
        </div>

        {/* Payment History Section */}
        {!loading && paymentHistory.length > 0 && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setShowPaymentHistory(!showPaymentHistory)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                Payment History
              </h3>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showPaymentHistory ? "rotate-180" : ""}`} 
              />
            </button>
            {showPaymentHistory && (
            <div className="space-y-6 mt-4">
              {paymentHistory.map((group) => (
                <div key={group.courseId} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-sm font-semibold text-gray-800">
                    {group.courseName}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-medium">Cycle</th>
                          <th className="px-4 py-3 font-medium">Amount Paid</th>
                          <th className="px-4 py-3 font-medium">Classes Paid</th>
                          <th className="px-4 py-3 font-medium">Start Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.history.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              Cycle {item.cycle}
                            </td>
                            <td className="px-4 py-3 text-emerald-600 font-semibold">
                              ₹{item.amount || 0}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {item.classesPaid || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {formatDate(item.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
        </>
        )}
      </div>

      <style jsx>{`
        @keyframes animate-in-keyframes {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-in {
          animation: animate-in-keyframes 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
