"use client"
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Get days for current week
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get classes for a specific student and date
  const getClassesForDate = (studentId, date) => {
    const studentClasses = allClasses.find(item => item.studentId === studentId);
    if (!studentClasses) return [];

    return studentClasses.classes.filter(classItem => {
      const classDate = new Date(classItem.startTime);
      return classDate.toDateString() === date.toDateString();
    });
  };

  // Navigate weeks
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Format date for display
  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      isToday
    };
  };

  // Format time
  const formatTime = (startTime, endTime) => {
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${start} - ${end}`;
  };

  // Get week range text
  const getWeekRangeText = () => {
    const days = getWeekDays();
    const firstDay = days[0];
    const lastDay = days[6];
    
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${firstDay.toLocaleDateString('en-US', { month: 'long' })} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
    } else {
      return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${firstDay.getFullYear()}`;
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-full mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-lg shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {getWeekRangeText()}
              </h1>
              <p className="text-sm text-gray-500">Weekly View</p>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded-lg shadow-sm"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search Students"
              className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Row - Days */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">
              Students
            </div>
            {weekDays.map((day, index) => {
              const { dayName, date, isToday } = formatDate(day);
              return (
                <div 
                  key={index} 
                  className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {dayName}
                  </div>
                  <div className={`text-lg font-bold mt-1 ${
                    isToday ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'
                  }`}>
                    {date}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student, studentIndex) => (
              <div key={student._id} className="grid grid-cols-8 min-h-[120px]">
                {/* Student Info */}
                <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {student.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {student.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        Student
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Cells */}
                {weekDays.map((day, dayIndex) => {
                  const dayClasses = getClassesForDate(student._id, day);
                  const { isToday } = formatDate(day);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-3 border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        {dayClasses.map((classItem, classIndex) => (
                          <div 
                            key={classIndex} 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="font-semibold text-sm mb-1 truncate">
                              {classItem.title}
                            </div>
                            <div className="text-xs opacity-90">
                              {formatTime(classItem.startTime, classItem.endTime)}
                            </div>
                            {classItem.description && (
                              <div className="text-xs opacity-75 mt-1 truncate">
                                {classItem.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredStudents.length === 0 && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">No students found</div>
              <div className="text-sm">Try adjusting your search terms</div>
            </div>
          </div>
        )}

        {/* Students count */}
        {filteredStudents.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalendarView;