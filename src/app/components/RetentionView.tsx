"use client";

import { useState, useEffect } from "react";

interface MonthData {
    month: string;
    label: string;
    total: number;
    active: number;
    churned: number;
    retention: number;
}

interface Props {
    months: MonthData[];
    loading: boolean;
    selectedMonth: string | null;
    onMonthClick: (month: string) => void;
}

export default function RetentionView({ months, loading, selectedMonth, onMonthClick }: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 px-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[140px] rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    const maxTotal = Math.max(...months.map(m => m.total), 1);

    return (
        <div className="px-5">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                {months.map(m => {
                    const isSelected = selectedMonth === m.month;
                    const barHeight = m.total > 0 ? Math.max((m.active / maxTotal) * 60, 4) : 0;
                    const churnBarHeight = m.total > 0 ? Math.max((m.churned / maxTotal) * 60, 4) : 0;

                    return (
                        <button
                            key={m.month}
                            onClick={() => onMonthClick(m.month)}
                            className={`
                                relative rounded-xl p-3 text-left transition-all cursor-pointer border-2
                                ${isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-200/50 scale-[1.02]"
                                    : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                                }
                            `}
                        >
                            {/* Month label */}
                            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {m.label}
                            </div>

                            {/* Total count */}
                            <div className="text-[22px] font-black text-gray-900 leading-none mb-1">
                                {m.total}
                            </div>

                            {/* Retention % */}
                            <div className={`text-[13px] font-bold ${m.retention >= 70 ? "text-green-600" : m.retention >= 40 ? "text-amber-600" : "text-red-500"}`}>
                                {m.total > 0 ? `${m.retention}%` : "—"}
                            </div>

                            {/* Mini bar chart */}
                            <div className="flex items-end gap-[2px] mt-2 h-[60px]">
                                <div
                                    className="flex-1 rounded-t bg-green-400 transition-all"
                                    style={{ height: `${barHeight}px` }}
                                    title={`Active: ${m.active}`}
                                />
                                <div
                                    className="flex-1 rounded-t bg-red-400 transition-all"
                                    style={{ height: `${churnBarHeight}px` }}
                                    title={`Churned: ${m.churned}`}
                                />
                            </div>

                            {/* Active / Churned counts */}
                            <div className="flex justify-between mt-1 text-[9px] font-semibold">
                                <span className="text-green-600">🟢 {m.active}</span>
                                <span className="text-red-500">🔴 {m.churned}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-green-400 inline-block" /> Active (last class ≥ today)
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-400 inline-block" /> Churned (last class &lt; today)
                </div>
            </div>
        </div>
    );
}
