"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
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

const ProgressBox = ({ completedClasses, totalClasses }: { completedClasses: number; totalClasses: number }) => {
  const progressPercentage = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-1/3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Class Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-sm text-gray-600">
                Completed: <span className="font-medium text-green-600">{completedClasses}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              <span className="text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">{totalClasses}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">
            {completedClasses}/{totalClasses}
          </div>
          <div className="text-sm text-gray-500">
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
    <div className="bg-white rounded-xl shadow-sm p-6 w-1/3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-sm text-gray-600">
                Completed: <span className="font-medium text-green-600">{completedAssignments}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <span className="text-sm text-gray-600">
                Pending: <span className="font-medium text-red-600">{incompleteAssignments}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">
            {completedAssignments}/{totalAssignments}
          </div>
          <div className="text-sm text-gray-500">
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

const ClassCard = ({ 
  classItem, 
  onJoinMeeting 
}: { 
  classItem: ClassData; 
  onJoinMeeting: (id: string) => void;
}) => (
  <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start">
      <div className="flex-1">
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
        <button 
          onClick={() => onJoinMeeting(classItem._id)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          Join
        </button>
      </div>
    </div>
  </div>
);

const AssignmentCard = ({ assignment }: { assignment: AssignmentData }) => {
  const isOverdue = new Date(assignment.deadline) < new Date();
  
  return (
    <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
            {isOverdue && (
              <AlertCircle size={16} className="text-red-500" title="Overdue" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
          {assignment.courseTitle && (
            <p className="text-sm text-blue-600 font-medium">Course: {assignment.courseTitle}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            <Calendar size={14} className="inline-block mr-1" />
            Due: {new Date(assignment.deadline).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700">
            {new Date(assignment.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isOverdue ? 'Overdue' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};

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

const AssignmentList = ({ 
  assignmentData, 
  currentSlide 
}: { 
  assignmentData: AssignmentData[]; 
  currentSlide: number;
}) => (
  <div className="space-y-4">
    {assignmentData
      .slice(currentSlide * 3, currentSlide * 3 + 3)
      .map((assignment) => (
        <AssignmentCard 
          key={assignment._id} 
          assignment={assignment} 
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
  const [assignmentData, setAssignmentData] = useState<AssignmentData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentClassSlide, setCurrentClassSlide] = useState(0);
  const [currentAssignmentSlide, setCurrentAssignmentSlide] = useState(0);

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
        const [userResponse, classResponse, assignmentResponse] = await Promise.all([
          axios.get("/Api/users/user"),
          axios.get("/Api/student/tutors"),
          axios.get("/Api/assignment")
        ]);

        if (userResponse.data?.user) {
          setUserData(userResponse.data.user);
        }

        if (classResponse.data?.classDetails) {
          setClassData(classResponse.data.classDetails);
          console.log("classData:", classResponse.data.classDetails);
          
        }

        if (assignmentResponse.data?.assignments) {
          setAssignmentData(assignmentResponse.data.assignments);
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

  // Filter upcoming classes (no recording)
  const upcomingClasses = classData?.filter(classItem => !classItem.recording) || [];
  
  // Filter incomplete assignments (assuming no status field means incomplete)
  const incompleteAssignments = assignmentData?.filter(assignment => !assignment.status) || [];
  
  // Calculate progress
  const totalClasses = classData?.length || 0;
  const completedClasses = classData?.filter(classItem => classItem.recording).length || 0;
  
  const totalAssignments = assignmentData?.length || 0;
  const incompleteAssignmentCount = incompleteAssignments.length;

  const totalClassSlides = Math.ceil(upcomingClasses.length / 3);
  const totalAssignmentSlides = Math.ceil(incompleteAssignments.length / 3);

  return (
    <DashboardLayout 
      userData={userData || undefined} 
      userType="student"
      studentId={userData?._id}
    >
      <WelcomeBanner username={userData?.username} />
      
      {/* Progress Boxes */}
      <div className="flex gap-6 mb-6">
        {totalClasses > 0 && (
          <ProgressBox 
            completedClasses={completedClasses} 
            totalClasses={totalClasses} 
          />
        )}
        
        {totalAssignments > 0 && (
          <AssignmentProgressBox 
            incompleteAssignments={incompleteAssignmentCount} 
            totalAssignments={totalAssignments} 
          />
        )}
      </div>

      {/* Upcoming Classes Section */}
      <div className="bg-white w-full rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500">Upcoming Classes</h2>
        </div>

        <div className="space-y-4">
          {upcomingClasses.length > 0 ? (
            <>
              <ClassList 
                classData={upcomingClasses} 
                currentSlide={currentClassSlide}
                onJoinMeeting={handleJoinMeeting}
              />
              
              {upcomingClasses.length > 3 && (
                <SliderNavigation 
                  currentSlide={currentClassSlide}
                  totalSlides={totalClassSlides}
                  onPrevSlide={() => setCurrentClassSlide(curr => Math.max(0, curr - 1))}
                  onNextSlide={() => setCurrentClassSlide(curr => Math.min(totalClassSlides - 1, curr + 1))}
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