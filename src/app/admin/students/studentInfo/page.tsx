"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';


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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
       const studentId = urlParams.get('studentId'); //
    //    const responseAdmin = await fetch(`/Api/users/user?studentId=${studentId}`);
    //     const dashBoardData=await response.json();

       const response = await fetch(`/Api/admin/userInfo?userId=${studentId}`);
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
    <div className="w-full bg-gray-50 ">
    {/* Header Section */}
    <div className="text-center mb-2 bg-gradient-to-r from-purple-700 to-purple-800 text-white p-8 rounded-lg shadow-md">
  <h1 className="text-3xl font-bold ">User Profile</h1>
  <p className="mt-3  max-w-md mx-auto">Your personal information and enrolled courses at a glance</p>
  <div className="flex space-x-4">
          <Link href="/admin/students">
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Back
            </button>
          </Link>
          <Link href={`/admin/Talent?studentId=${user._id}`}>
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Talent
            </button>
          </Link>
        </div>
</div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-2">
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
     );
};

export default UserProfilePage;