"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import DashboardLayout from '@/app/components/DashboardLayout';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast'; 


interface UserData {
  _id?: string;
  username?: string;
  email?: string;
  category?: string;
  age?: number;
  address?: string;
  contact?: string;
  courses?: string[];
  isVerified?: boolean;
  isAdmin?: boolean;
  classes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface ClassData {
  _id: string;
  title: string;
  description: string;
  course: string;
  instructor: number;
  startTime: string;
  endTime: string;
  recording?: string;
  feedbackId: string;
  createdAt: string;
  updatedAt: string;
}

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // const handleViewAllClasses = () => {
  //   router.push('/student/classes');
  // };
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

      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      // Redirect to video call page - adjust the path as needed for student
      router.push(`/tutor/video-call?url=${encodeURIComponent(data.url)}`);
    } catch (error: any) {
      console.error('[Meeting] Error details:', error);
      toast.error(error.message || 'Failed to join meeting. Please try again.');
    }
  };
  // Fetch user data and class data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/users/user");
        
        if (response.data && response.data.user) {
          setUserData(response.data.user);
          
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/student/tutors");
        
        if (response.data && response.data.classDetails) {
          setClassData(response.data.classDetails);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching class data:", err);
        setError("Failed to fetch class data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, []);
  const nextSlide = () => {
    if (classData && currentSlide < Math.ceil(classData.length / 3) - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-2xl font-light text-gray-800">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
<DashboardLayout 
  userData={userData || undefined} 
  userType="student"
  studentId={userData?._id} // Pass the user ID here
>      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold">Welcome, {userData?.username || 'Student'}!</h2>
        <p className="mt-1 opacity-90">Ready to continue your learning journey today?</p>
      </div>

      {/* Upcoming Classes Card */}
      <div className="bg-white w-full rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500">Upcoming Classes</h2>
          {/* <button 
            onClick={handleViewAllClasses}
            className="flex items-center text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </button> */}
        </div>

        {/* Classes List */}
        {/* Classes List with Slider */}
<div className="space-y-4">
  {classData && classData.length > 0 ? (
    <>
      <div className="space-y-4">
        {classData
          .slice(currentSlide * 3, currentSlide * 3 + 3)
          .map((classItem) => (
          <div key={classItem._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
  <div className="flex justify-between items-start">
    <div>
      <h3 className="text-lg font-medium text-gray-900">{classItem.title}</h3>
      <p className="mt-1 text-sm text-gray-600">{classItem.description}</p>
    </div>
    <div className="text-right flex flex-col items-end gap-2">
      <div>
        <p className="text-sm font-medium text-gray-900">
          <Calendar size={14} className="inline-block mr-1" />
          {new Date(classItem.startTime).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-700">
          {new Date(classItem.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
          {new Date(classItem.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
      {/* Join Button */}
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
</div>
          ))}
      </div>
      
      {/* Slider Navigation */}
      {classData.length > 3 && (
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className={`p-2 rounded-full ${currentSlide === 0 ? 'text-gray-300' : 'text-orange-500 hover:bg-orange-50'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm text-gray-500">
            Page {currentSlide + 1} of {Math.ceil(classData.length / 3)}
          </div>
          <button 
            onClick={nextSlide} 
            disabled={currentSlide >= Math.ceil(classData.length / 3) - 1}
            className={`p-2 rounded-full ${currentSlide >= Math.ceil(classData.length / 3) - 1 ? 'text-gray-300' : 'text-orange-500 hover:bg-orange-50'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  ) : (
    <p className="text-gray-500">No upcoming classes available</p>
  )}
</div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;