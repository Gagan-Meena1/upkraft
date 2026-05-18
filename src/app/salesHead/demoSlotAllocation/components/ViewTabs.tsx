import React from "react";

interface ViewTabsProps {
  currentView: "tutor" | "society";
  onSwitchView: (view: "tutor" | "society") => void;
}

const ViewTabs: React.FC<ViewTabsProps> = ({ currentView, onSwitchView }) => {
  return (
    <div className="view-tabs">
      <div
        className={`vt${currentView === "tutor" ? " active" : ""}`}
        onClick={() => onSwitchView("tutor")}
      >
        📅 Tutor Schedule
      </div>
      <div
        className={`vt${currentView === "society" ? " active" : ""}`}
        onClick={() => onSwitchView("society")}
      >
        🏠 Society Fill View
      </div>
    </div>
  );
};

export default ViewTabs;
