import React from "react";
import { TutorListItem } from "./Types";

interface TutorSidebarProps {
  tutorList: TutorListItem[];
  selectedTutor: string;
  onSelectTutor: (id: string) => void;
  onManageSocieties: () => void;
  filterTutors: string[];
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({
  tutorList,
  selectedTutor,
  onSelectTutor,
  onManageSocieties,
  filterTutors,
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
          <div className="ld" style={{ background: "#f0fdf4", border: "1px solid var(--gb)" }} />
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
          <div className="ld" style={{ background: "var(--al)", border: "1px solid var(--ab)" }} />
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
