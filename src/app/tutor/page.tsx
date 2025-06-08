"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, BookMarkedIcon, BookCheck } from "lucide-react";
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

interface ApiResponse {
  message: string;
  classData: ClassData[];
}

interface MeetingState {
  isActive: boolean;
  url: string | null;
  classId: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [meeting, setMeeting] = useState<MeetingState>({
    isActive: false,
    url: null,
    classId: null
  });

  const classesPerPage = 3;
  const totalPages = Math.ceil(classData.length / classesPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        
        // Fetch classes data
        const classesResponse = await fetch("/Api/classes");
        const classesData: ApiResponse = await classesResponse.json();
        
        // Sort classes by startTime
        const sortedClasses = classesData.classData.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        setUserData(userData);
        setClassData(sortedClasses);
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
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
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
        body: JSON.stringify({ classId }),
      });

      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      // Instead of setting meeting state, redirect to video call page
      router.push(`/tutor/video-call?url=${encodeURIComponent(data.url)}`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 h-screen ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col sticky top-0`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-l text-orange-600 ${!sidebarOpen && 'hidden'}`}>
          {/* <img src="logo.png" alt="" className="w-36 h-auto" /> */}
          <Link href="/" className="cursor-pointer w-36 h-auto">
          <Image 
            src="/logo.png" // Make sure your logo is in the public folder
            alt="UpKraft"
            width={36}
            height={36}
            priority
            className="object-contain w-36 h-auto" 
          />
        </Link>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <User size={20} />
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">{userData?.name}</p>
              <p className="text-sm text-gray-500 truncate">{userData?.category}</p>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4">
        <Link href="tutor/profile" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">Profile</span>}
          </Link>
          <Link href="tutor/courses" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <
              PiNutBold size={20} />
            {sidebarOpen && <span className="ml-3">Class Quality</span>}
          </Link>
          {/* <Link href="tutor/allStudents" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <Users size={20} />
            {sidebarOpen && <span className="ml-3">Students</span>}
          </Link> */}
          <Link href="tutor/courses" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <BookOpen size={20} />
            {sidebarOpen && <span className="ml-3">My Courses</span>}
          </Link>
          <Link href="tutor/create-course" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <PlusCircle size={20} />
            {sidebarOpen && <span className="ml-3">Create Course</span>}
          </Link>
          <Link href="tutor/myStudents" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">My Students</span>}
          </Link>
          <Link href="tutor/assignments" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <BookCheck size={20} />
            {sidebarOpen && <span className="ml-3">Assignments</span>}
          </Link>
        </nav>
        
        {/* Profile Link */}
        <div className="p-4 border-t border-gray-200">
          <Link href="#profile" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">Profile</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {meeting.isActive && meeting.url ? (
          <div className="p-6">
            <VideoMeeting url={meeting.url} onLeave={handleLeaveMeeting} />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </header>

            {/* Content Area */}
            <main className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Classes</h2>
                  <div className="flex gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentClasses.map((classItem) => (
                      <div key={classItem._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{classItem.title}</h3>
                          <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                            {classItem.recording ? 'Recorded' : 'Upcoming'}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classItem.description}</p>
                        <div className="flex justify-between items-start text-gray-500 text-sm">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2" />
                              <span>{formatDate(classItem.startTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <span>{formatTime(classItem.startTime)}</span>
                              <span className="mx-2">to</span>
                              <span>{formatTime(classItem.endTime)}</span>
                            </div>
                          </div>
                          {!classItem.recording && (
                            <button 
                              onClick={() => handleJoinMeeting(classItem._id)}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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