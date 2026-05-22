import React from "react";
import { TutorListItem, Society } from "./Types";

interface TutorSidebarProps {
  tutorList: TutorListItem[];
  selectedTutor: string;
  onSelectTutor: (id: string) => void;
  onManageSocieties: () => void;
  filterTutors: string[];
  selectedTutorSocieties?: Society[];
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({
  tutorList,
  selectedTutor,
  onSelectTutor,
  onManageSocieties,
  filterTutors,
  selectedTutorSocieties = [],
}) => {
  return (
    <aside className="sm-sidebar">
      <div className="sb-head">Tutors</div>
      <div>
        {tutorList.map((t) => {
          const isHidden =
            filterTutors.length > 0 && !filterTutors.includes(t._id);
          if (isHidden) return null;
          return (
            <div
              key={t._id}
              className={`tutor-item${t._id === selectedTutor ? " active" : ""}`}
              onClick={() => onSelectTutor(t._id)}
            >
              <div className="ti-name">{t.username}</div>
              <div className="ti-inst">{t.email}</div>
              {t._id === selectedTutor && selectedTutorSocieties.length > 0 && (
                <div className="ti-socs" style={{ marginTop: 4 }}>
                  {selectedTutorSocieties.map((s) => (
                    <span key={s._id} className="ti-soc">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button className="manage-btn" onClick={onManageSocieties}>
        ⚙ Manage Societies
      </button>
      <div className="sm-legend">
        <div className="leg-title">Legend</div>
        <div className="leg-row">
          <div className="ld" style={{ background: "var(--na)", border: "1px solid #ccc" }} />
          NA
        </div>
        <div className="leg-row">
          <div className="ld" style={{ background: "#f0fdf4", border: "1px solid #047857" }} />
          Open — all
        </div>
        <div className="leg-row">
          <div
            className="ld"
            style={{
              background: "linear-gradient(135deg,#f0fdf4,#f5f0ff)",
              border: "1.5px dashed rgba(92,22,197,.35)",
            }}
          />
          Open — specific
        </div>
        <div className="leg-row">
          <div className="ld" style={{ background: "#1a1a2e", border: "1px solid #2d2d44" }} />
          Demo
        </div>
        <div className="leg-row">
          <div className="ld" style={{ background: "var(--bl)", border: "1px solid var(--bb)" }} />
          Booked
        </div>
      </div>
    </aside>
  );
};

export default TutorSidebar;
