"use client";

import React, { useState } from "react";

const CANCELLATION_REASONS: Record<string, string[]> = {
    "Reschedule/Cancellation Disposition (Tutor)": [
        "Tutor Requested Reschedule",
        "Tutor Running Late",
        "Tutor Health Issue",
        "Tutor Personal Emergency",
        "Tutor Travel/Commute Issue",
        "Tutor Double Booking / Scheduling Conflict",
        "Tutor Leave / Day Off",
        "Tutor Technical Issue (for online class)",
        "Tutor Weather Constraint"
    ],
    "Reschedule/Cancellation Disposition (Parent/Student)": [
        "Parent Not Available",
        "Student Not Available",
        "Parent Running Late",
        "Parent/Student Health Issue",
        "Family Emergency",
        "Out of Town / Travel/Holiday/vacation",
        "Guest at Home/Family Function / Event",
        "Schedule Conflict (School / Tuition / Activity/Exam)",
        "Forgot / Missed Class",
        "Technical Issue (for online class)",
        "Weather Constraint",
        "Parent Requested Time Change in Advance",
        "Parent Delayed – Personal Work"
    ],
    "Pause Disposition (Parent/Student)": [
        "Student Exams",
        "Student Health Issue",
        "Parent Health Issue",
        "Travel / Vacation",
        "Family Emergency",
        "School Workload / Pressure",
        "Function / Event at Home",
        "Not Available for Few Weeks",
        "Festival Break",
        "Weather / Seasonal Issue"
    ]
};

const GROUP_KEYS = Object.keys(CANCELLATION_REASONS);

interface CancellationReasonPickerProps {
    value: string;
    onChange: (val: string) => void;
    onReset?: () => void;
}

export default function CancellationReasonPicker({
    value,
    onChange,
    onReset
}: CancellationReasonPickerProps) {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [isOther, setIsOther] = useState(false);
    const [otherText, setOtherText] = useState("");

    const reset = () => {
        setSelectedGroup(null);
        setIsOther(false);
        setOtherText("");
        onChange("");
        onReset?.();
    };

    const handleGroupSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onChange(""); // reset sub-selection on group change

        if (val === "other") {
            setIsOther(true);
            setSelectedGroup(null);
            setOtherText("");
        } else if (GROUP_KEYS.includes(val)) {
            setSelectedGroup(val);
            setIsOther(false);
            setOtherText("");
        } else {
            // empty selection
            setSelectedGroup(null);
            setIsOther(false);
        }
    };

    const handleReasonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOtherText(e.target.value);
        onChange(e.target.value);
    };

    const groupSelectorValue = isOther ? "other" : selectedGroup ?? "";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-gray-600">
                    Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                {(selectedGroup || isOther || value) && (
                    <button
                        onClick={reset}
                        className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Step 1 — Category selector */}
            <select
                value={groupSelectorValue}
                onChange={handleGroupSelect}
                className="text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="">Select category...</option>
                {GROUP_KEYS.map(group => (
                    <option key={group} value={group}>{group}</option>
                ))}
                <option value="other">Other</option>
            </select>

            {/* Step 2a — Reasons for selected group */}
            {selectedGroup && !isOther && (
                <select
                    value={value}
                    onChange={handleReasonSelect}
                    className="text-xs px-2 py-1.5 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Select reason...</option>
                    {CANCELLATION_REASONS[selectedGroup].map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                    ))}
                </select>
            )}

            {/* Step 2b — Free text for Other */}
            {isOther && (
                <textarea
                    value={otherText}
                    onChange={handleOtherChange}
                    placeholder="Describe the reason..."
                    rows={2}
                    className="text-xs px-2 py-1.5 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
            )}

            {/* Confirmation pill */}
            {value && (
                <p className="text-[10px] text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 break-words">
                    ✓ {value}
                </p>
            )}
        </div>
    );
}