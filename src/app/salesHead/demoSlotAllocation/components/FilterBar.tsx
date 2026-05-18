import React from "react";
import { Tutor, Society } from "./Types";

interface FilterBarProps {
  tutors: Tutor[];
  filterTutors: string[];
  filterSoc: string;
  allSocieties: Society[];
  onToggleTutor: (id: string) => void;
  onSocFilterChange: (socId: string) => void;
  onClearFilters: () => void;
  onOpenSlotsPanel: () => void;
  selectedSlotCount: number;
  saving: boolean;
  onSaveSlots: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  tutors,
  filterTutors,
  filterSoc,
  allSocieties,
  onToggleTutor,
  onSocFilterChange,
  onClearFilters,
  onOpenSlotsPanel,
  selectedSlotCount,
  saving,
  onSaveSlots,
}) => {
  const parts: string[] = [];
  if (filterTutors.length > 0)
    parts.push(`${filterTutors.length} tutor${filterTutors.length > 1 ? "s" : ""}`);
  if (filterSoc) {
    const soc = allSocieties.find((s) => s._id === filterSoc);
    parts.push(soc?.name || filterSoc);
  }

  return (
    <div className="filter-bar">
      <span className="fb-label">Filter</span>

      {/* Tutor chips */}
      <span className="fb-label" style={{ marginRight: 2 }}>Tutor</span>
      {tutors.map((t) => {
        const isOn = filterTutors.includes(t._id);
        const dimmed = filterTutors.length > 0 && !isOn;
        return (
          <button
            key={t._id}
            className={`fb-chip${isOn ? " on" : ""}`}
            style={{ opacity: dimmed ? 0.45 : 1 }}
            onClick={() => onToggleTutor(t._id)}
          >
            {t.username.split(" ")[0]}
          </button>
        );
      })}

      <div className="fb-divider" />

      {/* Society filter */}
      <span className="fb-label">Society</span>
      <select
        className="fb-select"
        value={filterSoc}
        onChange={(e) => onSocFilterChange(e.target.value)}
      >
        <option value="">All Societies</option>
        {allSocieties.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="fb-divider" />

      {/* Open slots CTA */}
      <button
        className="fb-chip"
        onClick={onOpenSlotsPanel}
        style={{ background: "var(--gl)", borderColor: "var(--gb)", color: "var(--green)" }}
      >
        🔍 Open Slots
      </button>

      {/* Save selected slots */}
      {selectedSlotCount > 0 && (
        <button
          className="sm-btn sm-btn-p"
          onClick={onSaveSlots}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          💾 Save {selectedSlotCount} Slot{selectedSlotCount !== 1 ? "s" : ""}
        </button>
      )}

      <button className="fb-clear" onClick={onClearFilters}>
        Clear
      </button>
      <span className="filter-count">
        {parts.length ? `Filtering: ${parts.join(", ")}` : ""}
      </span>
    </div>
  );
};

export default FilterBar;
