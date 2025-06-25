// pages/add-session.tsx
"use client"
import React, { useState } from 'react';
import { Calendar, Clock, X, Plus, ChevronLeft, ChevronRight, User, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use navigation for App Router
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import this to access query params

import dynamic from 'next/dynamic';

// Create a non-SSR version of the component
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(AddSessionPage),
  { ssr: false }
);


interface SessionForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  video: File | null;
}
 function AddSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
const courseId = searchParams.get('courseId') || '';
console.log("courseId : ",courseId);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionForm, setSessionForm] = useState<SessionForm>({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:30',
    date: '',
    video: null,
  });
  const [videoFileName, setVideoFileName] = useState<string>('');

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in month
    const daysInMonth = lastDay.getDate();
    
    // Calendar array to hold all days
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
    
    return calendarDays;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    if (!day) return;
    
    const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
     const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (selectedDate < today) {
      alert('Cannot create sessions for past dates');
      return;
    }
    setSelectedDate(dateString);
    setSessionForm({...sessionForm, date: dateString});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(null);
    setVideoFileName('');
    setErrorMessage('');
  };

   const validateDateTime = (date: string, startTime: string, endTime: string) => {
    if (!date || !startTime || !endTime) return '';
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const currentDateTime = new Date();
    
    if (startDateTime <= currentDateTime) {
      return 'Start time cannot be in the past';
    }
    
    if (endDateTime <= startDateTime) {
      return 'End time must be after start time';
    }
    
    return '';
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
 const updatedForm = {...sessionForm, [name]: value};
  setSessionForm(updatedForm);    
    // Validate time if start time, end time, or date changes
  if (name === 'startTime' || name === 'endTime') {
    const validationError = validateDateTime(
      updatedForm.date, 
      updatedForm.startTime, 
      updatedForm.endTime
    );
    setErrorMessage(validationError);
  }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Validate date and time
    const sessionDateTime = new Date(`${sessionForm.date}T${sessionForm.startTime}`);
    const currentDateTime = new Date();
    
    if (sessionDateTime <= currentDateTime) {
      throw new Error('Cannot create sessions for past date and time');
    }
    
    // Validate end time is after start time
    const startDateTime = new Date(`${sessionForm.date}T${sessionForm.startTime}`);
    const endDateTime = new Date(`${sessionForm.date}T${sessionForm.endTime}`);
    
    if (endDateTime <= startDateTime) {
      throw new Error('End time must be after start time');
    }
      // Create form data for submission including the file
      const formData = new FormData();
      formData.append('title', sessionForm.title);
      formData.append('description', sessionForm.description);
      formData.append('startTime', sessionForm.startTime);
      formData.append('endTime', sessionForm.endTime);
      formData.append('date', sessionForm.date);
      
      if (sessionForm.video) {
        formData.append('video', sessionForm.video);
      }
      
  
      // Submit to the API
      const response = await fetch('/Api/classes', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - it's automatically set with the correct boundary
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session');
      }
      
      // Success! 
      alert('Session created successfully!');
      router.push(`/tutor/courses/${courseId}`); // Redirect to tutor dashboard
    } catch (error) {
      console.error('Error creating session:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-300 to-pink-600 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
          <Link 
  href={courseId ? `/tutor/courses/${courseId}` : "/tutor/courses"} 
  className="p-2 rounded-lg bg-blue-900 hover:bg-blue-500 transition-colors"
>
  <ChevronLeft />
</Link>
            <h1 className="text-3xl font-bold text-pink-200">Add New Session</h1>
          </div>
        </header>
        
        {/* Calendar container */}
        <div className="bg-gradient-to-r from-blue-700 to-pink-800 rounded-xl p-6 shadow-lg">
          {/* Calendar header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-pink-100 flex items-center gap-2">
              <Calendar size={24} />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-200 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="text-center py-2 font-medium text-blue-200">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const isToday = day && 
                currentMonth.getFullYear() === new Date().getFullYear() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                day === new Date().getDate();
              
              const isPastDate = day && 
                new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <div 
                  key={index} 
                  className={`relative p-4 rounded-lg ${
                    day 
                      ? isPastDate 
                        ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-blue-900 to-blue-700 hover:from-blue-500 hover:to-purple-500 cursor-pointer'
                      : 'opacity-0'
                  }`}
                  onClick={() => day && !isPastDate && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <span className={`font-medium ${isPastDate ? 'text-gray-400' : ''}`}>{day}</span>
                      {!isPastDate && (
                        <button className="absolute bottom-2 right-2 w-6 h-6 bg-pink-500 hover:bg-pink-400 rounded-full flex items-center justify-center text-white">
                          <Plus size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Session Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-gradient-to-r from-blue-800 to-purple-700 rounded-xl p-6 shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-pink-200">
                  Create Session for {selectedDate}
                </h2>
                <button 
                  onClick={handleCloseForm}
                  className="text-gray-300 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-blue-200 mb-1">
                      Class Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={sessionForm.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Advanced Mathematics"
                      required
                    />
                  </div>
                  
                  
                  
                  <div>
                    <label htmlFor="description" className="block text-blue-200 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={sessionForm.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 h-24"
                      placeholder="Class description and notes..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-blue-200 mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock size={18} className="absolute top-3 left-3 text-blue-400" />
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={sessionForm.startTime}
                          onChange={handleFormChange}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="endTime" className="block text-blue-200 mb-1">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock size={18} className="absolute top-3 left-3 text-blue-400" />
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={sessionForm.endTime}
                          onChange={handleFormChange}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Upload Field */}
                  {/* <div>
                    <label htmlFor="video" className="block text-blue-200 mb-1">
                      Upload Video
                    </label>
                    <div className="relative">
                      <Video size={18} className="absolute top-3 left-3 text-blue-400" />
                      <input
                        type="file"
                        id="video"
                        name="video"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden" // Hide the default file input
                      />
                      <div className="flex">
                        <div 
                          className="w-full pl-10 pr-4 py-2 rounded-l-lg bg-blue-900 border border-blue-700 text-white overflow-hidden whitespace-nowrap overflow-ellipsis"
                        >
                          {videoFileName || "No file selected"}
                        </div>
                        <label 
                          htmlFor="video" 
                          className="cursor-pointer bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-r-lg text-white flex items-center"
                        >
                          Browse
                        </label>
                      </div>
                      {videoFileName && (
                        <p className="text-blue-200 text-sm mt-1">Selected: {videoFileName}</p>
                      )}
                    </div>
                  </div> */}
                  
                  {/* Error message display */}
                  {errorMessage && (
                    <div className="bg-red-900 text-white p-3 rounded-lg">
                      {errorMessage}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 rounded-lg font-semibold shadow-md transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}