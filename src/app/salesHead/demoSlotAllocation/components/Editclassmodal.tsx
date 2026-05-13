import React from "react";
import { X, AlertCircle } from "lucide-react";
import { ClassData } from "./Types";

interface EditClassModalProps {
  editingClass: ClassData;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updated: ClassData) => void;
}

const EditClassModal = ({
  editingClass,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
  onChange,
}: EditClassModalProps) => {
  const handleTimeChange = (field: "startTime" | "endTime", raw: string) => {
    let value = raw.replace(/[^\d:]/g, "");
    if (value.length === 2 && !value.includes(":")) value = value + ":";
    if (value.length > 5) value = value.slice(0, 5);
    onChange({ ...editingClass, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">Class Title</label>
            <input
              type="text"
              value={editingClass.title}
              onChange={(e) => onChange({ ...editingClass, title: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 text-sm font-medium">Description</label>
            <textarea
              value={editingClass.description || ""}
              onChange={(e) => onChange({ ...editingClass, description: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">Start Time (HH:MM)</label>
              <input
                type="text"
                value={editingClass.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                maxLength={5}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium">End Time (HH:MM)</label>
              <input
                type="text"
                value={editingClass.endTime}
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                maxLength={5}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-gray-300/70 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!errorMessage}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isSubmitting ? "Updating..." : "Update Class"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditClassModal;