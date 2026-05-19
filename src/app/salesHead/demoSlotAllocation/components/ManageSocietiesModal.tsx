import React, { useState } from "react";
import { Tutor, Society } from "./Types";

interface ManageSocietiesModalProps {
  tutor: Tutor;
  onClose: () => void;
  onAddSociety: (name: string) => void;
  onRemoveSociety: (index: number) => void;
}

const ManageSocietiesModal: React.FC<ManageSocietiesModalProps> = ({
  tutor,
  onClose,
  onAddSociety,
  onRemoveSociety,
}) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const v = input.trim();
    if (!v) return;
    onAddSociety(v);
    setInput("");
  };

  return (
    <div className="sm-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sm-modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h3>⚙ Societies — {tutor.username}</h3>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Managing societies tagged to {tutor.username}
          </div>
          <div className="soc-list">
            {(!tutor.societies || tutor.societies.length === 0) ? (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>No societies yet.</div>
            ) : (
              tutor.societies.map((s, i) => (
                <div key={s._id} className="soc-row">
                  <span className="soc-row-name">🏢 {s.name}</span>
                  <button className="soc-del" onClick={() => onRemoveSociety(i)}>✕</button>
                </div>
              ))
            )}
          </div>
          <div className="soc-add">
            <input
              className="finput"
              placeholder="Add society name…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
            <button className="sm-btn sm-btn-p" onClick={handleAdd} style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
              + Add
            </button>
          </div>
        </div>
        <div className="mf">
          <button className="sm-btn sm-btn-o" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ManageSocietiesModal;
