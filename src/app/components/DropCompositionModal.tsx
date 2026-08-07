"use client";

import { useState, useEffect } from "react";

interface DropStudent {
    studentId: string;
    name: string;
    phone: string;
    email: string;
    society: string;
    notes: string;
    renewalNotes: string;
    dropReason: string;
}

interface ReasonData {
    reason: string;
    count: number;
    percentage: number;
    students: DropStudent[];
}

interface DropCompositionData {
    totalDropped: number;
    composition: ReasonData[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

// Color palette for the bars
const BAR_COLORS = [
    { bg: "bg-red-500", text: "text-red-700", light: "bg-red-50", border: "border-red-200" },
    { bg: "bg-orange-500", text: "text-orange-700", light: "bg-orange-50", border: "border-orange-200" },
    { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-200" },
    { bg: "bg-purple-500", text: "text-purple-700", light: "bg-purple-50", border: "border-purple-200" },
    { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50", border: "border-blue-200" },
    { bg: "bg-teal-500", text: "text-teal-700", light: "bg-teal-50", border: "border-teal-200" },
    { bg: "bg-pink-500", text: "text-pink-700", light: "bg-pink-50", border: "border-pink-200" },
    { bg: "bg-indigo-500", text: "text-indigo-700", light: "bg-indigo-50", border: "border-indigo-200" },
    { bg: "bg-gray-500", text: "text-gray-700", light: "bg-gray-50", border: "border-gray-200" },
];

export default function DropCompositionModal({ isOpen, onClose }: Props) {
    const [data, setData] = useState<DropCompositionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedReason, setExpandedReason] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !data) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/Api/salesHead/studentPackage/retention/dropComposition");
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const maxPercentage = data ? Math.max(...data.composition.map(c => c.percentage), 1) : 100;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
                        <div>
                            <h2 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
                                📊 Drop Composition
                            </h2>
                            {data && (
                                <p className="text-[12px] text-gray-500 mt-0.5">
                                    <span className="font-bold text-red-600">{data.totalDropped}</span> total drops across{" "}
                                    <span className="font-bold">{data.composition.length}</span> reasons
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-[16px] cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : !data || data.composition.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-3">📭</div>
                                <div className="text-gray-400 text-sm">No drop data available yet</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.composition.map((item, index) => {
                                    const color = BAR_COLORS[index % BAR_COLORS.length];
                                    const isExpanded = expandedReason === item.reason;
                                    const barWidth = (item.percentage / maxPercentage) * 100;

                                    return (
                                        <div key={item.reason}>
                                            {/* Reason row — clickable */}
                                            <button
                                                onClick={() => setExpandedReason(isExpanded ? null : item.reason)}
                                                className={`w-full text-left rounded-xl p-3 transition-all cursor-pointer border ${
                                                    isExpanded
                                                        ? `${color.light} ${color.border} shadow-sm`
                                                        : "border-transparent hover:bg-gray-50"
                                                }`}
                                            >
                                                {/* Label row */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] ${isExpanded ? "rotate-90" : ""} transition-transform inline-block`}>
                                                            ▶
                                                        </span>
                                                        <span className="text-[13px] font-bold text-gray-800">
                                                            {item.reason}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[12px] font-black ${color.text}`}>
                                                            {item.percentage}%
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-semibold min-w-[40px] text-right">
                                                            {item.count} {item.count === 1 ? "drop" : "drops"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Bar */}
                                                <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${color.bg} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                                        style={{ width: `${Math.max(barWidth, 3)}%` }}
                                                    >
                                                        {barWidth > 15 && (
                                                            <span className="text-[10px] font-bold text-white">
                                                                {item.percentage}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Drill-down student list */}
                                            {isExpanded && (
                                                <div className={`mx-3 mt-1 mb-2 rounded-xl border ${color.border} overflow-hidden`}>
                                                    <div className={`px-4 py-2 ${color.light} border-b ${color.border}`}>
                                                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                                            Students dropped for: "{item.reason}"
                                                        </span>
                                                    </div>
                                                    <div className="max-h-[250px] overflow-y-auto">
                                                        <table className="w-full text-[12px]">
                                                            <thead>
                                                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase text-[10px] tracking-wider">#</th>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase text-[10px] tracking-wider">Name</th>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase text-[10px] tracking-wider">Phone</th>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase text-[10px] tracking-wider">Society</th>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase text-[10px] tracking-wider">Notes / Reason</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.students.map((s, si) => (
                                                                    <tr key={s.studentId + si} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                                        <td className="px-4 py-2 text-gray-400">{si + 1}</td>
                                                                        <td className="px-4 py-2">
                                                                            <div className="font-bold text-gray-900">{s.name}</div>
                                                                            {s.email && (
                                                                                <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{s.email}</div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-2">
                                                                            {s.phone ? (
                                                                                <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">
                                                                                    📞 {s.phone}
                                                                                </a>
                                                                            ) : "—"}
                                                                        </td>
                                                                        <td className="px-4 py-2">
                                                                            <span className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 text-[11px]">
                                                                                {s.society || "—"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-[11px] text-gray-600 max-w-[200px] truncate" title={`Reason: ${s.dropReason || "None"}\nRenewal Notes: ${s.renewalNotes || "None"}\nNotes: ${s.notes || "None"}`}>
                                                                            <span className="block font-medium text-gray-800">{s.dropReason || "No drop reason"}</span>
                                                                            <span className="block text-gray-500">{s.renewalNotes || s.notes || ""}</span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                            Click on any reason to see the students
                        </span>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-[12px] font-bold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
