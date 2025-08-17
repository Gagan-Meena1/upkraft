"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, User, ExternalLink, ArrowUpRight, Play, Search, Mail, Bell } from "lucide-react";
import Image from "next/image";
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
  performanceScores?: {
    userId: string;
    score: number;
    dateRecorded: string;
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

export default function StudentProfileMain() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

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
        toast.error("Failed to load student data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to get exact performance score from API (no calculations)
  const getExactPerformanceScore = (course: CourseData) => {
    if (!course.performanceScores || course.performanceScores.length === 0) {
      return null;
    }
    
    // Find the performance score for this student
    const studentScore = course.performanceScores.find(
      score => score.userId === studentData?.studentId
    );
    
    return studentScore ? studentScore.score : null;
  };

  const CircularProgress = ({ score, label, color = "purple" }) => {
    // Use exact score for display and percentage calculation
    const displayScore = score !== null && score !== undefined ? score : 0;
    const percentage = score !== null && score !== undefined ? score : 0; // Use score directly as percentage
    
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#f3f4f6"
            strokeWidth="5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color === "purple" ? "#6E09BD" : "#4301EA"}
            strokeWidth="5"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-white shadow-sm">
            {studentData?.profileImage ? (
              <img
                src={studentData.profileImage}
                alt={studentData.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {score !== null && score !== undefined ? `${displayScore}` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1 opacity-50">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  const OverallPerformanceCircle = ({ score }) => {
    // Use exact score from API
    const displayScore = score !== null && score !== undefined ? score : 0;
    const percentage = score !== null && score !== undefined ? score : 0; // Use score directly as percentage
    const circumference = Math.PI * 35;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-36 h-20 flex items-end justify-center">
        <svg className="w-full h-full" viewBox="0 0 90 45">
          <path
            d="M 10 35 A 35 35 0 0 1 80 35"
            stroke="#FFF7E8"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M 10 35 A 35 35 0 0 1 80 35"
            stroke="#FFC357"
            strokeWidth="5"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {score !== null && score !== undefined ? `${displayScore}` : 'N/A'}
            </div>
            {score === null && (
              <div className="text-xs text-gray-400 mt-1">No data</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get the most recent course
  const getMostRecentCourse = () => {
    if (!studentData?.courses || studentData.courses.length === 0) return null;
    return studentData.courses[0]; // Assuming first course is the most recent
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const mostRecentCourse = getMostRecentCourse();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {studentData ? (
          <>
            {/* Student Info Cards Row */}
            <div className="flex gap-6">
              {/* Student Photo Card */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 w-64 shadow-sm">
                <div className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className="w-28 h-28 rounded-full border-4 border-gray-100 overflow-hidden mx-auto transform -rotate-6">
                      {studentData.profileImage ? (
                        <img
                          src={studentData.profileImage}
                          alt={studentData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <User size={40} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">{studentData.username}</h2>
                  <p className="text-lg font-medium text-gray-500">{studentData.city || 'Not specified'}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-8 flex-1 max-w-md shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Personal Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Email :</span>
                    <span className="text-gray-900 font-medium text-base">{studentData.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Contact :</span>
                    <span className="text-gray-900 font-medium text-base">{studentData.contact || '698.661.1830'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Age :</span>
                    <span className="text-gray-900 font-medium text-base">{studentData.age || '22'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">DOB :</span>
                    <span className="text-gray-900 font-medium text-base">1 January 2022</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Gender :</span>
                    <span className="text-gray-900 font-medium text-base">Female</span>
                  </div>
                </div>
              </div>

              {/* Fee Status */}
              <div className="bg-white rounded-2xl p-8 flex-1 max-w-md shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Fee Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Course :</span>
                    <span className="text-gray-900 font-medium text-base">
                      {mostRecentCourse?.title || 'Piano Classes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Fee per class:</span>
                    <span className="text-gray-900 font-medium text-base">
                      Rs. {mostRecentCourse?.price ? Math.round(mostRecentCourse.price / (mostRecentCourse.curriculum?.length || 12)).toLocaleString() : '8,000'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Total Course Fee:</span>
                    <span className="text-gray-900 font-medium text-base">
                      Rs. {mostRecentCourse?.price?.toLocaleString() || '40,000'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Last Paid :</span>
                    <span className="text-gray-900 font-medium text-base">24 July 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Outstanding :</span>
                    <span className="text-red-600 font-medium text-base">Yes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-base">Next Payment Date :</span>
                    <span className="text-gray-900 font-medium text-base">24 Aug 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Enrolled Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-8">Courses Enrolled</h3>
              <hr className="border-gray-200 mb-8" />
              
              {studentData.courses.length > 0 ? (
                <div className="space-y-8">
                  {studentData.courses.map((course, index) => {
                    const courseScore = getExactPerformanceScore(course);
                    return (
                      <div key={course._id}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-8">
                            <h4 className="text-xl font-semibold text-purple-600 mb-4">{course.title}</h4>
                            <p className="text-gray-900 mb-6 leading-relaxed">{course.description}</p>
                            
                            <div className="flex gap-8 mb-8">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Sessions :</span>
                                <span className="text-gray-900 font-medium">{course.curriculum.length}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Duration :</span>
                                <span className="text-gray-900 font-medium">{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Fee :</span>
                                <span className="text-gray-900 font-medium">Rs {course.price.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <Link 
                              href={`/tutor/courseDetailsForFeedback/${course._id}?studentId=${studentData.studentId}`}
                              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded gap-2 hover:bg-purple-700 transition-colors"
                            >
                              <span>View Performance</span>
                              <ArrowUpRight size={16} />
                            </Link>
                          </div>
                          
                          {/* Course Performance Circle with Exact API Score */}
                          <div className="flex-shrink-0 text-center">
                            <h5 className="text-base font-semibold text-gray-900 mb-4">Course Performance Score</h5>
                            <OverallPerformanceCircle score={courseScore} />
                          </div>
                        </div>
                        {index < studentData.courses.length - 1 && <hr className="border-gray-200 my-8" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-8">
                    <h4 className="text-xl font-semibold text-purple-600 mb-4">Piano Classes</h4>
                    <p className="text-gray-900 mb-6 leading-relaxed">Learn the basics of piano playing with fun, interactive lessons designed for beginners.</p>
                    
                    <div className="flex gap-8 mb-8">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Sessions :</span>
                        <span className="text-gray-900 font-medium">12</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Duration :</span>
                        <span className="text-gray-900 font-medium">2 Month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Fee :</span>
                        <span className="text-gray-900 font-medium">Rs 40,000</span>
                      </div>
                    </div>
                    
                    <button className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded gap-2 hover:bg-purple-700 transition-colors">
                      <span>View Performance</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  
                  {/* Course Performance Circle */}
                  <div className="flex-shrink-0 text-center">
                    <h5 className="text-base font-semibold text-gray-900 mb-4">Course Performance Score</h5>
                    <OverallPerformanceCircle score={null} />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Performance Metrics - Show Individual Course Scores */}
            <div className="grid grid-cols-3 gap-8">
              {studentData.courses.slice(0, 3).map((course, index) => {
                const courseScore = getExactPerformanceScore(course);
                return (
                  <div key={course._id} className="text-center">
                    <h4 className="text-base font-semibold text-gray-900 mb-6">{course.title}</h4>
                    <div className="mb-6">
                      <CircularProgress 
                        score={courseScore} 
                        label="Performance Score"
                      />
                    </div>
                    <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded flex items-center gap-2 hover:bg-purple-50 transition-colors mx-auto">
                      <span>View Details</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                );
              })}
              
              {/* If less than 3 courses, fill remaining slots */}
              {studentData.courses.length < 3 && (
                <>
                  {/* Assignments */}
                  <div className="text-center">
                    <h4 className="text-base font-semibold text-gray-900 mb-6">Assignments</h4>
                    <div className="mb-6">
                      <CircularProgress score={60} label="Completed" />
                    </div>
                    <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded flex items-center gap-2 hover:bg-purple-50 transition-colors mx-auto">
                      <span>View Details</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  {/* Latest Class Highlight */}
                  <div className="text-center">
                    <h4 className="text-base font-semibold text-gray-900 mb-6">Latest Class Highlight</h4>
                    <div className="relative rounded-2xl overflow-hidden mb-6 h-44">
                      <img
                        src="/api/placeholder/280/176"
                        alt="Latest class"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Play size={24} className="text-gray-800 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded flex items-center gap-2 hover:bg-purple-50 transition-colors mx-auto">
                      <span>View More</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No student data found.</p>
          </div>
        )}
      </div>
    </div>
  );
}