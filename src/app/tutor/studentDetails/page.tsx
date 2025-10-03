"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { IndianRupee,ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, ExternalLink, HomeIcon, LogOut, BookCheck, Menu, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { BiBulb } from "react-icons/bi";
import { toast } from 'react-hot-toast';
import StudentProfileDetails from "@/app/components/StudentProfileDetails";

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
    <div className="student-profile-details-sec">
      <StudentProfileDetails data={studentData} />
    </div>
  );
}