import React from "react";

function generateMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay(); // 0..6 (Sun..Sat)
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

export default function MonthView({
  currentDate,
  students,
  onDayClick,
  getClassesForDate,
}: any) {
  const days = generateMonthDays(currentDate);
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(h => (
          <div key={h} className="text-xs text-center text-gray-500 p-2">{h}</div>
        ))}

        {days.map((d, idx) => (
          <div key={idx} className="min-h-[80px] p-2 border rounded">
            {d ? (
              <>
                <div className="text-sm font-medium">{d.getDate()}</div>
                <div className="mt-1 text-xs text-gray-600">
                  {students.some((s:any)=> getClassesForDate(s._id, d).length > 0) ? (
                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                      {students.reduce((acc:any,s:any)=> acc + getClassesForDate(s._id,d).length,0)} class(es)
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>
                <div className="mt-2">
                  <button onClick={() => onDayClick(d)} className="text-xs text-purple-600">Open day</button>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}