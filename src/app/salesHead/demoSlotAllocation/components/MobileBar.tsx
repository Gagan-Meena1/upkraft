import React from "react";
import { Tutor, Society } from "./Types";

interface MobileBarProps {
  tutors: Tutor[];
  selectedTutor: string;
  onSelectTutor: (id: string) => void;
  societies: Society[];
  onManageSocieties: () => void;
}

const MobileBar: React.FC<MobileBarProps> = ({
  tutors,
  selectedTutor,
  onSelectTutor,
  societies,
  onManageSocieties,
}) => {
  return (
    <div className="mobile-bar">
      <div className="mobile-tutor-row">
        <span className="mobile-tutor-label">Tutor</span>
        <select
          className="mobile-tutor-select"
          value={selectedTutor}
          onChange={(e) => onSelectTutor(e.target.value)}
        >
          <option value="">— Choose a tutor —</option>
          {tutors.map((t) => (
            <option key={t._id} value={t._id}>
              {t.username}
            </option>
          ))}
        </select>
      </div>
      <div className="mobile-socs">
        {societies.map((s) => (
          <span key={s._id} className="mobile-soc">
            {s.name}
          </span>
        ))}
      </div>
      <div className="mobile-actions">
        <button className="mobile-manage-btn" onClick={onManageSocieties}>
          ⚙ Manage Societies
        </button>
      </div>
    </div>
  );
};

export default MobileBar;
