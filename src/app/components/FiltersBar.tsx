"use client";
import { useState, useRef, useEffect } from "react";
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

                <MultiSelect label="Societies" selected={filters.society as string[]} options={options.societies} onChange={v => onFilterChange("society", v)} />
                <MultiSelect label="Tutors" selected={filters.tutorName as string[]} options={options.tutorNames} onChange={v => onFilterChange("tutorName", v)} />
                <MultiSelect label="RMs" selected={filters.rm as string[]} options={options.rmNames} onChange={v => onFilterChange("rm", v)} />
                <MultiSelect label="Sales SPOC" selected={filters.spoc as string[]} options={options.spocNames} onChange={v => onFilterChange("spoc", v)} />

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

// ─── Multi-select dropdown with checkboxes ───────────────────────────────────
function MultiSelect({ label, selected, options, onChange }: {
    label: string;
    selected: string[];
    options: string[];
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const buttonLabel = selected.length === 0
        ? `All ${label}`
        : selected.length === 1
            ? selected[0].length > 14 ? selected[0].slice(0, 14) + "…" : selected[0]
            : `${selected.length} ${label}`;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer flex items-center gap-1.5 min-w-[100px] transition-colors ${
                    selected.length > 0
                        ? "border-purple-400 bg-purple-50 text-purple-700 font-semibold"
                        : "border-gray-300 bg-white text-gray-700"
                }`}
            >
                <span className="truncate max-w-[120px]">{buttonLabel}</span>
                <svg className={`w-3 h-3 ml-auto transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">No options</div>
                    ) : (
                        options.map(opt => {
                            const isSelected = selected.includes(opt);
                            return (
                                <label
                                    key={opt}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-purple-50 transition-colors ${
                                        isSelected ? "bg-purple-50 font-medium text-purple-700" : "text-gray-700"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onChange(opt)}
                                        className="accent-purple-600 w-3.5 h-3.5"
                                    />
                                    <span className="truncate">{opt}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}