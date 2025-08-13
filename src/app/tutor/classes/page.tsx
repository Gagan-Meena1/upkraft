"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, X, Plus, ChevronLeft, ChevronRight } from "lucide-react"

// Mock UI components that match shadcn/ui styling
const Button = ({ children, className, variant, size, onClick, disabled, ...props }) => (
  <button 
    className={`px-4 py-2 rounded font-medium transition-colors ${
      variant === 'ghost' ? 'hover:bg-gray-100 text-gray-800' : 
      disabled ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 
      'bg-[#6B46C1] hover:bg-[#5A3A9F] text-white'
    } ${className || ''}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className || ''}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className }) => (
  <div className={`p-6 pb-4 ${className || ''}`}>{children}</div>
)

const CardTitle = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className || ''}`}>{children}</h3>
)

const CardContent = ({ children, className }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
)

const Input = ({ className, ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#6B46C1] focus:border-[#6B46C1] outline-none placeholder-gray-400 text-gray-800 ${className || ''}`}
    {...props}
  />
)

const Textarea = ({ className, ...props }) => (
  <textarea 
    className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#6B46C1] focus:border-[#6B46C1] outline-none resize-none placeholder-gray-400 text-gray-800 ${className || ''}`}
    {...props}
  />
)

export default function AddSessionPage() {
  // State for courseId - initialize as empty string and set in useEffect
  const [courseId, setCourseId] = useState('')
  
  // EXACT same state structure
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:30',
    date: '',
    video: null,
  })

  // Safely get courseId from URL params only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const id = urlParams.get('courseId') || ''
      setCourseId(id)
    }
  }, [])

  // EXACT same helper functions from original
  const formatDateToString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return { year, month: month - 1, day } // month is 0-indexed for Date constructor
  }

  const isDateInPast = (year, month, day) => {
    const today = new Date()
    const compareDate = new Date(year, month, day)
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return compareDate < todayDate
  }

  // EXACT same calendar generation logic
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const calendarDays = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i)
    }
    
    return calendarDays
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // EXACT same date click logic - no modal, just update form
  const handleDateClick = (day) => {
    if (!day) return
    
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Check if date is in the past
    if (isDateInPast(year, month, day)) {
      alert('Cannot create sessions for past dates')
      return
    }
    
    const dateString = formatDateToString(year, month, day)
    setSelectedDate(dateString)
    setSessionForm({...sessionForm, date: dateString})
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedDate(null)
    setErrorMessage('')
    // Reset form
    setSessionForm({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:30',
      date: '',
      video: null,
    })
  }

  // EXACT same validation logic with timezone handling
  const validateDateTime = (date, startTime, endTime) => {
    if (!date || !startTime || !endTime) return ''
    
    const { year, month, day } = parseDateString(date)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    // Create date objects using local timezone
    const startDateTime = new Date(year, month, day, startHour, startMinute)
    const endDateTime = new Date(year, month, day, endHour, endMinute)
    const currentDateTime = new Date()
    
    // Check if start time is in the past
    if (startDateTime <= currentDateTime) {
      return 'Start time cannot be in the past'
    }
    
    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      return 'End time must be after start time'
    }
    
    return ''
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    const updatedForm = {...sessionForm, [name]: value}
    setSessionForm(updatedForm)
    
    // Validate time if start time, end time, or date changes
    if (name === 'startTime' || name === 'endTime') {
      const validationError = validateDateTime(
        updatedForm.date, 
        updatedForm.startTime, 
        updatedForm.endTime
      )
      setErrorMessage(validationError)
    }
  }

  // EXACT same submit logic with timezone handling
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      // Parse date and time components
      const { year, month, day } = parseDateString(sessionForm.date)
      const [startHour, startMinute] = sessionForm.startTime.split(':').map(Number)
      const [endHour, endMinute] = sessionForm.endTime.split(':').map(Number)
      
      // Create datetime objects for validation
      const sessionDateTime = new Date(year, month, day, startHour, startMinute)
      const endDateTime = new Date(year, month, day, endHour, endMinute)
      const currentDateTime = new Date()
      
      // Validation checks
      if (sessionDateTime <= currentDateTime) {
        throw new Error('Cannot create sessions for past date and time')
      }
      
      if (endDateTime <= sessionDateTime) {
        throw new Error('End time must be after start time')
      }

      // Create form data for submission
      const formData = new FormData()
      formData.append('title', sessionForm.title)
      formData.append('description', sessionForm.description)
      
      // Send date and time as separate values to maintain precision
      formData.append('date', sessionForm.date) // YYYY-MM-DD format
      formData.append('startTime', sessionForm.startTime) // HH:MM format
      formData.append('endTime', sessionForm.endTime) // HH:MM format
      
      // Add timezone information - THIS IS THE KEY PART YOU MENTIONED
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
      
      if (sessionForm.video) {
        formData.append('video', sessionForm.video)
      }
      
      // Submit to the API
      const response = await fetch('/Api/classes', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session')
      }
      
      // Success! Navigate back exactly as original
      alert('Session created successfully!')
      if (typeof window !== 'undefined') {
        window.location.href = `/tutor/courses/${courseId}`
      }
    } catch (error) {
      console.error('Error creating session:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create session')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Safe navigation function
  const handleBackNavigation = () => {
    if (typeof window !== 'undefined') {
      window.location.href = courseId ? `/tutor/courses/${courseId}` : "/tutor/courses"
    }
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdaysMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackNavigation}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add New Session</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div>
          <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 text-gray-800"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 text-gray-800"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((day, index) => (
                <div key={day} className="text-center py-1 sm:py-2 font-medium text-gray-500 text-xs sm:text-base">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{weekdaysMobile[index]}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, index) => {
                const year = currentMonth.getFullYear()
                const month = currentMonth.getMonth()
                
                const isToday = day && 
                  year === new Date().getFullYear() &&
                  month === new Date().getMonth() &&
                  day === new Date().getDate()
                
                const isPastDate = day && isDateInPast(year, month, day)
                
                return (
                  <div 
                    key={index} 
                    className={`relative p-2 sm:p-4 rounded-lg min-h-[3rem] sm:min-h-[4rem] ${
                      day 
                        ? isPastDate 
                          ? 'bg-gray-200 opacity-50 cursor-not-allowed' 
                          : selectedDate === formatDateToString(year, month, day)
                          ? 'bg-[#6B46C1] text-white shadow-md'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer shadow-sm'
                        : 'opacity-0'
                    }`}
                    onClick={() => day && !isPastDate && handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <span className={`font-medium text-sm sm:text-base ${isPastDate ? 'text-gray-400' : selectedDate === formatDateToString(year, month, day) ? 'text-white' : 'text-gray-700'} ${isToday ? 'text-[#6B46C1] font-bold' : ''}`}>
                          {day}
                        </span>
                        {!isPastDate && (
                          <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#6B46C1] hover:bg-[#5A3A9F] rounded-full flex items-center justify-center text-white">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
                  </Card>
        </div>

        {/* Form Section - Always visible */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Create Session for {selectedDate || 'Select a date'}
              </CardTitle>
              <p className="text-sm text-gray-600">Add details below to create new session</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-gray-800 mb-1 text-sm font-medium">
                    Class Title
                  </label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={sessionForm.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Advanced Mathematics"
                    disabled={!selectedDate}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-gray-800 mb-1 text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={sessionForm.description}
                    onChange={handleFormChange}
                    className="h-24 resize-none"
                    placeholder="Class description and notes..."
                    disabled={!selectedDate}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-gray-800 mb-1 text-sm font-medium">
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-2.5 left-3 text-gray-500 w-4 h-4" />
                      <Input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={sessionForm.startTime}
                        onChange={handleFormChange}
                        className="pl-10"
                        disabled={!selectedDate}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="block text-gray-800 mb-1 text-sm font-medium">
                      End Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-2.5 left-3 text-gray-500 w-4 h-4" />
                      <Input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={sessionForm.endTime}
                        onChange={handleFormChange}
                        className="pl-10"
                        disabled={!selectedDate}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Display selected date for confirmation */}
                {selectedDate && (
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="text-gray-600 text-sm">Selected Date: </span>
                    <span className="text-gray-800 font-medium">{selectedDate}</span>
                  </div>
                )}
                
                {/* Error message display */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 bg-[#6B46C1] hover:bg-[#5A3A9F] text-white rounded font-semibold shadow-md transition-colors disabled:opacity-50 text-sm"
                  disabled={isSubmitting || !!errorMessage || !selectedDate}
                >
                  {isSubmitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Remove the modal code since we don't need it anymore */}
    </div>
  )
}