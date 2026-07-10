import { Filters, Options, CardFilter } from "@/app/salesHead/studentPackage/types";
import { CARDS } from "@/app/salesHead/studentPackage/constants";

interface Props {
    search: string;
    filters: Filters;
    options: Options;
    page: number;
    totalPages: number;
    totalItems: number;
    activeCard: CardFilter;
    onSearchChange: (v: string) => void;
    onFilterChange: (key: keyof Filters, value: string) => void;
    onPageChange: (p: number) => void;
    onClear: () => void;
    onCardClear: () => void;
}

export default function FiltersBar({
    search, filters, options, page, totalPages, totalItems,
    activeCard, onSearchChange, onFilterChange, onPageChange, onClear, onCardClear
}: Props) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-white border-y border-gray-200 shadow-sm">
                {/* Search */}
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-[260px]">
                    <span className="text-gray-400 text-sm">🔍</span>
                    <input type="text" value={search} onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search name, phone, email…"
                        className="border-none outline-none text-[13px] w-full bg-transparent" />
                </div>

                <Select label="All Societies" value={filters.society} onChange={v => onFilterChange("society", v)} options={options.societies} />
                <Select label="All Tutors" value={filters.tutorName} onChange={v => onFilterChange("tutorName", v)} options={options.tutorNames} />
                <Select label="All RMs" value={filters.rm} onChange={v => onFilterChange("rm", v)} options={options.rmNames} />
                <Select label="All Sales SPOC" value={filters.spoc} onChange={v => onFilterChange("spoc", v)} options={options.spocNames} />

                {/* Type */}
                <select value={filters.type} onChange={e => onFilterChange("type", e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none focus:border-purple-600 cursor-pointer">
                    <option value="">HT / Group</option>
                    <option value="HOME TUTOR">Home Tutor</option>
                    <option value="GROUP">Group</option>
                </select>

                {/* Renewal Status */}
                <select value={filters.renewalStatus} onChange={e => onFilterChange("renewalStatus", e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none focus:border-purple-600 cursor-pointer">
                    <option value="">All Renewal Status</option>
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Follow Up">Follow Up</option>
                </select>

                {/* Pagination */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-gray-500">{totalItems} leads</span>
                    <button disabled={page === 1} onClick={() => onPageChange(page - 1)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">Prev</button>
                    <span className="text-xs font-semibold">Pg {page} / {totalPages || 1}</span>
                    <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">Next</button>
                    <button onClick={onClear} className="text-xs text-purple-600 font-semibold hover:underline">Clear</button>
                </div>
            </div>

            {/* Active card label */}
            {activeCard !== "urgent" && (
                <div className="px-5 py-2 text-[12px] text-gray-600">
                    Showing: <span className="font-bold text-purple-700">{CARDS.find(c => c.key === activeCard)?.label}</span>
                    {" "}— sorted by nearest end date
                    <button onClick={onCardClear} className="ml-2 text-gray-400 hover:text-gray-600 text-[11px]">✕ clear</button>
                </div>
            )}
        </>
    );
}

// Small reusable select
function Select({ label, value, onChange, options }: {
    label: string; value: string;
    onChange: (v: string) => void; options: string[];
}) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none focus:border-purple-600 cursor-pointer">
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}