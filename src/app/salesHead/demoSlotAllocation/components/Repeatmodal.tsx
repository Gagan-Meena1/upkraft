import React from "react";
import { X } from "lucide-react";
import { format, parseISO, addDays } from "date-fns";

interface RepeatModalProps {
    selectedSlots: Set<string>;
    repeatType: "daily" | "weekly";
    setRepeatType: (type: "daily" | "weekly") => void;
    selectedDays: number[];
    repeatStartDate: string;
    setRepeatStartDate: (date: string) => void;
    repeatEndDate: string;
    setRepeatEndDate: (date: string) => void;
    onClose: () => void;
    onApply: () => void;
    getAllowedDaysFromSelectedSlots: () => number[];
    toggleDay: (day: number) => void;
}

const RepeatModal = ({
    selectedSlots,
    repeatType,
    setRepeatType,
    selectedDays,
    repeatStartDate,
    setRepeatStartDate,
    repeatEndDate,
    setRepeatEndDate,
    onClose,
    onApply,
    getAllowedDaysFromSelectedSlots,
    toggleDay,
}: RepeatModalProps) => {
    const getPreviewSlots = (): string[] => {
        if (!repeatStartDate || !repeatEndDate || selectedSlots.size === 0) return [];

        const preview: string[] = [];
        const startDate = parseISO(repeatStartDate);
        const endDate = parseISO(repeatEndDate);
        let current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const shouldInclude = repeatType === "daily" || selectedDays.includes(dayOfWeek);

            if (shouldInclude) {
                selectedSlots.forEach((key) => {
                    const parts = key.split("-");
                    const originalDate = parts.slice(0, 3).join("-");
                    const hour = parseInt(parts[parts.length - 1]);
                    const originalDayOfWeek = parseISO(originalDate).getDay();

                    if (repeatType === "daily" || originalDayOfWeek === dayOfWeek) {
                        const dateStr = format(current, "yyyy-MM-dd");
                        preview.push(`${dateStr} ${String(hour).padStart(2, "0")}:00`);
                    }
                });
            }

            current = addDays(current, 1);
        }

        return preview;
    };

    const previewSlots = getPreviewSlots();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Apply Repeat Pattern</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Selected Slots Preview */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            Selected Slots ({selectedSlots.size})
                        </h3>
                        <div className="text-sm text-blue-700 max-h-32 overflow-y-auto">
                            {Array.from(selectedSlots)
                                .sort()
                                .slice(0, 10)
                                .map((key) => {
                                    const parts = key.split("-");
                                    const date = parts.slice(0, 3).join("-");
                                    const hour = parseInt(parts[parts.length - 1]);
                                    const dayName = format(parseISO(date), "EEE, MMM d");
                                    return (
                                        <div key={key}>
                                            {dayName} - {String(hour).padStart(2, "0")}:00
                                        </div>
                                    );
                                })}
                            {selectedSlots.size > 10 && (
                                <div className="text-blue-600 font-medium mt-1">
                                    ...and {selectedSlots.size - 10} more
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Repeat Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repeat Pattern
                        </label>
                        <div className="flex gap-4">
                            {(["daily", "weekly"] as const).map((type) => (
                                <label key={type} className="flex items-center">
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={repeatType === type}
                                        onChange={() => setRepeatType(type)}
                                        className="mr-2"
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Day selector */}
                    {repeatType === "weekly" && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Repeat on Days (Only days from your selected slots)
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { value: 0, label: "Sun" },
                                    { value: 1, label: "Mon" },
                                    { value: 2, label: "Tue" },
                                    { value: 3, label: "Wed" },
                                    { value: 4, label: "Thu" },
                                    { value: 5, label: "Fri" },
                                    { value: 6, label: "Sat" },
                                ].map((day) => {
                                    const allowedDays = getAllowedDaysFromSelectedSlots();
                                    const isAllowed = allowedDays.includes(day.value);
                                    const isSelected = selectedDays.includes(day.value);

                                    return (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleDay(day.value)}
                                            disabled={!isAllowed}
                                            title={!isAllowed ? "This day is not in your selected slots" : ""}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSelected
                                                ? "bg-purple-600 text-white ring-2 ring-purple-400"
                                                : isAllowed
                                                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                ℹ️ You can only select days that match your originally selected time slots
                            </p>
                        </div>
                    )}

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={repeatStartDate}
                                onChange={(e) => setRepeatStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={repeatEndDate}
                                onChange={(e) => setRepeatEndDate(e.target.value)}
                                min={repeatStartDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {repeatStartDate && repeatEndDate && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-900 mb-2">
                                Preview: {previewSlots.length} slots will be created
                            </h3>
                            <div className="text-sm text-green-700 max-h-48 overflow-y-auto">
                                {previewSlots.slice(0, 20).map((slot, idx) => (
                                    <div key={idx}>{slot}</div>
                                ))}
                                {previewSlots.length > 20 && (
                                    <div className="text-green-600 font-medium mt-1">
                                        ...and {previewSlots.length - 20} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onApply}
                            disabled={!repeatStartDate || !repeatEndDate}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Apply Pattern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepeatModal;