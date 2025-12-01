import React from "react";

export default function WeekView({
  weekDays,
  students,
  getClassesForDate,
  formatTime,
  handleClassClick,
  gridTemplate,
  getInitials,
}: any) {
  return (
    <div className="mt-2 rounded overflow-hidden">
      <div className="grid items-stretch bg-white" style={gridTemplate}>
        <div className="p-3 bg-white">
          <input
            disabled
            className="w-full h-[48px] px-4 rounded border border-[#505050] bg-white"
            placeholder="Students"
          />
        </div>
        {weekDays.map((day: Date, idx: number) => (
          <div key={idx} className="p-3 text-center bg-[#F5F5F5]">
            <div className="text-[16px] font-medium text-[#212121]">
              {day.toLocaleDateString("en-US", { day: "2-digit", weekday: "short" })}
            </div>
          </div>
        ))}
      </div>

      <div className="max-h-[70vh] overflow-auto">
        {students.map((student: any) => (
          <div key={student._id} className="grid items-center hover:bg-gray-50 transition-colors" style={gridTemplate}>
            <div className="p-3 flex items-center gap-3 min-h-[88px] border-r border-gray-200">
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.username} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-800">
                  {getInitials(student.username)}
                </div>
              )}
              <div>
                <div className="text-[14px] text-[#212121] font-medium">{student.username}</div>
              </div>
            </div>

            {weekDays.map((day: Date, idx: number) => {
              const classes = getClassesForDate(student._id, day);
              return (
                <div key={idx} className="p-3 min-h-[88px]">
                  {classes.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-[12px] text-[#E0E0E0]">No classes</div>
                    </div>
                  ) : (
                    classes.map((classItem: any) => (
                      <div
                        key={classItem._id || `${student._id}-${idx}`}
                        className="mb-2 last:mb-0 p-2 bg-purple-50 border-l-4 border-purple-400 hover:bg-purple-100 text-xs text-[#212121] rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        title={`${classItem.title || "Class"} - ${formatTime(classItem.startTime, classItem.endTime)}`}
                        onClick={() => handleClassClick(classItem)}
                      >
                        <div className="font-medium text-[13px] truncate">{classItem.title || "Class"}</div>
                        <div className="text-[11px] text-gray-600 truncate">{formatTime(classItem.startTime, classItem.endTime)}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}