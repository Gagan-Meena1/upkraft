import React from "react";
import SlotCell from "./SlotCell";

const TIMES = [
  "9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM",
];
const TL: Record<string,string> = {
  "9AM":"9:00 AM","10AM":"10:00 AM","11AM":"11:00 AM","12PM":"12:00 PM",
  "1PM":"1:00 PM","2PM":"2:00 PM","3PM":"3:00 PM","4PM":"4:00 PM",
  "5PM":"5:00 PM","6PM":"6:00 PM","7PM":"7:00 PM","8PM":"8:00 PM",
};

interface DayViewProps {
  day: Date;
  slots: Map<string, "available" | "unavailable">;
  slotSocietyMap: Map<string, string[]>;
  selectedSlots: Set<string>;
  onSlotClick: (date: string, hour: number) => void;
  formatDate: (d: Date) => string;
}

const DayView: React.FC<DayViewProps> = ({
  day,
  slots,
  slotSocietyMap,
  selectedSlots,
  onSlotClick,
  formatDate,
}) => {
  const dateStr = formatDate(day);
  const hours = Array.from({ length: 12 }, (_, i) => i + 9);

  return (
    <div className="sm-day-view" style={{ display: "flex" }}>
      {hours.map((hour) => {
        const key = `${dateStr}-${hour}`;
        const status = slots.get(key) || "unavailable";
        const socs = slotSocietyMap.get(key);
        const isSelected = selectedSlots.has(key);
        const timeLabel = TL[TIMES[hour - 9]] || `${hour}:00`;

        return (
          <div className="day-slot-row" key={hour}>
            <div className="day-slot-time">{timeLabel}</div>
            <div className="day-slot-cell">
              <SlotCell
                status={status}
                societyNames={socs}
                isSelected={isSelected}
                onClick={() => onSlotClick(dateStr, hour)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayView;
