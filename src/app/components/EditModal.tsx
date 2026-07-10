import { Lead } from "@/app/salesHead/studentPackage/types";

interface Props {
    lead: Lead;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    onChange: (updated: Lead) => void;
}

const FIELDS = [
    { label: "Customer Name", key: "custName", type: "text", required: true },
    { label: "Phone", key: "phone", type: "text", required: true },
    { label: "Email", key: "email", type: "email", required: false },
    { label: "Society", key: "society", type: "text", required: false },
    { label: "Sales SPOC", key: "spoc", type: "text", required: false },
    { label: "RM", key: "rm", type: "text", required: false },  // ← add

];

export default function EditModal({ lead, onClose, onSave, onChange }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-[15px] font-bold">Edit — {lead.custName}</h3>
                    <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center">✕</button>
                </div>

                <form onSubmit={onSave} className="overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Summary strip */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 grid grid-cols-3 gap-3">
                        {[["Completion", `${lead.completion}%`], ["Days Left", `${lead.daysLeft}d`], ["Remaining", `${lead.remaining}`]].map(([label, val]) => (
                            <div key={label}>
                                <div className="text-[10px] text-gray-500 uppercase font-semibold">{label}</div>
                                <div className="text-[14px] font-extrabold text-purple-700">{val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {FIELDS.map(f => (
                            <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">{f.label}</label>
                                <input required={f.required} type={f.type}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                                    value={(lead as any)[f.key]}
                                    onChange={e => onChange({ ...lead, [f.key]: e.target.value })} />
                            </div>
                        ))}

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">Renewal Status</label>
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 bg-white cursor-pointer"
                                value={lead.renewalStatus} onChange={e => onChange({ ...lead, renewalStatus: e.target.value })}>
                                <option>Not Contacted</option>
                                <option>In Discussion</option>
                                <option>Renewed</option>
                                <option>Dropped</option>
                                <option>Follow Up</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">Notes</label>
                            <textarea rows={3} className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 resize-none"
                                value={lead.notes} onChange={e => onChange({ ...lead, notes: e.target.value })} />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400">* Calculated fields are read-only and derived from attendance records.</p>

                    <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#5C16C5] text-white rounded-lg text-xs font-semibold hover:bg-[#3d0e88] transition-colors">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}