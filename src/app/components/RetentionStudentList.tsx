"use client";

import { toast } from "react-hot-toast";

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

interface Props {
    monthLabel: string;
    students: Student[];
    loading: boolean;
    onConsiderToggle: (studentId: string, consider: boolean) => void;
}

export default function RetentionStudentList({ monthLabel, students, loading, onConsiderToggle }: Props) {
    if (loading) {
        return (
            <div className="px-5 mt-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="px-5 mt-4">
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                    <div className="text-3xl mb-2">📭</div>
                    <div className="text-gray-400 text-sm">No students started in {monthLabel}</div>
                </div>
            </div>
        );
    }

    const activeCount = students.filter(s => s.consider && s.status === "active").length;
    const churnedCount = students.filter(s => s.consider && s.status === "churned").length;
    const excludedCount = students.filter(s => !s.consider).length;

    const formatDate = (iso: string | null) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <div className="px-5 mt-4">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
                    <div>
                        <h3 className="text-[14px] font-bold text-gray-900">
                            Students who started in <span className="text-purple-700">{monthLabel}</span>
                        </h3>
                        <div className="flex gap-4 mt-1 text-[11px] font-semibold">
                            <span className="text-green-600">🟢 {activeCount} Active</span>
                            <span className="text-red-500">🔴 {churnedCount} Churned</span>
                            {excludedCount > 0 && <span className="text-gray-400">⊘ {excludedCount} Excluded</span>}
                            <span className="text-gray-600">Total: {students.length}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                        <thead>
                            <tr className="bg-[#faf9ff] border-b border-gray-200">
                                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Name</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Phone</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Society</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 uppercase text-[10px] tracking-wider">First Class</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Last Class</th>
                                <th className="px-4 py-2.5 text-center font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Status</th>
                                <th className="px-4 py-2.5 text-center font-semibold text-gray-600 uppercase text-[10px] tracking-wider">Consider</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr
                                    key={s.studentId}
                                    className={`border-b border-gray-50 transition-colors [&:hover>td]:bg-purple-50 ${!s.consider ? "opacity-40" : ""}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-gray-900">{s.name}</div>
                                        {s.email && <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{s.email}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {s.phone ? (
                                            <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">📞 {s.phone}</a>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 text-[11px]">
                                            {s.society || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{formatDate(s.firstClassDate)}</td>
                                    <td className="px-4 py-3 text-gray-700">{formatDate(s.dynamicEndDate)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`
                                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                                            ${s.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }
                                        `}>
                                            {s.status === "active" ? "🟢 Active" : "🔴 Churned"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => onConsiderToggle(s.studentId, !s.consider)}
                                            className={`
                                                px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border
                                                ${s.consider
                                                    ? "bg-green-50 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                                    : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                                }
                                            `}
                                            title={s.consider ? "Click to exclude from retention" : "Click to include in retention"}
                                        >
                                            {s.consider ? "✓ Included" : "✗ Excluded"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
