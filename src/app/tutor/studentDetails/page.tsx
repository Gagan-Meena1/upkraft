"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { IndianRupee,ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, ExternalLink, HomeIcon, LogOut, BookCheck, Menu, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { BiBulb } from "react-icons/bi";
import { toast } from 'react-hot-toast';

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
  contact?: string;
  age?: number;
  profileImage?: string;
  courses: CourseData[];
}

export default function StudentDetails() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);

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

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to handle course removal
  const handleRemoveCourse = async (courseId: string) => {
    if (!studentData) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to remove this course from ${studentData.username}?`);
    if (!confirmed) return;

    setRemovingCourseId(courseId);

    try {
      const response = await fetch('/Api/removeStudentToCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          studentId: studentData.studentId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Course removed successfully!');
        
        // Update the local state to remove the course from the list
        setStudentData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            courses: prevData.courses.filter(course => course._id !== courseId)
          };
        });
      } else {
        toast.error(result.error || 'Failed to remove course');
      }
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error('Error occurred while removing course');
    } finally {
      setRemovingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const NavigationLinks = ({ mobile = false }) => (
    <>
      <Link 
        href="/tutor/profile" 
        className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <User size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">Profile</span>}
      </Link>
      <Link 
        href="/tutor/courses" 
        className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <BookOpen size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">My Courses</span>}
      </Link>
      <Link 
        href="/tutor/create-course" 
        className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <PlusCircle size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">Create Course</span>}
      </Link>
      <Link 
        href="/tutor/myStudents" 
        className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <User size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">My Students</span>}
      </Link>
      <Link 
        href="/tutor/assignments" 
        className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <BookCheck size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">Assignments</span>}
      </Link>
      <button 
        onClick={async () => {
          try {
            const response = await fetch('/Api/users/logout');
            if (response.ok) {
              toast.success('Logged out successfully');
              // router.push('/login'); // Uncomment if you have router
            } else {
              toast.error('Failed to logout');
            }
          } catch (error) {
            toast.error('Error during logout');
            console.error('Logout error:', error);
          }
          if (mobile) setMobileMenuOpen(false);
        }}
        className={`flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all ${mobile ? 'justify-start' : ''}`}
      >
        <LogOut size={20} />
        {(sidebarOpen || mobile) && <span className="ml-3">Logout</span>}
      </button>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex bg-white border-r border-gray-200 h-screen ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex-col sticky top-0`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-l text-orange-600 ${!sidebarOpen && 'hidden'}`}>
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
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="flex-1 px-2 py-4">
          <NavigationLinks />
        </nav>
        
      
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <Link href="/tutor" className="cursor-pointer">
                <Image 
                  src="/logo.png"
                  alt="UpKraft"
                  width={288}
                  height={72}
                  priority
                  className="object-contain w-32 h-auto" 
                />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 px-2 py-4">
              <NavigationLinks mobile={true} />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-screen w-full md:w-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:p-6 sticky top-0 z-10 flex justify-between items-center">
  <div className="flex items-center">
    {/* Back Button */}
    <Link
      href="/tutor"
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 mr-3 transition-colors shadow-sm"
    >
      <ChevronLeft className="text-gray-700" size={20} />
    </Link>
    
    {/* Mobile Menu Button */}
    <button 
      onClick={() => setMobileMenuOpen(true)}
      className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-3"
    >
      <Menu size={20} />
    </button>
    
    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Student Details</h1>
  </div>
</header>

        {/* Content Area */}
        <main className="p-4 md:p-6">
          {studentData && (
            <>
              {/* Student Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex items-start flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center w-full sm:w-auto">
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center flex-shrink-0">
                      {studentData.profileImage ? (
                        <Image
                          src={studentData.profileImage}
                          alt={studentData.username}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                          <User size={window.innerWidth < 768 ? 16 : 24} />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 md:ml-4 flex-1 min-w-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{studentData.username}</h2>
                      <p className="text-gray-600 text-sm md:text-base truncate">{studentData.email}</p>
                      {studentData.contact && (
                        <p className="text-gray-500 text-xs md:text-sm">Contact: {studentData.contact}</p>
                      )}
                      {studentData.age && (
                        <p className="text-gray-500 text-xs md:text-sm">Age: {studentData.age}</p>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:mt-0">
                    <Link 
                      href={`/tutor/talent?studentId=${studentData.studentId}`}
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm md:text-base"
                    >
                      <BiBulb size={16} className="mr-2" />
                      Talent
                    </Link>
                  </div>
                </div>
              </div>

              {/* Courses Section */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 space-y-2 sm:space-y-0">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Enrolled Courses</h2>
                  <div className="text-sm text-gray-500">
                    Total Courses: {studentData.courses.length}
                  </div>
                </div>

                {studentData.courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {studentData.courses.map((course) => (
                      <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 flex-1 min-w-0 pr-2">
                            <span className="line-clamp-2">{course.title}</span>
                          </h3>
                          <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                            {course.duration}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 md:mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center text-gray-500 text-sm mb-3 md:mb-4">
                          <Calendar size={14} className="mr-2 flex-shrink-0" />
                          <span>{course.curriculum.length} Sessions</span>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="text-gray-900 font-semibold text-sm md:text-base">
                            <span className="text-yellow-600 font-bold text-lg">₹</span>
                            {course.price.toFixed(2)}
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Link 
                              href={`/tutor/courseDetailsForFeedback/${course._id}?studentId=${studentData.studentId}`} 
                              className="flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex-1"
                            >
                              <span>View Details</span>
                              <ExternalLink size={14} className="ml-1" />
                            </Link>
                            
                            <button 
                              onClick={() => handleRemoveCourse(course._id)}
                              disabled={removingCourseId === course._id}
                              className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 ${
                                removingCourseId === course._id 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-red-600 hover:bg-red-700'
                              } text-white`}
                            >
                              {removingCourseId === course._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                              ) : (
                                <Trash2 size={14} className="mr-1" />
                              )}
                              <span>{removingCourseId === course._id ? 'Removing...' : 'Remove Course'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
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