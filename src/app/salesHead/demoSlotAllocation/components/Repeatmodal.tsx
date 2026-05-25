import React from "react";
import { format, parseISO, addDays } from "date-fns";

interface RepeatModalProps {
    selectedSlots: Set<string>;
    repeatType: "daily" | "weekly";
    onRepeatTypeChange: (type: "daily" | "weekly") => void;
    selectedDays: number[];
    repeatStartDate: string;
    onStartDateChange: (date: string) => void;
    repeatEndDate: string;
    onEndDateChange: (date: string) => void;
    onClose: () => void;
    onApply: () => void;
    getPreviewSlots: () => string[];
    getAllowedDays: () => number[];
    onToggleDay: (day: number) => void;
}

const DAYS = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];

const RepeatModal: React.FC<RepeatModalProps> = ({
    selectedSlots,
    repeatType,
    onRepeatTypeChange,
    selectedDays,
    repeatStartDate,
    onStartDateChange,
    repeatEndDate,
    onEndDateChange,
    onClose,
    onApply,
    getAllowedDays,
    onToggleDay,
}) => {
    const getPreview = (): string[] => {
        if (!repeatStartDate || !repeatEndDate || selectedSlots.size === 0) return [];
        const preview: string[] = [];
        const start = parseISO(repeatStartDate);
        const end = parseISO(repeatEndDate);
        let cur = new Date(start);
        while (cur <= end) {
            const dow = cur.getDay();
            const include = repeatType === "daily" || selectedDays.includes(dow);
            if (include) {
                selectedSlots.forEach(key => {
                    const parts = key.split("-");
                    const origDate = parts.slice(0, 3).join("-");
                    const hour = parseInt(parts[parts.length - 1]);
                    const origDow = parseISO(origDate).getDay();
                    if (repeatType === "daily" || origDow === dow) {
                        preview.push(`${format(cur, "EEE dd MMM")} · ${String(hour).padStart(2, "0")}:00`);
                    }
                });
            }
            cur = addDays(cur, 1);
        }
        return preview;
    };

    const preview = getPreview();
    const allowedDays = getAllowedDays();

    return (
        <div className="sm-overlay show" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="sm-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="mh">
                    <h3>🔁 Repeat Slots</h3>
                    <button className="mclose" onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div className="mb" style={{ maxHeight: "70vh", overflowY: "auto" }}>

                    {/* Selected slots summary */}
                    <div style={{
                        background: "var(--pl)", border: "1.5px solid var(--p)",
                        borderRadius: 8, padding: "10px 14px", marginBottom: 16
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--p)", marginBottom: 4 }}>
                            {selectedSlots.size} slot{selectedSlots.size !== 1 ? "s" : ""} selected
                        </div>
                        <div style={{ fontSize: 11, color: "var(--p)", opacity: 0.8 }}>
                            {Array.from(selectedSlots).sort().slice(0, 3).map(key => {
                                const parts = key.split("-");
                                const date = parts.slice(0, 3).join("-");
                                const hour = parseInt(parts[parts.length - 1]);
                                return (
                                    <span key={key} style={{ marginRight: 8 }}>
                                        {format(parseISO(date), "EEE dd MMM")} {String(hour).padStart(2, "0")}:00
                                    </span>
                                );
                            })}
                            {selectedSlots.size > 3 && <span>+{selectedSlots.size - 3} more</span>}
                        </div>
                    </div>

                    {/* Repeat type */}
                    <div className="sec-label">Repeat Pattern</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        {(["weekly", "daily"] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => onRepeatTypeChange(type)}
                                className="sm-btn"
                                style={{
                                    flex: 1,
                                    background: repeatType === type ? "var(--p)" : "var(--bg2)",
                                    color: repeatType === type ? "#fff" : "var(--text2)",
                                    border: `1.5px solid ${repeatType === type ? "var(--p)" : "var(--bd)"}`,
                                    fontWeight: 600,
                                    fontSize: 12,
                                }}
                            >
                                {type === "weekly" ? "📅 Weekly" : "🔄 Daily"}
                            </button>
                        ))}
                    </div>

                    {/* Day selector — weekly only */}
                    {repeatType === "weekly" && (
                        <>
                            <div className="sec-label">Repeat on Days</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                                {DAYS.map(day => {
                                    const isAllowed = allowedDays.includes(day.value);
                                    const isSelected = selectedDays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            onClick={() => onToggleDay(day.value)}
                                            disabled={!isAllowed}
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                border: `1.5px solid ${isSelected ? "var(--p)" : "var(--bd)"}`,
                                                background: isSelected ? "var(--p)" : isAllowed ? "var(--bg2)" : "var(--bg)",
                                                color: isSelected ? "#fff" : isAllowed ? "var(--text)" : "var(--muted)",
                                                cursor: isAllowed ? "pointer" : "not-allowed",
                                                opacity: isAllowed ? 1 : 0.4,
                                            }}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>
                                Only days matching your selected slots can be toggled
                            </div>
                        </>
                    )}

                    {/* Date range */}
                    <div className="sec-label">Date Range</div>
                    <div className="two" style={{ marginBottom: 16 }}>
                        <div className="fi">
                            <label className="fl">Start Date</label>
                            <input
                                className="finput"
                                type="date"
                                value={repeatStartDate}
                                onChange={e => onStartDateChange(e.target.value)}
                            />
                        </div>
                        <div className="fi">
                            <label className="fl">End Date</label>
                            <input
                                className="finput"
                                type="date"
                                value={repeatEndDate}
                                min={repeatStartDate}
                                onChange={e => onEndDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {preview.length > 0 && (
                        <>
                            <div className="sec-label">
                                Preview — {preview.length} slot{preview.length !== 1 ? "s" : ""} will be created
                            </div>
                            <div style={{
                                background: "var(--bg2)", border: "1px solid var(--bd)",
                                borderRadius: 8, padding: "10px 14px",
                                maxHeight: 160, overflowY: "auto",
                            }}>
                                {preview.slice(0, 20).map((slot, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "var(--text2)", padding: "2px 0" }}>
                                        {slot}
                                    </div>
                                ))}
                                {preview.length > 20 && (
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                                        …and {preview.length - 20} more
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="mf">
                    <button className="sm-btn sm-btn-o" onClick={onClose}>Cancel</button>
                    // In RepeatModal footer — change button text
                    <button
                        className="sm-btn sm-btn-p"
                        onClick={onApply}
                        disabled={!repeatStartDate || !repeatEndDate || preview.length === 0}
                        style={{ opacity: (!repeatStartDate || !repeatEndDate || preview.length === 0) ? 0.5 : 1 }}
                    >
                        Apply Pattern →   {/* was "Apply & Pick Societies →" */}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RepeatModal;