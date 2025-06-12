"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/components/DashboardLayout';

// Types
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

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
    <div className="text-2xl font-light text-gray-800">Loading dashboard...</div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
    <div className="text-2xl text-red-500">{message}</div>
  </div>
);

const WelcomeBanner = ({ username }: { username?: string }) => (
  <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl shadow-md p-6 mb-6">
    <h2 className="text-2xl font-bold">Welcome, {username || 'Student'}!</h2>
    <p className="mt-1 opacity-90">Ready to continue your learning journey today?</p>
  </div>
);

const ClassCard = ({ 
  classItem, 
  onJoinMeeting 
}: { 
  classItem: ClassData; 
  onJoinMeeting: (id: string) => void;
}) => (
  <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
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
        {!classItem.recording && (
          <button 
            onClick={() => onJoinMeeting(classItem._id)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Join
          </button>
        )}
      </div>
    </div>
  </div>
);

const ClassList = ({ 
  classData, 
  currentSlide, 
  onJoinMeeting 
}: { 
  classData: ClassData[]; 
  currentSlide: number;
  onJoinMeeting: (id: string) => void;
}) => (
  <div className="space-y-4">
    {classData
      .slice(currentSlide * 3, currentSlide * 3 + 3)
      .map((classItem) => (
        <ClassCard 
          key={classItem._id} 
          classItem={classItem} 
          onJoinMeeting={onJoinMeeting}
        />
      ))}
  </div>
);

const SliderNavigation = ({ 
  currentSlide, 
  totalSlides, 
  onPrevSlide, 
  onNextSlide 
}: { 
  currentSlide: number; 
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}) => (
  <div className="flex justify-between items-center mt-4">
    <button 
      onClick={onPrevSlide} 
      disabled={currentSlide === 0}
      className={`p-2 rounded-full ${
        currentSlide === 0 ? 'text-gray-300' : 'text-orange-500 hover:bg-orange-50'
      }`}
    >
      <ChevronLeft size={20} />
    </button>
    <div className="text-sm text-gray-500">
      Page {currentSlide + 1} of {totalSlides}
    </div>
    <button 
      onClick={onNextSlide} 
      disabled={currentSlide >= totalSlides - 1}
      className={`p-2 rounded-full ${
        currentSlide >= totalSlides - 1 ? 'text-gray-300' : 'text-orange-500 hover:bg-orange-50'
      }`}
    >
      <ChevronRight size={20} />
    </button>
  </div>
);

// Main Component
const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleJoinMeeting = async (classId: string) => {
    try {
      const response = await fetch('/Api/meeting/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classId, 
          userId: userData?._id, 
          userRole: userData?.category 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      router.push(`/tutor/video-call?url=${encodeURIComponent(data.url)}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join meeting. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, classResponse] = await Promise.all([
          axios.get("/Api/users/user"),
          axios.get("/Api/student/tutors")
        ]);

        if (userResponse.data?.user) {
          setUserData(userResponse.data.user);
        }

        if (classResponse.data?.classDetails) {
          setClassData(classResponse.data.classDetails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  const totalSlides = classData ? Math.ceil(classData.length / 3) : 0;

  return (
    <DashboardLayout 
      userData={userData || undefined} 
      userType="student"
      studentId={userData?._id}
    >
      <WelcomeBanner username={userData?.username} />

      <div className="bg-white w-full rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500">Upcoming Classes</h2>
        </div>

        <div className="space-y-4">
          {classData && classData.length > 0 ? (
            <>
              <ClassList 
                classData={classData} 
                currentSlide={currentSlide}
                onJoinMeeting={handleJoinMeeting}
              />
              
              {classData.length > 3 && (
                <SliderNavigation 
                  currentSlide={currentSlide}
                  totalSlides={totalSlides}
                  onPrevSlide={() => setCurrentSlide(curr => Math.max(0, curr - 1))}
                  onNextSlide={() => setCurrentSlide(curr => Math.min(totalSlides - 1, curr + 1))}
                />
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