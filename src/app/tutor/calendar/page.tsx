"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { LogOut, ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, BookMarkedIcon, BookCheck, CheckCircle, Clock, AlertCircle, Menu, X, Home } from "lucide-react";
import Image from "next/image";
import { PiNutBold } from "react-icons/pi";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const StudentCalendarView = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
     // Use UTC methods to get the exact stored time
  const startDate = new Date(startTime);
  const start = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'  // This ensures we read the UTC time correctly
  });
  
  const end = endTime
    ? new Date(endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'  // This ensures we read the UTC time correctly
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const weekDays = getWeekDays();

  const filteredStudents = students.filter(student =>
    (student.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Grid template: first column fixed 263px, then 7 equal columns
  const gridTemplate = { gridTemplateColumns: '263px repeat(7, minmax(0, 1fr))' };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Calendar</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6">
          {/* Calendar Container */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4 text-[20px] text-[#212121]">
                <span onClick={() => changeDay(-1)} className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded">
                  {"<"}
                </span>
                <span className="font-medium text-[20px] text-[#212121]">
                  {currentDate.toLocaleDateString("en-US", {
                    day: "2-digit",
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <span onClick={() => changeDay(1)} className="cursor-pointer select-none hover:bg-gray-100 p-2 rounded">
                  {">"}
                </span>
              </div>

              <div className="flex gap-[10px]">
                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Day</option>
                  <option className="truncate">Today</option>
                  <option className="truncate">Tomorrow</option>
                  <option className="truncate">Custom...</option>
                </select>

                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Week</option>
                  <option className="truncate">This Week</option>
                  <option className="truncate">Next Week</option>
                  <option className="truncate">Custom...</option>
                </select>

                <select className="w-[90px] text-[16px] text-[#505050] border border-[#505050] rounded px-2 py-1 truncate focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option className="truncate">Month</option>
                  <option className="truncate">This Month</option>
                  <option className="truncate">Next Month</option>
                  <option className="truncate">Custom...</option>
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
   <div className="mt-2 rounded overflow-hidden">
  {/* Header Row */}
  <div
    className="grid items-stretch bg-white"
    style={gridTemplate}
  >
    {/* Search Input Cell */}
    <div className="p-3 bg-white">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        placeholder="Search Students"
        className="w-full h-[48px] px-4 rounded 
                  border border-[#505050] 
                  text-[14px] text-[#505050] 
                  bg-white 
                  font-inter font-normal
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>

    {/* Week Day Headers */}
    {weekDays.map((day, idx) => (
      <div key={idx} className="p-3 text-center bg-[#F5F5F5]">
        <div className="text-[16px] font-inter font-medium text-[#212121]">
          {day.toLocaleDateString('en-US', { day: '2-digit', weekday: 'short' })}
        </div>
      </div>
    ))}
  </div>

  {/* Calendar Body */}
  <div className="max-h-[70vh] overflow-auto">
    {filteredStudents.length === 0 ? (
      <div className="p-8 text-center">
        <div className="text-[16px] text-[#9B9B9B] mb-2">No students to display</div>
        <div className="text-[14px] text-[#C4C4C4]">
          {searchTerm ? 'Try adjusting your search terms' : 'No students found in the system'}
        </div>
      </div>
    ) : (
      filteredStudents.map((student) => (
        <div 
          key={student._id} 
          className="grid items-center hover:bg-gray-50 transition-colors" 
          style={gridTemplate}
        >
          {/* Student Info Cell */}
          <div className="p-3 flex items-center gap-3 min-h-[88px] border-r border-gray-200">
            {student.profileImage ? (
              <img 
                src={student.profileImage} 
                alt={student.username} 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-600">
                {getInitials(student.username)}
              </div>
            )}
            <div>
              <div className="text-[14px] text-[#212121] font-medium">
                {student.username}
              </div>
            </div>
          </div>

          {/* Daily Schedule Cells */}
          {weekDays.map((day, idx) => {
            const classes = getClassesForDate(student._id, day);
            return (
              <div key={idx} className="p-3 min-h-[88px]">
                {classes.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-[12px] text-[#E0E0E0]">No classes</div>
                  </div>
                ) : (
                  classes.map((classItem, cIdx) => (
                    <div
                      key={classItem._id || cIdx}
                      className="mb-2 last:mb-0 p-2 bg-orange-50 border-l-4 border-orange-400 text-xs text-[#212121] rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      title={`${classItem.title || 'Class'} - ${formatTime(classItem.startTime, classItem.endTime)}`}
                    >
                      <div className="font-medium text-[13px] truncate">
                        {classItem.title || 'Class'}
                      </div>
                      <div className="text-[11px] text-gray-600 truncate">
                        {formatTime(classItem.startTime, classItem.endTime)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ))
    )}
  </div>
</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCalendarView;