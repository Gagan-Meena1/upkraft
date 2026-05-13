import React from "react";
import { X, Repeat, Calendar, Eye } from "lucide-react";

interface RepeatModalProps {
  selectedSlots: Set<string>;
  repeatType: "daily" | "weekly";
  selectedDays: number[];
  repeatStartDate: string;
  repeatEndDate: string;
  onRepeatTypeChange: (type: "daily" | "weekly") => void;
  onToggleDay: (day: number) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClose: () => void;
  getPreviewSlots: () => string[];
  getAllowedDays: () => number[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RepeatModal = ({
  selectedSlots,
  repeatType,
  selectedDays,
  repeatStartDate,
  repeatEndDate,
  onRepeatTypeChange,
  onToggleDay,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClose,
  getPreviewSlots,
  getAllowedDays,
}: RepeatModalProps) => {
  const previewSlots = getPreviewSlots();
  const allowedDays = getAllowedDays();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Repeat Slots
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedSlots.size} slot{selectedSlots.size !== 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Repeat Type */}
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">
              Repeat Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => onRepeatTypeChange("daily")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                  repeatType === "daily"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white/50 text-gray-600 border border-gray-300/70 hover:bg-white/80"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => onRepeatTypeChange("weekly")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                  repeatType === "weekly"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white/50 text-gray-600 border border-gray-300/70 hover:bg-white/80"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Day Selector (weekly only) */}
          {repeatType === "weekly" && (
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">
                Repeat on Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAY_LABELS.map((label, index) => {
                  const isAllowed = allowedDays.includes(index);
                  const isSelected = selectedDays.includes(index);

                  return (
                    <button
                      key={index}
                      onClick={() => onToggleDay(index)}
                      disabled={!isAllowed}
                      className={`w-11 h-11 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-md"
                          : isAllowed
                          ? "bg-white/50 text-gray-600 border border-gray-300/70 hover:bg-white/80"
                          : "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={repeatStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={repeatEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={repeatStartDate}
                className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Preview */}
          {previewSlots.length > 0 && (
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Preview ({previewSlots.length} slots)
              </label>
              <div className="max-h-32 overflow-y-auto bg-white/50 rounded-lg border border-gray-300/70 p-3">
                <div className="flex flex-wrap gap-1.5">
                  {previewSlots.slice(0, 50).map((slot, i) => (
                    <span
                      key={i}
                      className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md font-medium"
                    >
                      {slot}
                    </span>
                  ))}
                  {previewSlots.length > 50 && (
                    <span className="inline-block text-gray-500 text-xs px-2 py-1">
                      +{previewSlots.length - 50} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              disabled={!repeatStartDate || !repeatEndDate}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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