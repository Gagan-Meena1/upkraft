import SkeletonRow from "./SkeletonRow";
import LeadRow from "./LeadRow";
const HEADERS = [
    { label: "Customer / Student", className: "sticky left-0 z-20 bg-[#faf9ff] min-w-[160px]" },
    { label: "Society", className: "sticky left-[160px] z-20 bg-[#faf9ff] min-w-[120px]" },
    { label: "Contact", className: "sticky left-[280px] z-20 bg-[#faf9ff] min-w-[140px]" },
    { label: "Tutor / Instrument", className: "sticky left-[420px] z-20 bg-[#faf9ff] min-w-[150px] shadow-[2px_0_4px_rgba(0,0,0,0.06)]" },
    { label: "Start Date", className: "" },   // ← replaced Type
    { label: "RM", className: "" },
    { label: "Sales SPOC", className: "" },
    { label: "Pkg Amount", className: "" },
    { label: "Completed", className: "" },
    { label: "Total", className: "" },
    { label: "Completion %", className: "" },
    { label: "Remaining", className: "" },
    { label: "Cancel", className: "" },
    { label: "Last Class", className: "" },
    { label: "Days Left", className: "" },
    { label: "Renewal Status", className: "" },
    { label: "Notes", className: "" },
    { label: "Action", className: "" },
];

export default function LeadTable({ leads, loading, onEdit, onHide, onStatusChange }: Props) {
    return (
        <div className="px-5 overflow-x-auto pb-8 mt-2">
            <div className="rounded-xl border border-gray-200">
                <table className="w-full border-collapse bg-white min-w-[1700px] text-[12px]">
                    <thead className="bg-[#faf9ff] border-b-2 border-purple-100">
                        <tr>
                            {HEADERS.map(h => (
                                <th key={h.label}
                                    className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${h.className}`}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : leads.length === 0 ? (
                            <tr>
                                <td colSpan={18} className="text-center py-16 text-gray-400">
                                    <div className="text-3xl mb-2">🔍</div>
                                    No students match your filters
                                </td>
                            </tr>
                        ) : leads.map(l => (
                            <LeadRow key={l.id} lead={l} onEdit={onEdit} onHide={onHide} onStatusChange={onStatusChange} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}