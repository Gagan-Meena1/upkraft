import React from "react";
import { Tutor, Society } from "./Types";

interface OpenSlotsPanelProps {
  tutors: Tutor[];
  allSocieties: Society[];
  selectedSoc: string;
  onSocChange: (socId: string) => void;
  onJumpToSlot: (tutorId: string, slotKey: string) => void;
  onClose: () => void;
  slots: Map<string, "available" | "unavailable">;
  slotSocietyMap: Map<string, string[]>;
}

const OpenSlotsPanel: React.FC<OpenSlotsPanelProps> = ({
  tutors,
  allSocieties,
  selectedSoc,
  onSocChange,
  onJumpToSlot,
  onClose,
  slots,
  slotSocietyMap,
}) => {
  const socName = allSocieties.find((s) => s._id === selectedSoc)?.name || "";

  // Find open slots matching the selected society
  const getOpenSlots = () => {
    if (!selectedSoc) return [];

    const results: { tutorId: string; tutorName: string; instrument: string; slots: { key: string; label: string }[] }[] = [];

    tutors.forEach((t) => {
      const tutorSlots: { key: string; label: string }[] = [];
      slots.forEach((status, key) => {
        if (status !== "available") return;
        const socs = slotSocietyMap.get(key) || [];
        const matchAll = socs.length === 0;
        const matchSoc = socs.some((s) => s.toLowerCase() === socName.toLowerCase());
        if (matchAll || matchSoc) {
          const parts = key.split("-");
          const hour = parseInt(parts[parts.length - 1]);
          const dateStr = parts.slice(0, 3).join("-");
          const d = new Date(dateStr);
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          const label = `${dayName} ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
          tutorSlots.push({ key, label });
        }
      });

      if (tutorSlots.length > 0) {
        results.push({
          tutorId: t._id,
          tutorName: t.username,
          instrument: t.email,
          slots: tutorSlots,
        });
      }
    });

    return results;
  };

  const openSlots = getOpenSlots();

  return (
    <div className="open-panel show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="open-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="os-head">
          <h3>🔍 Open Slots by Society</h3>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="os-body">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <select
              className="os-select"
              value={selectedSoc}
              onChange={(e) => onSocChange(e.target.value)}
            >
              <option value="">Select a society…</option>
              {allSocieties.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Shows available slots across all tutors</span>
          </div>

          <div className="os-result">
            {!selectedSoc ? (
              <div className="os-empty">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                Select a society above to see open slots
              </div>
            ) : openSlots.length === 0 ? (
              <div className="os-empty">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                No open slots found for <strong>{socName}</strong>
                <br />
                <span style={{ fontSize: 12 }}>Try checking individual tutors or open more slots.</span>
              </div>
            ) : (
              openSlots.map((block) => (
                <div key={block.tutorId} className="os-tutor-block">
                  <div className="os-tb-head">
                    <div>
                      <div className="os-tb-name">{block.tutorName}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{block.instrument}</div>
                    </div>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      background: "var(--gl)", color: "var(--green)",
                      border: "1px solid var(--gb)", borderRadius: 10, padding: "3px 9px"
                    }}>
                      {block.slots.length} open
                    </span>
                  </div>
                  <div className="os-slots">
                    {block.slots.map((sl) => (
                      <button
                        key={sl.key}
                        className="os-slot"
                        onClick={() => onJumpToSlot(block.tutorId, sl.key)}
                      >
                        {sl.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--bdr)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Tap any slot to jump to it in the grid</div>
        </div>
      </div>
    </div>
  );
};

export default OpenSlotsPanel;
