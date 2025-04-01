"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, ExternalLink, HomeIcon } from "lucide-react";
import Home from "@/app/page";

interface CourseData {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: string;
    topic: string;
    tangibleOutcome: string;
    _id: string;
  }[];
}

interface StudentData {
  message: string;
  studentId: string;
  username: string;
  email: string;
  courses: CourseData[];
}

export default function StudentDetails() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
         const userId = urlParams.get('studentId');
        const response = await fetch(`/Api/studentCourses?studentId=${userId}`);
        const data = await response.json();
        setStudentData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
            <img src="/logo.png" alt="" className="w-36 h-auto" />
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
              <p className="font-medium truncate">Tutor Name</p>
              <p className="text-sm text-gray-500 truncate">Tutor</p>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4">
          <Link href="/tutor/allStudents" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <Users size={20} />
            {sidebarOpen && <span className="ml-3">Students</span>}
          </Link>
          <Link href="/tutor/courses" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <BookOpen size={20} />
            {sidebarOpen && <span className="ml-3">My Courses</span>}
          </Link>
          <Link href="/tutor/create-course" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <PlusCircle size={20} />
            {sidebarOpen && <span className="ml-3">Create Course</span>}
          </Link>
          <Link href="/tutor/myStudents" className="flex items-center p-2 rounded-lg bg-gray-100 text-orange-600 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">My Students</span>}
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
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <Link href="/tutor" className="flex items-center p-2 rounded-lg bg-gray-100 text-orange-600 hover:bg-gray-200 transition-all">
            <ChevronLeft size={20} />
            {sidebarOpen && <span className="ml-3">Home</span>}
          </Link>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {studentData && (
            <>
              {/* Student Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
                      {studentData.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">{studentData.username}</h2>
                      <p className="text-gray-600">{studentData.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                 
                  </div>
                </div>
              </div>

              {/* Courses Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
                  <div className="text-sm text-gray-500">
                    Total Courses: {studentData.courses.length}
                  </div>
                </div>

                {studentData.courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentData.courses.map((course) => (
                      <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                            {course.duration}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <Calendar size={16} className="mr-2" />
                          <span>{course.curriculum.length} Sessions</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-gray-900 font-semibold">
                            ${course.price.toFixed(2)}
                          </div>
                          <Link 
                            href={`/tutor/courseDetailsForFeedback/${course._id}?studentId=${studentData.studentId}`} 
                            className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            <span>View Details</span>
                            <ExternalLink size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-gray-500">No courses available for this student</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}