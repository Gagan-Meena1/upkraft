import React from "react";

export default function DayView({
  date,
  students,
  getClassesForDate,
  formatTime,
  handleClassClick,
  getInitials,
}: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Day — {date.toLocaleDateString()}</h3>
      </div>

      <div className="space-y-4">
        {students.map((student: any) => {
          const classes = getClassesForDate(student._id, date);
          return (
            <div key={student._id} className="p-3 border rounded-md">
              <div className="flex items-center gap-3 mb-2">
                {student.profileImage ? (
                  <img src={student.profileImage} className="w-8 h-8 rounded-full" alt={student.username} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-800">
                    {getInitials(student.username)}
                  </div>
                )}
                <div className="font-medium">{student.username}</div>
              </div>

              {classes.length === 0 ? (
                <div className="text-sm text-gray-500">No classes today</div>
              ) : (
                classes.map((cls: any) => (
                  <div key={cls._id} className="mb-2 p-2 bg-orange-50 rounded">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{cls.title || "Class"}</div>
                      <div className="text-xs text-gray-600">{formatTime(cls.startTime, cls.endTime)}</div>
                    </div>
                    {cls.description && <div className="mt-1 text-sm text-gray-600">{cls.description}</div>}
                    <div className="mt-2">
                      <button onClick={() => handleClassClick(cls)} className="text-xs text-purple-600">Options</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}