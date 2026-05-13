import React from "react";
import { Society } from "../types";

interface SocietyModalProps {
  societies: Society[];
  selectedSocietyIds: string[];
  setSelectedSocietyIds: (ids: string[]) => void;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SocietyModal = ({
  societies,
  selectedSocietyIds,
  setSelectedSocietyIds,
  saving,
  onClose,
  onConfirm,
}: SocietyModalProps) => {
  const toggle = (id: string, checked: boolean) => {
    setSelectedSocietyIds(
      checked ? [...selectedSocietyIds, id] : selectedSocietyIds.filter((s) => s !== id)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Select Societies for these Slots</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose one or more societies where these slots apply
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {societies.map((s) => (
            <label
              key={s._id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 cursor-pointer border border-gray-200"
            >
              <input
                type="checkbox"
                checked={selectedSocietyIds.includes(s._id)}
                onChange={(e) => toggle(s._id, e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-gray-800 font-medium">{s.name}</span>
              <span className="text-gray-400 text-sm ml-auto">{s.city}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={selectedSocietyIds.length === 0 || saving}
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : `Save for ${selectedSocietyIds.length} Society`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocietyModal;