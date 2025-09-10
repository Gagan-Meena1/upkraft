"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut,ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, BookMarkedIcon, BookCheck, CheckCircle, Clock, AlertCircle, Menu, X } from "lucide-react";
import Image from "next/image";
import { PiNutBold } from "react-icons/pi";
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Dynamically import VideoMeeting component with no SSR
const VideoMeeting = dynamic(() => import('../components/VideoMeeting'), {
  ssr: false,
});

interface UserData {
  _id: string;
  name: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
}

interface ClassData {
  _id: string;
  title: string;
  course: string;
  instructor: string;
  description: string;
  startTime: string;
  endTime: string;
  recording: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentData {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  courseId: string;
  courseTitle?: string;
  courseCategory?: string;
  courseDuration?: string;
  courseDescription?: string;
  status?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MeetingState {
  isActive: boolean;
  url: string | null;
  classId: string | null;
}

// Progress Box Components
const ClassProgressBox = ({ completedClasses, totalClasses }: { completedClasses: number; totalClasses: number }) => {
  const progressPercentage = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Class Progress</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                Completed: <span className="font-medium text-green-600">{completedClasses}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">{totalClasses}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-orange-500">
            {completedClasses}/{totalClasses}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {progressPercentage.toFixed(0)}% Complete
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const AssignmentProgressBox = ({ incompleteAssignments, totalAssignments }: { incompleteAssignments: number; totalAssignments: number }) => {
  const completedAssignments = totalAssignments - incompleteAssignments;
  const progressPercentage = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Assignment Progress</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                Completed: <span className="font-medium text-green-600">{completedAssignments}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                Pending: <span className="font-medium text-red-600">{incompleteAssignments}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-orange-500">
            {completedAssignments}/{totalAssignments}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {progressPercentage.toFixed(0)}% Complete
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const StudentsCountBox = ({ studentCount }: { studentCount: number }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">My Students</h3>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">
              Total Students: <span className="font-medium text-blue-600">{studentCount}</span>
            </span>
          </div>
        </div>
        
        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold text-blue-500">
            {studentCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Active Students
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [meeting, setMeeting] = useState<MeetingState>({
    isActive: false,
    url: null,
    classId: null
  });

  const classesPerPage = isMobile ? 1 : 3; // Show 1 class per page on mobile
  const totalPages = Math.ceil(classData.length / classesPerPage);

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

  const filterFutureClasses = (classes: ClassData[]) => {
    const now = new Date();
    return classes.filter(classItem => {
      const classStartTime = new Date(classItem.startTime);
      return classStartTime > now;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data from single endpoint
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        
        // Fetch assignments data (keeping this separate as it's not mentioned in the single API)
        const assignmentResponse = await fetch("/Api/assignment");
        const assignmentResponseData = await assignmentResponse.json();
        
        // Set user data
        setUserData(userData.user);
        
        // Set student count from the API response
        setStudentCount(userData.studentCount || 0);
        
        // Set class data from classDetails in the response
        if (userData.classDetails && userData.classDetails.length > 0) {
          // Sort classes by startTime
          const sortedClasses = userData.classDetails.sort((a: ClassData, b: ClassData) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          
          const futureClasses = filterFutureClasses(sortedClasses);
          setClassData(futureClasses);
        } else {
          setClassData([]);
        }
        
        // Set assignment data if available
        if (assignmentResponseData?.assignments) {
          setAssignmentData(assignmentResponseData.assignments);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

 const formatTime = (dateString: string) => {
  const utcDate = new Date(dateString);
  // Treat the UTC time as if it were local time
  const localDate = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );
  
  return localDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  const handleNextPage = () => {
    if (activePage < totalPages - 1) {
      setActivePage(activePage + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const currentClasses = classData.slice(
    activePage * classesPerPage,
    (activePage + 1) * classesPerPage
  );

  const handleJoinMeeting = async (classId: string) => {
    try {
      console.log("[Meeting] Creating meeting for class:", classId);
      const response = await fetch('/Api/meeting/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId:classId , userId:userData._id, userRole:userData.category  }),
      });
      console.log("userData:", userData);
      console.log("[printing for debugging] userData:", userData);
      
      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      // Instead of setting meeting state, redirect to video call page
      router.push(`/tutor/video-call?url=${encodeURIComponent(data.url)}&userRole=${userData.category}`);
    } catch (error: any) {
      console.error('[Meeting] Error details:', error);
      toast.error(error.message || 'Failed to create meeting. Please try again.');
    }
  };

  const handleLeaveMeeting = () => {
    setMeeting({
      isActive: false,
      url: null,
      classId: null
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Calculate progress data
  const totalClasses = classData.length;
  const completedClasses = classData.filter(classItem => classItem.recording).length;
  
  // Calculate assignment progress
  const totalAssignments = assignmentData.length;
  const incompleteAssignments = assignmentData.filter(assignment => !assignment.status).length;

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 h-screen ${
        isMobile 
          ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : sidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-l text-orange-600 ${!sidebarOpen && !isMobile && 'hidden'}`}>
            <Link href="/tutor" className="cursor-pointer">
              <Image 
                src="/logo.png"
                alt="UpKraft"
                width={288}
                height={72}
                priority
                className="object-contain w-36 h-auto" 
              />
            </Link>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {isMobile ? (
              sidebarOpen ? <X size={20} /> : <Menu size={20} />
            ) : (
              sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
            )}
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-2 py-4">
            <Link 
              href="tutor/profile" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <User size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Profile</span>}
            </Link>
            <Link 
              href="tutor/courses" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <BookOpen size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Courses</span>}
            </Link>
            <Link 
              href="tutor/create-course" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <PlusCircle size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Create Course</span>}
            </Link>
            <Link 
              href="tutor/myStudents" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <User size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Students</span>}
            </Link>
            <Link 
              href="tutor/assignments" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
            
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Assignments</span>}
            </Link>
          <Link 
              href="/visualizer.html" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
            
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Practice Studio</span>}
            </Link>
               <Link 
              href="/tutor/music-library" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
            
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Music Library</span>}
            </Link>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/Api/users/logout');
                  if (response.ok) {
                    toast.success('Logged out successfully');
                    router.push('/login');
                  } else {
                    toast.error('Failed to logout');
                  }
                } catch (error) {
                  toast.error('Error during logout');
                  console.error('Logout error:', error);
                }
                isMobile && setSidebarOpen(false);
              }}
              className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
            >
              <LogOut size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {meeting.isActive && meeting.url ? (
          <div className="p-4 sm:p-6">
            <VideoMeeting url={meeting.url} onLeave={handleLeaveMeeting} />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
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
              {/* Progress Boxes - Stack on mobile, row on desktop */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
                {totalClasses > 0 && (
                  <ClassProgressBox 
                    completedClasses={completedClasses} 
                    totalClasses={totalClasses} 
                  />
                )}
                
                {totalAssignments > 0 && (
                  <AssignmentProgressBox 
                    incompleteAssignments={incompleteAssignments} 
                    totalAssignments={totalAssignments} 
                  />
                )}
                
                <StudentsCountBox studentCount={studentCount} />
              </div>

              {/* Upcoming Classes Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Classes</h2>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button 
                      onClick={handlePrevPage}
                      disabled={activePage === 0}
                      className={`p-2 rounded-lg ${activePage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={handleNextPage}
                      disabled={activePage === totalPages - 1 || totalPages === 0}
                      className={`p-2 rounded-lg ${activePage === totalPages - 1 || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {currentClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {currentClasses.map((classItem) => (
                      <div key={classItem._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 flex-1">{classItem.title}</h3>
                          <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                            {classItem.recording ? 'Recorded' : 'Upcoming'}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classItem.description}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end text-gray-500 text-sm gap-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{formatDate(classItem.startTime)}</span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm">
                              <span>{formatTime(classItem.startTime)}</span>
                              <span className="mx-2">to</span>
                              <span>{formatTime(classItem.endTime)}</span>
                            </div>
                          </div>
                          {!classItem.recording && (
                            <button 
                              onClick={() => handleJoinMeeting(classItem._id)}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
                    <p className="text-gray-500">No classes available</p>
                  </div>
                )}

                {/* Pagination Indicator */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${
                          activePage === index ? 'bg-gray-900 w-6' : 'bg-gray-300'
                        }`}
                        onClick={() => setActivePage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}