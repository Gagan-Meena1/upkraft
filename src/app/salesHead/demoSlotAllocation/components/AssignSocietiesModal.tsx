import React, { useState, useEffect } from "react";
import { Tutor, Society } from "./Types";

interface AssignSocietiesModalProps {
  tutors: Tutor[];
  initialTutorId?: string;
  onClose: () => void;
  onSaved: () => void; // callback to refresh tutor data
}

interface FullSociety {
  _id: string;
  name: string;
  city: string;
  isPopular?: boolean;
}

const AssignSocietiesModal: React.FC<AssignSocietiesModalProps> = ({
  tutors,
  initialTutorId,
  onClose,
  onSaved,
}) => {
  const [selectedTutorId, setSelectedTutorId] = useState(initialTutorId || "");
  const [societies, setSocieties] = useState<FullSociety[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch all societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch("/Api/salesHead/society");
        const data = await res.json();
        if (data.success && data.societies) setSocieties(data.societies);
      } catch (err) {
        console.error("Error fetching societies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSocieties();
  }, []);

  // Pre-select tutor's existing societies when tutor changes
  useEffect(() => {
    if (!selectedTutorId) {
      setSelectedIds([]);
      return;
    }
    const tutor = tutors.find(t => t._id === selectedTutorId);
    setSelectedIds(tutor?.societies?.map(s => s._id) || []);
  }, [selectedTutorId, tutors]);

  const uniqueCities = [...new Set(societies.map(s => s.city))].sort();

  const filtered = societies.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCity = !cityFilter || s.city === cityFilter;
    return matchSearch && matchCity;
  });

  const filteredTutors = tutors.filter(t =>
    t.username.toLowerCase().includes(tutorSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(tutorSearch.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!selectedTutorId) return;
    setSaving(true);
    try {
      const res = await fetch("/Api/salesHead/assignSocieties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId: selectedTutorId, societyIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to assign societies");
    } finally {
      setSaving(false);
    }
  };

  const selectedTutor = tutors.find(t => t._id === selectedTutorId);

  return (
    <div className="sm-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sm-modal" style={{ maxWidth: 560, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mh" style={{ borderBottom: "1px solid var(--bd)", paddingBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🏘️ Assign Societies to Tutor</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Select a tutor and choose which societies to assign
            </p>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>

        <div className="mb" style={{ padding: "12px 16px", maxHeight: "75vh", overflowY: "auto" }}>
          {/* Tutor Selector */}
          <div style={{ marginBottom: 14 }}>
            <div className="sec-label" style={{ marginBottom: 6 }}>Select Tutor</div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>👤</span>
              <input
                className="finput"
                placeholder="Search tutor by name..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box", marginBottom: 6 }}
              />
            </div>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredTutors.map(t => {
                const isActive = t._id === selectedTutorId;
                const socCount = t.societies?.length || 0;
                return (
                  <div
                    key={t._id}
                    onClick={() => { setSelectedTutorId(t._id); setTutorSearch(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                      background: isActive ? "var(--pl)" : "var(--card)",
                      border: `1.5px solid ${isActive ? "var(--p)" : "var(--bd)"}`,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isActive ? "var(--p)" : "#eee",
                      color: isActive ? "#fff" : "var(--txt)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {t.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.username}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.email}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: socCount > 0 ? "var(--pl)" : "#fee", color: socCount > 0 ? "var(--p)" : "#c00" }}>
                      {socCount} soc
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          {selectedTutorId && (
            <>
              <div style={{ height: 1, background: "var(--bd)", margin: "8px 0 14px" }} />

              {/* Current assignment info */}
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                Assigning to <strong style={{ color: "var(--txt)" }}>{selectedTutor?.username}</strong> — currently {selectedTutor?.societies?.length || 0} societies
              </div>

              {/* Search + city filter */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
                  <input
                    className="finput"
                    placeholder="Search societies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <select
                  className="finput"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  style={{ width: 140, flexShrink: 0 }}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Select All / Deselect All */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button
                  className="sm-btn sm-btn-o"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => setSelectedIds(filtered.map(s => s._id))}
                >
                  ✓ Select All
                </button>
                <button
                  className="sm-btn sm-btn-o"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => setSelectedIds([])}
                >
                  ✕ Deselect All
                </button>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>
                  {selectedIds.length} selected
                </span>
              </div>

              {/* Society grid */}
              {loading ? (
                <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>Loading societies...</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                  {filtered.map(s => {
                    const isOn = selectedIds.includes(s._id);
                    return (
                      <div
                        key={s._id}
                        onClick={() => toggle(s._id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                          background: isOn ? "var(--pl)" : "var(--card)",
                          border: `1.5px solid ${isOn ? "var(--p)" : "var(--bd)"}`,
                          transition: "all 0.12s ease",
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: `2px solid ${isOn ? "var(--p)" : "#ccc"}`,
                          background: isOn ? "var(--p)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: "#fff", fontWeight: 700,
                          transition: "all 0.12s ease",
                        }}>
                          {isOn ? "✓" : ""}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.city}</div>
                        </div>
                        {s.isPopular && <span style={{ fontSize: 10 }}>⭐</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mf" style={{ borderTop: "1px solid var(--bd)", paddingTop: 14 }}>
          <button className="sm-btn sm-btn-o" onClick={onClose}>Cancel</button>
          <button
            className="sm-btn sm-btn-p"
            onClick={handleSave}
            disabled={!selectedTutorId || saving}
            style={{ opacity: (!selectedTutorId || saving) ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : `Save ${selectedIds.length} Societies`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSocietiesModal;
