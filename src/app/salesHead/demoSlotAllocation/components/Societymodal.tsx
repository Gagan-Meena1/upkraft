import React, { useState } from "react";
import { Society } from "./Types";

interface SocietyModalProps {
  societies: Society[];
  selectedSocietyIds: string[];
  onToggleSociety: (id: string) => void;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slotCount?: number;
}

const SocietyModal = ({
  societies,
  selectedSocietyIds,
  onToggleSociety,
  saving,
  onClose,
  onConfirm,
  slotCount = 1,
}: SocietyModalProps) => {
  const [search, setSearch] = useState("");
  const filtered = societies.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase())
  );
  const allSelected = societies.length > 0 && selectedSocietyIds.length === societies.length;

  const toggleAll = () => {
    if (allSelected) {
      societies.forEach((s) => {
        if (selectedSocietyIds.includes(s._id)) onToggleSociety(s._id);
      });
    } else {
      societies.forEach((s) => {
        if (!selectedSocietyIds.includes(s._id)) onToggleSociety(s._id);
      });
    }
  };

  return (
    <div className="sm-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sm-modal" style={{ maxWidth: 440, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mh" style={{ borderBottom: "1px solid var(--bd)", paddingBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🏘️ Select Societies</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              {slotCount > 1
                ? `Assign societies to ${slotCount} selected slots`
                : "Choose which societies this slot should be available for"}
            </p>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="mb" style={{ padding: "12px 16px" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)" }}>🔍</span>
            <input
              className="finput"
              placeholder="Search societies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Select All */}
          <div
            onClick={toggleAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              marginBottom: 8,
              borderRadius: 10,
              background: allSelected ? "var(--pl)" : "var(--card)",
              border: `1.5px solid ${allSelected ? "var(--p)" : "var(--bd)"}`,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: 6,
              border: `2px solid ${allSelected ? "var(--p)" : "#ccc"}`,
              background: allSelected ? "var(--p)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0,
              transition: "all 0.15s ease",
            }}>
              {allSelected ? "✓" : ""}
            </span>
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--txt)" }}>Select All</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
              {selectedSocietyIds.length}/{societies.length}
            </span>
          </div>

          {/* Society list */}
          <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--muted)", padding: 20, fontSize: 13 }}>
                No societies found
              </div>
            )}
            {filtered.map((s) => {
              const isOn = selectedSocietyIds.includes(s._id);
              return (
                <div
                  key={s._id}
                  onClick={() => onToggleSociety(s._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: isOn ? "var(--pl)" : "var(--card)",
                    border: `1.5px solid ${isOn ? "var(--p)" : "var(--bd)"}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Checkbox */}
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${isOn ? "var(--p)" : "#ccc"}`,
                    background: isOn ? "var(--p)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#fff", fontWeight: 700,
                    transition: "all 0.15s ease",
                  }}>
                    {isOn ? "✓" : ""}
                  </span>

                  {/* Name + city */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--txt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </div>
                    {s.city && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{s.city}</div>
                    )}
                  </div>

                  {/* Visual indicator */}
                  {isOn && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 20, background: "var(--p)", color: "#fff",
                    }}>
                      Selected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mf" style={{ borderTop: "1px solid var(--bd)", paddingTop: 14 }}>
          <button className="sm-btn sm-btn-o" onClick={onClose}>Cancel</button>
          <button
            className="sm-btn sm-btn-p"
            onClick={onConfirm}
            disabled={selectedSocietyIds.length === 0 || saving}
            style={{ opacity: (selectedSocietyIds.length === 0 || saving) ? 0.5 : 1 }}
          >
            {saving
              ? "Saving…"
              : `Confirm ${selectedSocietyIds.length} Societ${selectedSocietyIds.length !== 1 ? "ies" : "y"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocietyModal;