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

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-lg text-gray-600 font-medium">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-3 border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all rounded-xl shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {getWeekRangeText()}
              </h1>
              <p className="text-sm text-gray-500 font-medium">Weekly Calendar View</p>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-3 border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all rounded-xl shadow-sm"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search Students..."
              className="w-80 pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header Row - Days */}
          <div className="grid bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200" style={{gridTemplateColumns: '300px repeat(7, 1fr)'}}>
            <div className="px-6 py-5 font-bold text-gray-800 border-r border-gray-200 bg-white">
              <div className="text-lg">Students</div>
              <div className="text-xs text-gray-500 font-normal mt-1">
                {filteredStudents.length} total
              </div>
            </div>
            {weekDays.map((day, index) => {
              const { dayName, date, isToday } = formatDate(day);
              return (
                <div 
                  key={index} 
                  className={`px-4 py-5 text-center border-r border-gray-200 last:border-r-0 transition-colors ${
                    isToday ? 'bg-purple-100 border-purple-200' : ''
                  }`}
                >
                  <div className={`font-bold text-sm ${isToday ? 'text-purple-700' : 'text-gray-700'}`}>
                    {dayName.toUpperCase()}
                  </div>
                  <div className={`text-xl font-bold mt-2 ${
                    isToday ? 'text-white bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center mx-auto shadow-lg' : 'text-gray-900'
                  }`}>
                    {date}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student, studentIndex) => (
              <div key={student._id} className="grid min-h-[140px] hover:bg-gray-50/50 transition-colors" style={{gridTemplateColumns: '300px repeat(7, 1fr)'}}>
                {/* Student Info */}
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-r border-gray-200 flex items-center">
                  <div className="flex items-center gap-4 w-full">
                    {/* Student Avatar */}
                    <div className="relative flex-shrink-0">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.username}
                          className="h-14 w-14 rounded-full object-cover shadow-lg ring-2 ring-white"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-white ${student.profileImage ? 'hidden' : 'flex'}`}
                        style={{ display: student.profileImage ? 'none' : 'flex' }}
                      >
                        <span className="text-white font-bold text-lg">
                          {getInitials(student.username)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Student Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base">
                        {student.username}
                      </div>
                      {/* <div className="text-sm text-gray-500 mt-1">
                        {student.email}
                      </div> */}
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
                      className={`p-4 border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-purple-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-3">
                        {dayClasses.length > 0 ? (
                          dayClasses.map((classItem, classIndex) => (
                            <div 
                              key={classIndex} 
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                            >
                              <div className="font-bold text-sm mb-2 leading-tight">
                                {classItem.title}
                              </div>
                              <div className="text-xs opacity-90 font-medium mb-2">
                                {formatTime(classItem.startTime, classItem.endTime)}
                              </div>
                              {classItem.description && (
                                <div className="text-xs opacity-80 leading-relaxed">
                                  {classItem.description.length > 50 
                                    ? `${classItem.description.substring(0, 50)}...`
                                    : classItem.description
                                  }
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-300 text-sm">No classes</div>
                          </div>
                        )}
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
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <div className="text-xl font-semibold text-gray-700 mb-2">No students found</div>
              <div className="text-sm text-gray-500">Try adjusting your search terms or check back later</div>
            </div>
          </div>
        )}

        {/* Students count */}
        {filteredStudents.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalendarView;