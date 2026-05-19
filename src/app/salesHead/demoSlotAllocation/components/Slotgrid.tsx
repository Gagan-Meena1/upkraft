import React from "react";
import { format } from "date-fns";
import * as dateFnsTz from "date-fns-tz";
import { parseISO } from "date-fns";
import { ClassData, Tutor, Society } from "./Types";
import SlotCell from "./SlotCell";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface SlotGridProps {
  slots: Map<string, "available" | "unavailable">;
  slotSocietyMap: Map<string, string[]>;
  classes: ClassData[];
  selectedTutor: string;
  tutors: Tutor[];
  userTimezone: string;
  currentDate: Date;
  selectedSlots: Set<string>;
  onSlotClick: (date: string, hour: number) => void;
  onViewClass: (classItem: ClassData) => void;
  onWeekChange: (direction: number) => void;
  onToday: () => void;
}

const SlotGrid = ({
  slots,
  slotSocietyMap,
  classes,
  selectedTutor,
  tutors,
  userTimezone,
  currentDate,
  selectedSlots,
  onSlotClick,
  onViewClass,
  onWeekChange,
  onToday,
}: SlotGridProps) => {
  const formatDateString = (date: Date) => format(date, "yyyy-MM-dd");

  const getWeekDays = (): Date[] => {
    const ref = new Date(currentDate.getTime());
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(ref);
    startOfWeek.setDate(diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 12 }, (_, i) => i + 9);

  const getClassesForSlot = (date: string, hour: number): ClassData[] => {
    if (!selectedTutor || classes.length === 0) return [];
    const tutor = tutors.find((t) => t._id === selectedTutor);
    const tutorTz = tutor?.timezone || userTimezone;
    return classes.filter((classItem) => {
      try {
        const startLocal = dateFnsTz.toZonedTime(parseISO(classItem.startTime), tutorTz);
        const endLocal = dateFnsTz.toZonedTime(parseISO(classItem.endTime), tutorTz);
        const [year, month, day] = date.split("-").map(Number);
        const slotStart = new Date(year, month - 1, day, hour, 0, 0);
        const slotEnd = new Date(year, month - 1, day, hour + 1, 0, 0);
        return startLocal < slotEnd && endLocal > slotStart;
      } catch { return false; }
    });
  };

  const formatHour = (h: number) => {
    if (h === 0) return "12:00 AM";
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return "12:00 PM";
    return `${h - 12}:00 PM`;
  };

  return (
    <div className="grid-area">
      <div className="grid-wrap">
        {/* Header */}
        <div className="grid-head">
          <div></div>
          {weekDays.map((d, i) => (
            <div key={i} className="gh-day">
              <span className="gd-n">{d.getDate()}</span>
              <span className="gd-d">{DAYS[i]} · {MO[d.getMonth()]}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {hours.map((hour) => (
          <div className="grid-row" key={hour}>
            <div className="gr-time">{formatHour(hour)}</div>
            {weekDays.map((day) => {
              const dateStr = formatDateString(day);
              const key = `${dateStr}-${hour}`;
              const status = slots.get(key) || "unavailable";
              const slotClasses = getClassesForSlot(dateStr, hour);
              const hasClass = slotClasses.length > 0;
              const socs = slotSocietyMap.get(key);
              const isSelected = selectedSlots.has(key);
              const tutor = tutors.find((t) => t._id === selectedTutor);
              const tutorTz = tutor?.timezone || userTimezone;

              if (hasClass) {
                const classItem = slotClasses[0];
                const startLocal = dateFnsTz.toZonedTime(parseISO(classItem.startTime), tutorTz);
                const endLocal = dateFnsTz.toZonedTime(parseISO(classItem.endTime), tutorTz);
                const timeStr = `${format(startLocal, "h:mm a")} – ${format(endLocal, "h:mm a")}`;

                // Find matching registration by demoDate
                const curTutor = tutors.find((t) => t._id === selectedTutor);
                const regs = curTutor?.registrations || [];
                const matchingReg = regs.find((r) => {
                  if (!r.demoDate) return false;
                  try {
                    const regStart = dateFnsTz.toZonedTime(parseISO(r.demoDate), tutorTz);
                    // Match if the registration's demoDate falls within this slot
                    return regStart >= startLocal && regStart < endLocal ||
                      Math.abs(regStart.getTime() - startLocal.getTime()) < 60000; // within 1 min
                  } catch { return false; }
                });

                return (
                  <SlotCell
                    key={key}
                    status="available"
                    classTitle={classItem.title}
                    classTime={timeStr}
                    registration={matchingReg}
                    onClick={() => onViewClass(classItem)}
                  />
                );
              }

              return (
                <SlotCell
                  key={key}
                  status={status}
                  societyNames={socs}
                  isSelected={isSelected}
                  onClick={() => onSlotClick(dateStr, hour)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotGrid;