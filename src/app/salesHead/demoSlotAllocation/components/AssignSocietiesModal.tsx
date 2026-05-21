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
  const selectedTutorId = initialTutorId || "";
  const [societies, setSocieties] = useState<FullSociety[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
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
      <div 
        className="sm-modal" 
        style={{ 
          maxWidth: "1200px", 
          width: "95vw", 
          height: "85vh", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          borderRadius: "16px",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.18)",
          background: "#fff"
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mh" style={{ borderBottom: "1px solid var(--bdr)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--p)", display: "flex", alignItems: "center", gap: 8 }}>
              🏘️ Manage Assigned Societies
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
              Assigning societies to tutor: <strong style={{ color: "var(--txt)" }}>{selectedTutor?.username}</strong> ({selectedTutor?.email})
            </p>
          </div>
          <button className="mclose" onClick={onClose} style={{ width: 32, height: 32 }}>✕</button>
        </div>

        {/* Body */}
        <div className="mb" style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", gap: 16 }}>
          
          {/* Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between", flexShrink: 0 }}>
            {/* Search + City Filter */}
            <div style={{ display: "flex", gap: 10, flex: "1 1 auto", maxWidth: "600px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                <input
                  className="finput"
                  placeholder="Search societies by name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 36, fontSize: 13, height: 40, borderRadius: "10px", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <select
                className="finput"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ width: 160, flexShrink: 0, fontSize: 13, height: 40, borderRadius: "10px", padding: "0 12px", cursor: "pointer" }}
              >
                <option value="">All Cities</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="sm-btn sm-btn-o"
                style={{ fontSize: 12, padding: "8px 14px", height: 40, borderRadius: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => setSelectedIds(filtered.map(s => s._id))}
              >
                ✓ Select All
              </button>
              <button
                className="sm-btn sm-btn-o"
                style={{ fontSize: 12, padding: "8px 14px", height: 40, borderRadius: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => setSelectedIds([])}
              >
                ✕ Deselect All
              </button>
              <span style={{ fontSize: 13, color: "var(--p)", fontWeight: 600, marginLeft: 6, background: "var(--pl)", padding: "8px 14px", borderRadius: "10px", height: 40, display: "flex", alignItems: "center", boxSizing: "border-box" }}>
                {selectedIds.length} Selected
              </span>
            </div>
          </div>

          {/* Society Grid container */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginTop: 4 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "var(--muted)" }}>
                <div style={{ width: 40, height: 40, border: "3px solid var(--p)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span>Loading societies...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontSize: 14 }}>
                🏢 No societies found matching filters
              </div>
            ) : (
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                  gap: 12,
                  padding: "4px"
                }}
              >
                {filtered.map(s => {
                  const isOn = selectedIds.includes(s._id);
                  return (
                    <div
                      key={s._id}
                      onClick={() => toggle(s._id)}
                      style={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: 12,
                        padding: "12px 14px", 
                        borderRadius: "12px", 
                        cursor: "pointer",
                        background: isOn ? "var(--pl)" : "#fff",
                        border: `1.5px solid ${isOn ? "var(--p)" : "var(--bdr2)"}`,
                        boxShadow: isOn ? "0 4px 12px rgba(92, 22, 197, 0.08)" : "0 2px 6px rgba(0, 0, 0, 0.02)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = isOn 
                          ? "0 6px 16px rgba(92, 22, 197, 0.12)" 
                          : "0 4px 12px rgba(0, 0, 0, 0.06)";
                        if (!isOn) e.currentTarget.style.borderColor = "var(--p)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = isOn 
                          ? "0 4px 12px rgba(92, 22, 197, 0.08)" 
                          : "0 2px 6px rgba(0, 0, 0, 0.02)";
                        if (!isOn) e.currentTarget.style.borderColor = "var(--bdr2)";
                      }}
                    >
                      {/* Selection Checkbox */}
                      <span style={{
                        width: 20, 
                        height: 20, 
                        borderRadius: 6, 
                        flexShrink: 0,
                        border: `2px solid ${isOn ? "var(--p)" : "#ccc"}`,
                        background: isOn ? "var(--p)" : "transparent",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: 11, 
                        color: "#fff", 
                        fontWeight: 700,
                        transition: "all 0.15s ease",
                      }}>
                        {isOn ? "✓" : ""}
                      </span>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: "var(--txt)", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis", 
                          whiteSpace: "nowrap" 
                        }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          📍 {s.city}
                        </div>
                      </div>
                      
                      {s.isPopular && (
                        <span 
                          style={{ 
                            fontSize: 11,
                            background: "rgba(251, 191, 36, 0.15)",
                            color: "#d97706",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            letterSpacing: "0.2px"
                          }}
                        >
                          Popular ⭐
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="mf" style={{ borderTop: "1px solid var(--bdr)", padding: "16px 24px", flexShrink: 0 }}>
          <button className="sm-btn sm-btn-o" onClick={onClose} style={{ height: 40, padding: "0 20px", borderRadius: "10px", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button
            className="sm-btn sm-btn-p"
            onClick={handleSave}
            disabled={saving}
            style={{ 
              opacity: saving ? 0.5 : 1, 
              height: 40, 
              padding: "0 24px", 
              borderRadius: "10px", 
              fontSize: 13, 
              fontWeight: 600,
              background: "var(--p)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {saving ? "Saving…" : `Save ${selectedIds.length} Assigned Societies`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSocietiesModal;
