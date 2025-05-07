"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import DashboardLayout from '@/app/components/DashboardLayout';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructorId: string;
  curriculum: any[];
  class: any[];
}

interface User {
  _id: string;
  username: string;
  age: number;
  address: string;
  contact: string;
  email: string;
  category: string;
  courses: string[]; // Array of course IDs
  instructorId: string[]; // Array of course IDs
  isVerified: boolean;
  isAdmin: boolean;
  classes: any[];
}

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        
        //    const responseAdmin = await fetch(`/Api/users/user?tutorId=${tutorId}`);
        //    const dashBoardData=await response.json();
        const urlParams = new URLSearchParams(window.location.search);
        const tutorIdFromUrl = urlParams.get('tutorId');
        setTutorId(tutorIdFromUrl);
        const response = await fetch(`/Api/admin/userInfo?userId=${tutorIdFromUrl}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        // Check the structure of the response and handle accordingly
        if (data.user && data.courseDetails) {
          setUser(data.user);
          setCourses(data.courseDetails);
        } else if (data.courseDetails) {
          // If only courses are present
          setCourses(data.courseDetails);
        } else if (data.user) {
          // If only user is present
          setUser(data.user);
        } else {
          // Fallback case - maybe the entire data object is the user
          setUser(data);
        }
        
        console.log("Fetched data:", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">No user data available</div>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-orange-400 text-white fixed h-full transition-all duration-300 ease-in-out z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between">
          <div className={`font-extrabold text-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>
            UPKRAFT
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <svg 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        
        <div className="mt-8">
          <ul className="space-y-2 px-4">
            <li>
              <Link href={`/admin/tutors/create-course?tutorId=${tutorId}`}>
                <div className="flex items-center p-3 text-white hover:bg-orange-600 rounded-lg transition cursor-pointer">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>Create Course</span>
                </div>
              </Link>
            </li>
            
           
            <li>
              <Link href={`/admin/tutors/myStudents?tutorId=${tutorId}`}>
                <div className="flex items-center p-3 text-white hover:bg-orange-600 rounded-lg transition cursor-pointer">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className={`ml-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>My Students</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className={`w-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-gray-50">
          {/* Header Section */}
          <div className="relative mb-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white p-8  shadow-md">
            <div className="absolute top-4 left-4">
              <Link href="/admin/tutors">
                <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium  hover:bg-gray-100 transition">
                  Back
                </button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="mt-3 max-w-md mx-auto">Your personal information and enrolled courses at a glance</p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white  shadow-md overflow-hidden mb-2 mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-orange-500 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-lg text-gray-800">{user.username || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg text-gray-800">{user.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="text-lg text-gray-800">{user.age || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-lg text-gray-800">{user.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">Category</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    {user.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mx-4 mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-orange-500 mb-4">Enrolled Courses</h2>
              
              <div className="space-y-6">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{course.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${course.price}</p>
                          <p className="text-xs text-gray-500">Duration: {course.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No courses enrolled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;