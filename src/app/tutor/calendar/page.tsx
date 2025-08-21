"use client"
import React, { useState, useEffect } from 'react';

const StudentCalendarView = () => {
  const [students, setStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await fetch('/Api/myStudents');
      const data = await response.json();
      if (data.success) {
        setStudents(data.filteredUsers || []);
        return data.filteredUsers || [];
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  // Fetch classes for all students
  const fetchAllClasses = async (studentList) => {
    try {
      const classPromises = studentList.map(async (student) => {
        const response = await fetch(`/Api/classes?userid=${student._id}`);
        const data = await response.json();
        return {
          studentId: student._id,
          classes: data.classData || []
        };
      });

      const results = await Promise.all(classPromises);
      setAllClasses(results);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const studentList = await fetchStudents();
      if (studentList.length > 0) {
        await fetchAllClasses(studentList);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const cloneDate = (d) => new Date(d.getTime());

  // Get days for current week (Mon - Sun)
  const getWeekDays = () => {
    const ref = cloneDate(currentDate);
    const day = ref.getDay();
    const diff = ref.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const startOfWeek = cloneDate(ref);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = cloneDate(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getClassesForDate = (studentId, date) => {
    const studentClasses = allClasses.find(item => item.studentId === studentId);
    if (!studentClasses) return [];

    return studentClasses.classes.filter(classItem => {
      if (!classItem.startTime) return false;
      const classDate = new Date(classItem.startTime);
      return classDate.toDateString() === date.toDateString();
    });
  };

  const changeDay = (deltaDays) => {
    const d = cloneDate(currentDate);
    d.setDate(d.getDate() + deltaDays);
    setCurrentDate(d);
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return '';
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const end = endTime
      ? new Date(endTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      : '';
    return end ? `${start} - ${end}` : start;
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const weekDays = getWeekDays();

  const filteredStudents = students.filter(student =>
    (student.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-gray-600 font-medium">Loading calendar...</div>
        </div>
      </div>
    );
  }

  // gridTemplateColumns: first column fixed 263px (your original), then 7 equal columns
  const gridTemplate = { gridTemplateColumns: '263px repeat(7, minmax(0, 1fr))' };

  return (
    <div className="w-[1647px] h-[936px] bg-white rounded-lg shadow-md p-6 mt-5">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 text-[20px] text-[#212121]">
          <span onClick={() => changeDay(-1)} className="cursor-pointer select-none">{"<"}</span>
          <span className="font-medium text-[20px] text-[#212121]">
            {currentDate.toLocaleDateString("en-US", {
              day: "2-digit",
              weekday: "long",
              year: "numeric",
              month: "long",
            })}
          </span>
          <span onClick={() => changeDay(1)} className="cursor-pointer select-none">{">"}</span>
        </div>

        <div className="flex gap-[10px]">
          <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate">
            <option className="truncate">Day</option>
            <option className="truncate">Today</option>
            <option className="truncate">Tomorrow</option>
            <option className="truncate">Custom...</option>
          </select>

          <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate">
            <option className="truncate">Week</option>
            <option className="truncate">This Week</option>
            <option className="truncate">Next Week</option>
            <option className="truncate">Custom...</option>
          </select>

          <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate">
            <option className="truncate">Month</option>
            <option className="truncate">This Month</option>
            <option className="truncate">Next Month</option>
            <option className="truncate">Custom...</option>
          </select>
        </div>
      </div>

      {/* Table-like grid: first column student info, next 7 columns days */}
      <div className="mt-2 border border-gray-200 rounded">
        {/* Header row - sticky */}
        <div
          className="grid items-stretch bg-white border-b"
          style={gridTemplate}
        >
          {/* top-left cell: search (keeps your input styling) */}
          <div className="p-3 border-r bg-white">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search Students"
              className="w-full h-[48px] px-4 rounded 
                        border border-[#505050] 
                        text-[14px] text-[#505050] 
                        bg-[white] 
                        font-inter font-normal"
            />
          </div>

          {weekDays.map((day, idx) => (
            <div key={idx} className="p-3 text-center bg-[#F5F5F5] border-r last:border-r-0">
              <div className="text-[16px] font-inter font-medium text-[#212121]">
                {day.toLocaleDateString('en-US', { day: '2-digit', weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Body rows */}
        <div className="max-h-[76vh] overflow-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-[14px] text-[#9B9B9B]">No students to display</div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="grid items-center border-b" style={gridTemplate}>
                {/* student info cell */}
                <div className="p-3 flex items-center gap-3 border-r min-h-[88px]">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {getInitials(student.username)}
                    </div>
                  )}
                  <div>
                    <div className="text-[14px] text-[#212121] font-medium">{student.username}</div>
                    <div className="text-[12px] text-[#9B9B9B]">Piano Student</div>
                  </div>
                </div>

                {/* 7 day cells */}
                {weekDays.map((day, idx) => {
                  const classes = getClassesForDate(student._id, day);
                  return (
                    <div key={idx} className="p-3 border-r last:border-r-0 min-h-[88px]">
                      {classes.map((classItem, cIdx) => (
                        <div
                          key={classItem._id || cIdx}
                          className="mb-2 p-2 bg-purple-50 border-l-4 border-purple-400 text-xs text-[#212121] rounded-md shadow-sm w-max"
                        >
                          <div className="font-medium text-[13px]">
                            {classItem.title || 'Class'}
                          </div>
                          <div className="text-[11px] text-gray-600">
                            {formatTime(classItem.startTime, classItem.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCalendarView;
