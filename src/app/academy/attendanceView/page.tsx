"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, ArrowLeft } from "lucide-react";

interface UserData {
  _id: string;
  username: string;
  email: string;
  timezone: string;
  profileImage?: string;
}

interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  students: Array<{
    userId: string;
    status: 'present' | 'absent' | 'pending';
  }>;
}

const UserAttendanceView = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState<string>("UTC");

  // Get userId from URL
  const getUserIdFromUrl = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
  };

  const userId = getUserIdFromUrl();

  // Timezone conversion helpers
  const convertToTimezone = (date: Date, timezone: string): Date => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcDate.getTime() - tzDate.getTime();
    return new Date(date.getTime() - offset);
  };

  const formatDate = (date: Date, formatStr: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return formatStr
      .replace('yyyy', String(year))
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const cachedUser = sessionStorage.getItem(`user_${userId}`);
        if (cachedUser) {
          const user = JSON.parse(cachedUser);
          setUserData(user);
          setUserTimezone(user.timezone || 'UTC');
        } else {
          const response = await fetch(`/Api/academy/userDetail?userId=${userId}`);
          const data = await response.json();
          if (data.success && data.user) {
            setUserData(data.user);
            setUserTimezone(data.user.timezone || 'UTC');
            sessionStorage.setItem(`user_${userId}`, JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await fetch(`/Api/classes?userid=${userId}`);
        const data = await response.json();
        
        if (data.classData) {
          console.log("Fetched classes:", data.classData);
          setClasses(data.classData);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [userId]);

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

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const formatDateString = (date: Date): string => {
    return formatDate(date, 'yyyy-MM-dd');
  };

  const getClassesForSlot = (date: string, hour: number): ClassData[] => {
    if (!userId || classes.length === 0) return [];

    return classes.filter((classItem) => {
      try {
        const startUTC = new Date(classItem.startTime);
        const endUTC = new Date(classItem.endTime);
        
        const startLocal = convertToTimezone(startUTC, userTimezone);
        const endLocal = convertToTimezone(endUTC, userTimezone);

        const classDate = formatDate(startLocal, 'yyyy-MM-dd');
        const startHour = startLocal.getHours();
        const endHour = endLocal.getHours();

        return classDate === date && hour >= startHour && hour < endHour;
      } catch (error) {
        console.error("Error processing class:", error);
        return false;
      }
    });
  };

  const getAttendanceStatus = (classItem: ClassData): 'present' | 'absent' | 'pending' => {
    const studentRecord = classItem.students?.find(s => s.userId === userId);
    return studentRecord?.status || 'pending';
  };

  const getClassStyle = (classItem: ClassData) => {
    if (classItem.status.toLowerCase() === 'cancelled' || classItem.status.toLowerCase() === 'cancel') {
      return {
        bg: 'bg-gray-400',
        border: 'border-gray-500',
        text: 'text-white',
        label: 'Cancelled'
      };
    }

    const status = getAttendanceStatus(classItem);
    
    switch (status) {
      case 'present':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          text: 'text-white',
          label: 'Present'
        };
      case 'absent':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-white',
          label: 'Absent'
        };
      default:
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          text: 'text-white',
          label: 'Pending'
        };
    }
  };

  const getWeekdayShort = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMonthDay = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getMonthDayYear = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const goBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  // Get unique hours that have classes
  const getActiveHours = (): number[] => {
    if (classes.length === 0) return [];

    const weekDays = getWeekDays();
    const hoursSet = new Set<number>();

    classes.forEach((classItem) => {
      try {
        const startUTC = new Date(classItem.startTime);
        const endUTC = new Date(classItem.endTime);
        
        const startLocal = convertToTimezone(startUTC, userTimezone);
        const endLocal = convertToTimezone(endUTC, userTimezone);

        const classDate = formatDate(startLocal, 'yyyy-MM-dd');
        
        // Check if class is in current week
        const isInWeek = weekDays.some(day => formatDateString(day) === classDate);
        
        if (isInWeek) {
          const startHour = startLocal.getHours();
          const endHour = endLocal.getHours();
          
          for (let hour = startHour; hour <= endHour; hour++) {
            hoursSet.add(hour);
          }
        }
      } catch (error) {
        console.error("Error processing class for hours:", error);
      }
    });

    return Array.from(hoursSet).sort((a, b) => a - b);
  };

  const weekDays = getWeekDays();
  const hours = getActiveHours();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userId || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={goBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Schedule
            </h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {userData.profileImage && (
              <img
                src={userData.profileImage}
                alt={userData.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{userData.username}</h2>
              <p className="text-sm text-gray-600">{userData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Timezone: {userTimezone}</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {/* Week Navigation */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Week of {getMonthDayYear(weekDays[0])}
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

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            {hours.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No classes scheduled for this week</p>
              </div>
            ) : (
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-8 gap-2" style={{ minWidth: "800px" }}>
                  {/* Header */}
                  <div className="font-semibold text-center py-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Time
                  </div>
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="font-semibold text-center py-3 bg-purple-100 rounded-lg">
                      <div className="text-sm">{getWeekdayShort(day)}</div>
                      <div className="text-xs text-gray-600">{getMonthDay(day)}</div>
                    </div>
                  ))}

                {/* Time slots */}
                {hours.map((hour) => (
                  <div key={hour} className="contents group">
                    <div className="text-sm font-medium text-gray-700 py-2 text-center bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                      {String(hour).padStart(2, "0")}:00
                    </div>

                    {weekDays.map((day) => {
                      const dateStr = formatDateString(day);
                      const slotClasses = getClassesForSlot(dateStr, hour);

                      return (
                        <div key={`${dateStr}-${hour}`} className="py-1 group-hover:bg-purple-50 transition-colors">
                          {slotClasses.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {slotClasses.map((classItem, idx) => {
                                const startLocal = convertToTimezone(new Date(classItem.startTime), userTimezone);
                                const endLocal = convertToTimezone(new Date(classItem.endTime), userTimezone);
                                const style = getClassStyle(classItem);
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`group/class relative w-full px-2 py-1.5 rounded-lg text-xs font-medium ${style.bg} ${style.text} border ${style.border} cursor-pointer hover:opacity-90 transition-opacity`}
                                  >
                                    <div className="truncate">{classItem.title}</div>
                                    <div className="text-[10px] opacity-90">{style.label}</div>
                                    
                                    {/* Tooltip */}
                                    <div className="absolute hidden group-hover/class:block z-10 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-full ml-2 whitespace-normal">
                                      <div className="font-semibold mb-1">{classItem.title}</div>
                                      <div className="text-gray-300 mb-1">
                                        {formatDate(startLocal, 'HH:mm')} - {formatDate(endLocal, 'HH:mm')}
                                      </div>
                                      <div className="text-gray-300">
                                        Status: {style.label}
                                      </div>
                                      {classItem.status.toLowerCase() === 'cancelled' && (
                                        <div className="text-red-400 mt-1 text-[10px]">
                                          Class was cancelled
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="w-full h-full min-h-[40px] bg-gray-50 rounded-lg"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Legend */}
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 border border-yellow-600 rounded"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserAttendanceView;