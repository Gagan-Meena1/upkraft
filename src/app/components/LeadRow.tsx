import { Trash2 } from "lucide-react";
import { Lead } from "@/app/salesHead/studentPackage/types";


interface Props {
    lead: Lead;
    onEdit: (l: Lead) => void;
    onHide: (id: string, studentId: string) => void;
    onStatusChange: (id: string, studentId: string, status: string) => void;
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
    "In Discussion": { bg: "#dbeafe", color: "#1d4ed8" },
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

export default function LeadRow({ lead: l, onEdit, onHide, onStatusChange }: Props) {
    const u = urgencyOf(l);
    const s = STATUS_STYLE[l.renewalStatus] || { bg: "#f3f4f6", color: "#6b7280" };

    return (
        <tr
            className="border-b border-gray-100 bg-white transition-colors group hover:bg-purple-50"
            style={{ borderLeft: `4px solid ${BORDER[u] || BORDER.ok}` }}
        >

            {/* Customer — sticky */}
            <td className="px-4 py-3 align-middle sticky left-0 bg-white group-hover:bg-purple-50 transition-colors z-10">
                <div className="font-bold text-gray-900 text-[12px] truncate max-w-[150px]" title={l.custName}>{l.custName || "Unknown"}</div>
                <div className="text-[11px] text-gray-500 truncate max-w-[150px]">👤 {l.studName}</div>
            </td>

            {/* Society — sticky */}
            <td className="px-4 py-3 align-middle sticky left-[160px] bg-white group-hover:bg-purple-50 transition-colors z-10">
                <div className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 font-medium truncate max-w-[110px]">{l.society || "—"}</div>
            </td>

            {/* Contact — sticky */}
            <td className="px-4 py-3 align-middle sticky left-[280px] bg-white group-hover:bg-purple-50 transition-colors z-10 text-[11px]">
                {l.phone && <div><a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">📞 {l.phone}</a></div>}
                {l.email && <div className="text-[10px] text-gray-500 truncate max-w-[130px]">✉ {l.email}</div>}
            </td>

            {/* Tutor — sticky + right shadow to indicate freeze boundary */}
            <td className="px-4 py-3 align-middle sticky left-[420px] bg-white group-hover:bg-purple-50 transition-colors z-10 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                {l.tutorNames?.length > 1 ? (
                    <select className="text-[11px] font-semibold text-gray-800 border border-gray-200 rounded px-2 py-1 bg-white outline-none max-w-[130px] cursor-pointer">
                        {l.tutorNames.map((n, i) => <option key={i}>{n}</option>)}
                    </select>
                ) : (
                    <div className="text-[11px] font-semibold text-gray-800 truncate max-w-[120px]">{l.tutorName || "—"}</div>
                )}
                <div className="text-[10px] text-gray-500">🎵 {l.instrument || "—"}</div>
            </td>

            {/* Type */}
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
                    <option>Not Contacted</option>
                    <option>In Discussion</option>
                    <option>Renewed</option>
                    <option>Dropped</option>
                    <option>Follow Up</option>
                </select>
            </td>

            <td className="px-4 py-3 align-middle">
                <div className="text-[11px] text-gray-600 line-clamp-2 max-w-[150px]">{l.notes || "—"}</div>
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
    );
}