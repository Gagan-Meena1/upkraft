import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import * as dateFnsTz from "date-fns-tz";
import { format, parseISO } from "date-fns";
import { ClassData, Tutor } from "../types";

interface SlotGridProps {
  weekDays: Date[];
  hours: number[];
  slots: Map<string, "available" | "unavailable">;
  slotSocietyMap: Map<string, string[]>;
  classes: ClassData[];
  selectedTutor: string;
  tutors: Tutor[];
  userTimezone: string;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onSlotChange: (date: string, hour: number, status: "available" | "unavailable") => void;
  onOpenCreateClass: (date: string, hour: number) => void;
  onEditClass: (classItem: ClassData) => void;
  onDeleteClass: (classId: string) => void;
  onViewClass: (classItem: ClassData) => void;
}

const SlotGrid = ({
  weekDays,
  hours,
  slots,
  slotSocietyMap,
  classes,
  selectedTutor,
  tutors,
  userTimezone,
  currentDate,
  setCurrentDate,
  onSlotChange,
  onOpenCreateClass,
  onEditClass,
  onDeleteClass,
  onViewClass,
}: SlotGridProps) => {
  const formatDateString = (date: Date) => format(date, "yyyy-MM-dd");

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

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
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Week of{" "}
          {weekDays[0].toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => changeWeek(1)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-8 gap-2" style={{ minWidth: "800px" }}>
            {/* Header row */}
            <div className="font-semibold text-center py-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              Time
            </div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="font-semibold text-center py-3 bg-purple-100 rounded-lg">
                <div className="text-sm">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-xs text-gray-600">
                  {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}

            {/* Hour rows */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-sm font-medium text-gray-700 py-2 text-center bg-gray-50 rounded-lg flex items-center justify-center hover:bg-purple-100 transition-colors">
                  {String(hour).padStart(2, "0")}:00
                </div>

                {weekDays.map((day) => {
                  const dateStr = formatDateString(day);
                  const key = `${dateStr}-${hour}`;
                  const status = slots.get(key) || "unavailable";
                  const slotClasses = getClassesForSlot(dateStr, hour);
                  const hasClass = slotClasses.length > 0;
                  const tutor = tutors.find((t) => t._id === selectedTutor);
                  const tutorTz = tutor?.timezone || userTimezone;

                  return (
                    <div key={key} className="py-1 relative hover:bg-purple-50 transition-colors">
                      {hasClass ? (
                        <div className="flex flex-col gap-1">
                          {slotClasses.map((classItem, idx) => {
                            const startLocal = dateFnsTz.toZonedTime(
                              parseISO(classItem.startTime),
                              tutorTz
                            );
                            const endLocal = dateFnsTz.toZonedTime(
                              parseISO(classItem.endTime),
                              tutorTz
                            );

                            return (
                              <div
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewClass(classItem);
                                }}
                                className="group/class relative w-full px-2 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white border border-blue-600 hover:bg-blue-600 cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="truncate flex-1" title={classItem.title}>
                                    {classItem.title}
                                  </span>
                                  <div className="flex gap-1 group-hover/class:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClass(classItem);
                                      }}
                                      className="p-0.5 hover:bg-blue-700 rounded"
                                      title="Edit class"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteClass(classItem._id);
                                      }}
                                      className="p-0.5 hover:bg-red-600 rounded"
                                      title="Delete class"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute hidden group-hover/class:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-full ml-2 whitespace-normal">
                                  <div className="font-semibold">{classItem.title}</div>
                                  <div className="text-gray-300 mt-1">
                                    {format(startLocal, "HH:mm")} - {format(endLocal, "HH:mm")}
                                  </div>
                                  {classItem.description && (
                                    <div className="text-gray-400 mt-1 text-xs">
                                      {classItem.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <>
                          {status === "available" &&
                            (slotSocietyMap.get(key) ?? []).length > 0 && (
                              <div className="text-[9px] text-purple-700 bg-purple-100 rounded px-1 mb-0.5 text-center font-medium truncate">
                                📍 {slotSocietyMap.get(key)?.join(", ")}
                              </div>
                            )}
                          <select
                            value={status}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "create-class") {
                                onOpenCreateClass(dateStr, hour);
                                e.target.value = status;
                              } else {
                                onSlotChange(dateStr, hour, value as "available" | "unavailable");
                              }
                            }}
                            className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 border ${
                              status === "available"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            <option value="available">Available</option>
                            <option value="unavailable">-</option>
                            {status === "available" && (
                              <option value="create-class">+ Create Class</option>
                            )}
                          </select>
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded" />
          <span className="text-sm text-gray-600">Scheduled Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span className="text-sm text-gray-600">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default SlotGrid;