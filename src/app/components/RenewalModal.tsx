import { Lead } from "@/app/salesHead/studentPackage/types";

interface Props {
    lead: Lead;
    option: "same" | "changed";
    notes: string;
    renewalClasses: number;
    renewalFrequency: string;
    renewalAmount: number;
    onOptionChange: (opt: "same" | "changed") => void;
    onNotesChange: (val: string) => void;
    onRenewalClassesChange: (val: number) => void;
    onRenewalFrequencyChange: (val: string) => void;
    onRenewalAmountChange: (val: number) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function RenewalModal({
    lead, option, notes,
    renewalClasses, renewalFrequency, renewalAmount,
    onOptionChange, onNotesChange,
    onRenewalClassesChange, onRenewalFrequencyChange, onRenewalAmountChange,
    onSubmit, onClose
}: Props) {
    const canSubmit = renewalClasses > 0 && renewalFrequency.trim() && renewalAmount > 0
        && (option === "same" || (option === "changed" && notes.trim()));

    return (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-900">Mark as Renewed</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">{lead.custName} — {lead.instrument || "Course"}</p>
                    </div>
                    <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-600">✕</button>
                </div>

                <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                    {/* Renewal Details */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Renewal Details</label>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">No. of Classes</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200 transition-all"
                                    value={renewalClasses || ""}
                                    onChange={e => onRenewalClassesChange(parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 24"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Frequency</label>
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 bg-white cursor-pointer transition-all"
                                    value={renewalFrequency}
                                    onChange={e => onRenewalFrequencyChange(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="1x/week">1x/week</option>
                                    <option value="2x/week">2x/week</option>
                                    <option value="3x/week">3x/week</option>
                                    <option value="4x/week">4x/week</option>
                                    <option value="5x/week">5x/week</option>
                                    <option value="Daily">Daily</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Total Amount</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200 transition-all"
                                    value={renewalAmount || ""}
                                    onChange={e => onRenewalAmountChange(parseInt(e.target.value) || 0)}
                                    placeholder="₹"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Option selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Renewal Type</label>

                        <label
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${option === "same"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => onOptionChange("same")}
                        >
                            <input
                                type="radio"
                                name="renewalOption"
                                checked={option === "same"}
                                onChange={() => onOptionChange("same")}
                                className="accent-purple-600 w-4 h-4"
                            />
                            <div>
                                <div className="text-[13px] font-semibold text-gray-800">Same as Previous</div>
                                <div className="text-[11px] text-gray-500">Package renewed with the same terms</div>
                            </div>
                        </label>

                        <label
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${option === "changed"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => onOptionChange("changed")}
                        >
                            <input
                                type="radio"
                                name="renewalOption"
                                checked={option === "changed"}
                                onChange={() => onOptionChange("changed")}
                                className="accent-purple-600 w-4 h-4"
                            />
                            <div>
                                <div className="text-[13px] font-semibold text-gray-800">Changed</div>
                                <div className="text-[11px] text-gray-500">Package terms have changed — please add notes</div>
                            </div>
                        </label>
                    </div>

                    {/* Notes input — shown only when "Changed" is selected */}
                    {option === "changed" && (
                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Renewal Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Describe what changed (e.g., price, frequency, instrument…)"
                                className="px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200 resize-none transition-all"
                                value={notes}
                                onChange={e => onNotesChange(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="px-4 py-2 bg-[#5C16C5] text-white rounded-lg text-xs font-semibold hover:bg-[#3d0e88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ♻ Confirm Renewal
                    </button>
                </div>
            </div>
        </div>
    );
}
