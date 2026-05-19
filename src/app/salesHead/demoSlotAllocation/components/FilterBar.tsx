import React, { useState } from "react";
import { Tutor, Society } from "./Types";

interface FilterBarProps {
  tutors: Tutor[];
  filterSoc: string;
  allSocieties: Society[];
  onSocFilterChange: (socId: string) => void;
  onClearFilters: () => void;
  onOpenSlotsPanel: () => void;
  selectedSlotCount: number;
  saving: boolean;
  onSaveSlots: () => void;
  onSelectTutor: (id: string) => void;
  selectedTutor: string;
  pendingOpenCount?: number;
  onSaveAllOpen?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  tutors,
  filterSoc,
  allSocieties,
  onSocFilterChange,
  onClearFilters,
  onOpenSlotsPanel,
  selectedSlotCount,
  saving,
  onSaveSlots,
  onSelectTutor,
  selectedTutor,
  pendingOpenCount = 0,
  onSaveAllOpen,
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = search.trim()
    ? tutors.filter(
        (t) =>
          t.username.toLowerCase().includes(search.toLowerCase()) ||
          t.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelect = (id: string) => {
    onSelectTutor(id);
    const tutor = tutors.find((t) => t._id === id);
    setSearch(tutor?.username || "");
    setShowDropdown(false);
  };

  return (
    <div className="filter-bar">
      {/* Search tutor */}
      <span className="fb-label">Tutor</span>
      <div style={{ position: "relative", flex: "0 1 220px" }}>
        <input
          className="finput"
          style={{ padding: "7px 10px", fontSize: 12 }}
          placeholder="🔍 Search tutor…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (search.trim()) setShowDropdown(true);
          }}
        />
        {showDropdown && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1.5px solid var(--bdr2)",
              borderRadius: 8,
              boxShadow: "0 6px 20px rgba(0,0,0,.12)",
              zIndex: 50,
              maxHeight: 200,
              overflowY: "auto",
              marginTop: 2,
            }}
          >
            {filtered.map((t) => (
              <div
                key={t._id}
                onClick={() => handleSelect(t._id)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: t._id === selectedTutor ? 700 : 500,
                  color: t._id === selectedTutor ? "var(--p)" : "var(--txt)",
                  borderBottom: "1px solid var(--bdr)",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLDivElement).style.background = "var(--pl)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLDivElement).style.background = "transparent")
                }
              >
                <div>{t.username}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {t.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        style={{
          background: "var(--gl)",
          borderColor: "var(--gb)",
          color: "var(--green)",
        }}
      >
        🔍 Open Slots
      </button>


      {/* Save All pending open slots */}
      {pendingOpenCount > 0 && onSaveAllOpen && (
        <button
          className="sm-btn"
          onClick={onSaveAllOpen}
          style={{ background: "var(--amber)", color: "#fff", border: "none", fontWeight: 700 }}
        >
          📦 Save All {pendingOpenCount} Slot{pendingOpenCount !== 1 ? "s" : ""}
        </button>
      )}

      <button className="fb-clear" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  );
};

export default FilterBar;
