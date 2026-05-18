import React from "react";

interface DayTabsProps {
  weekDays: Date[];
  activeDay: number;
  onSelectDay: (index: number) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DayTabs: React.FC<DayTabsProps> = ({ weekDays, activeDay, onSelectDay }) => {
  return (
    <div className="day-tabs">
      <div className="day-tabs-inner">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className={`day-tab${i === activeDay ? " active" : ""}`}
            onClick={() => onSelectDay(i)}
          >
            <span className="dt-num">{d.getDate()}</span>
            <span className="dt-day">{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayTabs;
