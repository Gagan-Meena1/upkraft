import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Lead } from "@/app/salesHead/studentPackage/types";


interface Props {
    lead: Lead;
    onEdit: (l: Lead) => void;
    onHide: (id: string, studentId: string) => void;
    onStatusChange: (id: string, studentId: string, status: string) => void;
    onShowInfo: (studentId: string) => void;
}

const urgencyOf = (l: Lead) => {
    if (l.renewalStatus === "Renewed") return "renewed";
    if (l.completion >= 100) return "complete";
    if (l.daysLeft <= 0) return "overdue";   // ← add this before urgent
    if (l.daysLeft <= 7) return "urgent";
    if (l.daysLeft <= 20) return "soon";
    return "ok";
};

const getProgColor = (c: number) =>
    c >= 100 ? "#2563eb" : c >= 70 ? "#059669" : c >= 40 ? "#d97706" : "#dc2626";

const BORDER: Record<string, string> = {
    urgent: "#dc2626", soon: "#d97706",
    renewed: "#7c3aed", complete: "#2563eb", ok: "#059669",
    overdue: "#be123c",   // ← deep rose

};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    "Renewed": { bg: "#f3e8ff", color: "#7e22ce" },
    "YTR": { bg: "#dbeafe", color: "#1d4ed8" },
    "Dropped": { bg: "#fee2e2", color: "#b91c1c" },
    "Follow Up": { bg: "#fef3c7", color: "#b45309" },

};

function DaysPill({ l }: { l: Lead }) {
    const u = urgencyOf(l);
    if (u === "renewed") return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">♻ Renewed</span>;
    if (u === "complete") return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">✅ Complete</span>;
    if (u === "urgent") return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">🔴 {l.daysLeft}d</span>;
    if (u === "soon") return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">🟡 {l.daysLeft}d</span>;
    if (u === "overdue") return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">🚨 {Math.abs(l.daysLeft)}d ago</span>;

    return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">🟢 {l.daysLeft}d</span>;

}

export default function LeadRow({ lead: l, onEdit, onHide, onStatusChange, onShowInfo }: Props) {
    const u = urgencyOf(l);
    const s = STATUS_STYLE[l.renewalStatus] || { bg: "#f3f4f6", color: "#6b7280" };
    const [showNotes, setShowNotes] = useState(false);

    return (
        <>
            <tr
                className="border-b border-gray-100 bg-white transition-colors group hover:bg-indigo-200"
                style={{ borderLeft: `4px solid ${BORDER[u] || BORDER.ok}` }}
            >

                {/* Customer — sticky */}
                <td className="px-4 py-3 align-middle sticky left-0 bg-white group-hover:bg-indigo-200 transition-colors z-10">
                    <div className="font-bold text-gray-900 text-[12px] truncate max-w-[150px]" title={l.custName}>{l.custName || "Unknown"}</div>
                    <div 
                        className="text-[11px] text-gray-500 truncate max-w-[150px] cursor-pointer hover:text-indigo-600 hover:underline flex items-center gap-1"
                        onClick={() => onShowInfo(l.studentId)}
                        title="Click to view student details"
                    >
                        👤 {l.studName}
                    </div>
                </td>

                {/* Society — sticky */}
                <td className="px-4 py-3 align-middle sticky left-[160px] bg-white group-hover:bg-indigo-200 transition-colors z-10">
                    <div className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 font-medium truncate max-w-[110px]">{l.society || "—"}</div>
                </td>

                {/* Contact — sticky */}
                <td className="px-4 py-3 align-middle sticky left-[280px] bg-white group-hover:bg-indigo-200 transition-colors z-10 text-[11px]">
                    {l.phone && <div><a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">📞 {l.phone}</a></div>}
                    {l.email && <div className="text-[10px] text-gray-500 truncate max-w-[130px]">✉ {l.email}</div>}
                </td>

                {/* Tutor — sticky + right shadow to indicate freeze boundary */}
                <td className="px-4 py-3 align-middle sticky left-[420px] bg-white group-hover:bg-indigo-200 transition-colors z-10 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                    {l.tutorNames?.length > 1 ? (
                        <select className="text-[11px] font-semibold text-gray-800 border border-gray-200 rounded px-2 py-1 bg-white outline-none max-w-[130px] cursor-pointer">
                            {l.tutorNames.map((n, i) => <option key={i}>{n}</option>)}
                        </select>
                    ) : (
                        <div className="text-[11px] font-semibold text-gray-800 truncate max-w-[120px]">{l.tutorName || "—"}</div>
                    )}
                    <div className="text-[10px] text-gray-500">🎵 {l.instrument || "—"}</div>
                </td>

                {/* Start Date */}
                <td className="px-4 py-3 align-middle text-[11px] whitespace-nowrap text-gray-700">
                    {l.startDate
                        ? new Date(l.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                </td>

                <td className="px-4 py-3 align-middle text-[11px] font-semibold">{l.rm || "—"}</td>
                <td className="px-4 py-3 align-middle text-[11px] text-gray-600">{l.spoc || "—"}</td>
                <td className="px-4 py-3 align-middle text-[12px] font-bold text-emerald-600">{l.pkgAmount ? `₹${l.pkgAmount}` : "—"}</td>
                <td className="px-4 py-3 align-middle text-center font-bold text-emerald-600 text-[12px]">{l.completed}</td>
                <td className="px-4 py-3 align-middle text-center text-[12px] font-medium">{l.totalPkg}</td>

                {/* Progress */}
                <td className="px-4 py-3 align-middle">
                    <div className="w-[80px]">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(l.completion, 100)}%`, backgroundColor: getProgColor(l.completion) }} />
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: getProgColor(l.completion) }}>{l.completion}%</div>
                    </div>
                </td>

                <td className="px-4 py-3 align-middle text-center font-bold text-[12px]"
                    style={{ color: l.remaining <= 2 ? "#dc2626" : "inherit" }}>{l.remaining}</td>
                <td className="px-4 py-3 align-middle text-center font-bold text-[12px]"
                    style={{ color: l.cancelled > 0 ? "#d97706" : "#9ca3af" }}>{l.cancelled}</td>
                <td className="px-4 py-3 align-middle text-[11px] whitespace-nowrap">
                    {l.lastClassDate ? new Date(l.lastClassDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3 align-middle"><DaysPill l={l} /></td>

                {/* Renewal Status */}
                <td className="px-4 py-3 align-middle">
                    <select className="text-[11px] font-bold rounded px-1 py-1 cursor-pointer outline-none border border-transparent hover:border-gray-300"
                        style={{ backgroundColor: s.bg, color: s.color }}
                        value={l.renewalStatus}
                        onChange={e => onStatusChange(l.id, l.studentId, e.target.value)}>
                        <option>YTR</option>
                        <option>Follow Up</option>
                        <option>Renewed</option>
                        <option>Dropped</option>
                    </select>
                </td>

                {/* Notes — click to open popup */}
                <td className="px-4 py-3 align-middle">
                    <div className="max-w-[180px] cursor-pointer hover:bg-purple-100/60 rounded px-1 py-0.5 -mx-1 transition-colors"
                        onClick={() => setShowNotes(true)}>
                        {(l.renewalClasses > 0 || l.renewalFrequency || l.renewalAmount > 0) && (
                            <div className="text-[10px] text-indigo-600 font-semibold line-clamp-1 mb-0.5">
                                📦 {l.renewalClasses || 0} cls · {l.renewalFrequency || "—"} · ₹{l.renewalAmount || 0}
                            </div>
                        )}
                        {l.renewalNotes && (
                            <div className="text-[10px] text-purple-600 font-semibold line-clamp-1 mb-0.5">♻ {l.renewalNotes}</div>
                        )}
                        <div className="text-[11px] text-gray-600 line-clamp-1">{l.notes || "—"}</div>
                    </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(l)}
                            className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors shadow-sm" title="Edit">
                            ✏️
                        </button>
                        <button onClick={() => onHide(l.id, l.studentId)}
                            className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm" title="Hide">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Notes Popup */}
            {showNotes && (
                <tr>
                    <td colSpan={18} className="p-0">
                        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4"
                            onClick={() => setShowNotes(false)}>
                            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                                    <div>
                                        <h3 className="text-[14px] font-bold text-gray-900">Notes</h3>
                                        <p className="text-[11px] text-gray-500">{l.custName} — {l.instrument || "Course"}</p>
                                    </div>
                                    <button onClick={() => setShowNotes(false)}
                                        className="bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                                        ✕
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex flex-col gap-4">
                                    {/* Renewal Details */}
                                    {(l.renewalClasses > 0 || l.renewalFrequency || l.renewalAmount > 0) && (
                                        <div>
                                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">📦 Renewal Package</div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-center">
                                                    <div className="text-[10px] text-indigo-400 font-semibold uppercase">Classes</div>
                                                    <div className="text-[15px] font-bold text-indigo-700">{l.renewalClasses || "—"}</div>
                                                </div>
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-center">
                                                    <div className="text-[10px] text-indigo-400 font-semibold uppercase">Frequency</div>
                                                    <div className="text-[13px] font-bold text-indigo-700">{l.renewalFrequency || "—"}</div>
                                                </div>
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-center">
                                                    <div className="text-[10px] text-indigo-400 font-semibold uppercase">Amount</div>
                                                    <div className="text-[15px] font-bold text-indigo-700">{l.renewalAmount ? `₹${l.renewalAmount}` : "—"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {l.renewalNotes ? (
                                        <div>
                                            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">♻ Renewal Notes</div>
                                            <div className="text-[13px] text-gray-800 bg-purple-50 border border-purple-100 rounded-lg p-3">{l.renewalNotes}</div>
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-gray-400 italic">No renewal notes</div>
                                    )}

                                    {l.notes ? (
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">📝 General Notes</div>
                                            <div className="text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">{l.notes}</div>
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-gray-400 italic">No general notes</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}