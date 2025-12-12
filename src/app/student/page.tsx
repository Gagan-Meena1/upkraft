"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useUserData } from "@/app/providers/UserData/page"; // ✅ Also works

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import ProfileProgress from "../components/tutor/ProfileProgress";
import ProfileAttended from "../components/ProfileAttended";
import ReferAndEarn from "../components/ReferAndEarn";
import UpcomingLessons from "./UpcomingLessons";
import SemiCircleProgress from "../components/tutor/SemiCircleProgress";
// import FeedbackPendingDetails from '../tutor/feedback-pending/page';
import VideoPoster from "@/assets/video-poster.png";
import Image from "next/image";
import "./Dashboard.css";
import AssignmentPending from "../components/tutor/AssignmentPending";
import { Button } from "react-bootstrap";
import Link from "next/link";
import StudentProfileDetails from "../components/StudentProfileDetails";

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
  city?: string;
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
interface StudentData {
  message: string;
  studentId: string;
  username: string;
  email: string;
  contact?: string;
  age?: number;
  profileImage?: string;
  courses: CourseData[];
  city: string;
}
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
// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-gray-50 to-white">
    <div className="text-xl md:text-2xl font-light text-gray-800 px-4 text-center">
      Loading dashboard...
    </div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-gray-50 to-white">
    <div className="text-lg md:text-2xl text-red-500 px-4 text-center">
      {message}
    </div>
  </div>
);

const WelcomeBanner = ({ username }: { username?: string }) => (
  <div className="bg-gradient-to-r from-purple-500 to-purple-400 text-white rounded-xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
    <h2 className="text-xl md:text-2xl font-bold">
      Welcome, {username || "Student"}!
    </h2>
    <p className="mt-1 opacity-90 text-sm md:text-base">
      Ready to continue your learning journey today?
    </p>
  </div>
);

const ProgressBox = ({
  completedClasses,
  totalClasses,
}: {
  completedClasses: number;
  totalClasses: number;
}) => {
  const progressPercentage =
    totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Class Progress
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-gray-600">
                Completed:{" "}
                <span className="font-medium text-green-600">
                  {completedClasses}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-500 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-gray-600">
                Total:{" "}
                <span className="font-medium text-gray-900">
                  {totalClasses}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xl md:text-2xl font-bold text-orange-500">
            {completedClasses}/{totalClasses}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
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

const AssignmentProgressBox = ({
  incompleteAssignments,
  totalAssignments,
}: {
  incompleteAssignments: number;
  totalAssignments: number;
}) => {
  const completedAssignments = totalAssignments - incompleteAssignments;
  const progressPercentage =
    totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Assignment Progress
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-gray-600">
                Completed:{" "}
                <span className="font-medium text-green-600">
                  {completedAssignments}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm text-gray-600">
                Pending:{" "}
                <span className="font-medium text-red-600">
                  {incompleteAssignments}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xl md:text-2xl font-bold text-orange-500">
            {completedAssignments}/{totalAssignments}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
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

const filterFutureClasses = (classes: ClassData[]) => {
  const now = new Date();
  return classes.filter((classItem) => {
    const classStartTime = new Date(classItem.startTime);
    return classStartTime > now;
  });
};

const ClassCard = ({
  classItem,
onJoinMeeting
}: {
  classItem: ClassData;
  onJoinMeeting: (id: string) => void;
}) => (
  <div className="p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-base md:text-lg font-medium text-gray-900 break-words">
          {classItem.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 break-words">
          {classItem.description}
        </p>
      </div>
      <div className="flex flex-col sm:items-end gap-2 shrink-0">
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-gray-900">
            <Calendar
              size={12}
              className="inline-block mr-1 md:w-3.5 md:h-3.5"
            />
            {new Date(classItem.startTime).toLocaleDateString()}
          </p>
          <p className="text-xs md:text-sm text-gray-700">
            {new Date(classItem.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
          
            {new Date(classItem.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          onClick={() => onJoinMeeting(classItem._id)}
          className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors w-full sm:w-auto"
        >
          Join Class
        </button>
      </div>
    </div>
  </div>
);

const AssignmentCard = ({ assignment }: { assignment: AssignmentData }) => {
  const isOverdue = new Date(assignment.deadline) < new Date();

  return (
    <div className="p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-base md:text-lg font-medium text-gray-900 break-words flex-1">
              {assignment.title}
            </h3>
            {isOverdue && (
              <AlertCircle
                size={16}
                className="text-red-500 shrink-0 mt-0.5"
                title="Overdue"
              />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 break-words">
            {assignment.description}
          </p>
          {assignment.courseTitle && (
            <p className="text-sm text-blue-600 font-medium break-words">
              Course: {assignment.courseTitle}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right shrink-0">
          <p className="text-sm font-medium text-gray-900">
            <Calendar
              size={12}
              className="inline-block mr-1 md:w-3.5 md:h-3.5"
            />
            Due: {new Date(assignment.deadline).toLocaleDateString()}
          </p>
          <p className="text-xs md:text-sm text-gray-700">
            {new Date(assignment.deadline).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <span
            className={`inline-block mt-2 px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
              isOverdue
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isOverdue ? "Overdue" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};

const ClassList = ({
  classData,
  currentSlide,
  onJoinMeeting,
  itemsPerPage,
}: {
  classData: ClassData[];
  currentSlide: number;
  onJoinMeeting: (id: string) => void;
  itemsPerPage: number;
}) => (
  <div className="space-y-3 md:space-y-4">
    {classData
      .slice(
        currentSlide * itemsPerPage,
        currentSlide * itemsPerPage + itemsPerPage
      )
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
  currentSlide,
  itemsPerPage,
}: {
  assignmentData: AssignmentData[];
  currentSlide: number;
  itemsPerPage: number;
}) => (
  <div className="space-y-3 md:space-y-4">
    {assignmentData
      .slice(
        currentSlide * itemsPerPage,
        currentSlide * itemsPerPage + itemsPerPage
      )
      .map((assignment) => (
        <AssignmentCard key={assignment._id} assignment={assignment} />
      ))}
  </div>
);

const SliderNavigation = ({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
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
      className={`p-2 rounded-full transition-colors ${
        currentSlide === 0
          ? "text-gray-300 cursor-not-allowed"
          : "text-orange-500 hover:bg-orange-50"
      }`}
    >
      <ChevronLeft size={20} />
    </button>
    <div className="text-xs md:text-sm text-gray-500">
      Page {currentSlide + 1} of {totalSlides}
    </div>
    <button
      onClick={onNextSlide}
      disabled={currentSlide >= totalSlides - 1}
      className={`p-2 rounded-full transition-colors ${
        currentSlide >= totalSlides - 1
          ? "text-gray-300 cursor-not-allowed"
          : "text-orange-500 hover:bg-orange-50"
      }`}
    >
      <ChevronRight size={20} />
    </button>
  </div>
);

// Fixed Hook for responsive items per page - prevents hydration mismatch
const useResponsiveItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(3); // Default for server
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        // sm breakpoint
        setItemsPerPage(2);
      } else if (window.innerWidth < 768) {
        // md breakpoint
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Return default value during server render and first client render
  return isMounted ? itemsPerPage : 3;
};

// Main Component
const StudentDashboard: React.FC = () => {
  const router = useRouter();
  // const [loading, setLoading] = useState<boolean>(true);
  // const [userData, setUserData] = useState<UserData | null>(null);
  // const [classData, setClassData] = useState<ClassData[] | null>(null);
  const { 
    userData, 
    classDetails: classData, 
    loading, 
    error 
  } = useUserData();
  

  const [assignmentData, setAssignmentData] = useState<AssignmentData[] | null>( null);
  // const [error, setError] = useState<string | null>(null);
  const [currentClassSlide, setCurrentClassSlide] = useState(0);
  const [currentAssignmentSlide, setCurrentAssignmentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studentPerformance, setStudentPerformance] = useState<number>(0);
  const [classQualityScore, setClassQualityScore] = useState<number | null>(
    null
  );

  const itemsPerPage = useResponsiveItemsPerPage();

  

  const handleJoinMeeting = async (classId: string) => {
    try {
      const response = await fetch("/Api/meeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          userId: userData?._id,
          userRole: userData?.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meeting");
      }

      router.push(
        `/student/video-call?url=${encodeURIComponent(data.url)}&userRole=${
          userData?.category || "Student"
        }&token=${encodeURIComponent(data.token)}`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to join meeting. Please try again.");
    }
  };

useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [assignmentResponse, perResponse] = await Promise.all([
          fetch("/Api/assignment"),
          fetch("/Api/studentOverallPerformance")
        ]);

        const assignmentData = await assignmentResponse.json();
        const assignments = assignmentData?.data?.assignments || [];
        setAssignmentData(assignments);

        const perData = await perResponse.json();
        const perScore = perData?.averageScore;
        if (perScore) {
          setStudentPerformance(perScore);
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };

    if (!loading && userData) {
      fetchAdditionalData();
    }
  }, [loading, userData]);
  
  // Reset slides when items per page changes
  useEffect(() => {
    setCurrentClassSlide(0);
    setCurrentAssignmentSlide(0);
  }, [itemsPerPage]);

  // Get class quality score for the first course (or loop for all)
  useEffect(() => {
    async function fetchClassQuality() {
      if (!userData?.courses || userData.courses.length === 0) return;
      // Pick the first course or loop for all
      const courseId = userData.courses[0];
      const res = await fetch(`/Api/courseQuality?courseId=${courseId}`);
      const json = await res.json();
      if (json?.overall_quality_score !== undefined) {
        setClassQualityScore(json.overall_quality_score);
      }
    }
    fetchClassQuality();
  }, [userData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  // Filter upcoming classes (no recording)
  const upcomingClasses = classData ? filterFutureClasses(classData) : [];

  // Filter incomplete assignments based on the correct status field
  const incompleteAssignments =
    assignmentData?.filter(
      (assignment) => assignment.currentAssignmentStatus === "PENDING"
    ) || [];

  // Calculate progress
  const totalClasses = classData?.length || 0;
  const completedClasses =
    classData?.filter((classItem) => classItem.recording).length || 0;

  const totalAssignments = assignmentData?.length || 0;
  const incompleteAssignmentCount = incompleteAssignments.length;

  const totalClassSlides = Math.ceil(upcomingClasses.length / itemsPerPage);
  const totalAssignmentSlides = Math.ceil(
    incompleteAssignments.length / itemsPerPage
  );

  // --- ADDED: compute a tutorId to link session summary ---
  const firstTutorId =
    (classData && classData.length > 0 && classData[0].instructor) ||
    (userData?.courses && userData.courses.length > 0
      ? // if courses include instructorId, adapt here
        // @ts-ignore
        userData.courses[0].instructorId || ""
      : "");
  const sessionSummaryUrl = `/student/session-summary?studentId=${
    userData?._id || ""
  }&tutorId=${firstTutorId || ""}`;

  return (
    <div className="container">
      <div className="row !w-full">
        <div className="col col-xxl-4 mb-4 order-md-1">
          <div className="card-box profile-card">
            <h2 className="mb-4 !text-[24px]">Profile</h2>
            <div className="com-profile d-flex align-items-center gap-4">
              <div className="col-img-profile">
                <ProfileProgress user={userData as UserData} />
              </div>
              <div className="col-text-profile">
                <ul className="p-0 m-0 list-unstyled">
                  <li className="btn-white d-flex align-items-center gap-2 w-100">
                    <span className="icons">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.97648 4.9C8.58925 4.56224 8.11196 4.34468 7.60301 4.27394C7.09407 4.2032 6.57554 4.28236 6.11087 4.50171C5.64621 4.72107 5.25556 5.07112 4.98673 5.50903C4.7179 5.94693 4.58255 6.45371 4.59724 6.96734C4.61193 7.48097 4.77603 7.97918 5.06944 8.401C5.36286 8.82283 5.77288 9.14998 6.24932 9.34242C6.72576 9.53486 7.24797 9.58425 7.75204 9.48454C8.25611 9.38483 8.72019 9.14034 9.08748 8.781C9.42707 9.30846 9.89356 9.7423 10.4442 10.0428C10.9949 10.3433 11.6122 10.5008 12.2395 10.501C12.8666 10.501 13.4838 10.3438 14.0344 10.0437C14.5851 9.74353 15.0517 9.31009 15.3915 8.783C15.7588 9.14234 16.2229 9.38683 16.7269 9.48654C17.231 9.58625 17.7532 9.53686 18.2296 9.34442C18.7061 9.15198 19.1161 8.82483 19.4095 8.403C19.7029 7.98118 19.867 7.48297 19.8817 6.96934C19.8964 6.45571 19.7611 5.94893 19.4922 5.51103C19.2234 5.07312 18.8328 4.72307 18.3681 4.50371C17.9034 4.28436 17.3849 4.2052 16.876 4.27594C16.367 4.34668 15.8897 4.56424 15.5025 4.902C15.1755 4.32463 14.7012 3.84437 14.1279 3.51022C13.5547 3.17607 12.903 3.00001 12.2395 3C11.5762 2.99981 10.9246 3.17557 10.3514 3.50935C9.77817 3.84314 9.30373 4.32301 8.97648 4.9ZM9.98948 6.75C9.98948 6.15326 10.2265 5.58097 10.6485 5.15901C11.0705 4.73705 11.6427 4.5 12.2395 4.5C12.8362 4.5 13.4085 4.73705 13.8305 5.15901C14.2524 5.58097 14.4895 6.15326 14.4895 6.75C14.4895 7.34674 14.2524 7.91903 13.8305 8.34099C13.4085 8.76295 12.8362 9 12.2395 9C11.6427 9 11.0705 8.76295 10.6485 8.34099C10.2265 7.91903 9.98948 7.34674 9.98948 6.75ZM8.57748 5.94C8.44395 6.54465 8.46181 7.17292 8.62948 7.769C8.43999 8.0711 8.1573 8.3033 7.82414 8.4305C7.49098 8.55769 7.12547 8.57297 6.78286 8.47401C6.44025 8.37506 6.13916 8.16725 5.92512 7.88202C5.71109 7.59678 5.59573 7.24961 5.59648 6.893C5.59668 6.54497 5.70738 6.206 5.91264 5.92494C6.11789 5.64388 6.40709 5.43526 6.73855 5.32915C7.07 5.22304 7.42659 5.22492 7.75691 5.33453C8.08723 5.44413 8.37421 5.65579 8.57648 5.939M15.8485 7.768C16.0167 7.17166 16.0346 6.54293 15.9005 5.938C16.1049 5.6512 16.3962 5.4377 16.7312 5.32898C17.0662 5.22026 17.4273 5.22208 17.7612 5.33417C18.0951 5.44626 18.3841 5.66269 18.5857 5.95153C18.7873 6.24038 18.8907 6.58635 18.8807 6.93842C18.8707 7.2905 18.7478 7.63004 18.5301 7.90697C18.3125 8.1839 18.0116 8.38356 17.6719 8.47651C17.3322 8.56946 16.9716 8.55077 16.6433 8.42321C16.3149 8.29564 16.0363 8.06594 15.8485 7.768ZM5.19048 10.047C5.53748 9.955 5.86548 10.069 6.09148 10.233C6.18148 10.298 6.30548 10.378 6.45648 10.451C6.57208 10.5109 6.65976 10.6135 6.70087 10.7371C6.74198 10.8606 6.73328 10.9953 6.67663 11.1125C6.61997 11.2298 6.51982 11.3203 6.39747 11.3648C6.27513 11.4093 6.14024 11.4044 6.02148 11.351C5.84039 11.2638 5.66737 11.1607 5.50448 11.043C5.48826 11.0314 5.4704 11.0223 5.45148 11.016L5.44448 11.015C5.30965 11.051 5.17592 11.091 5.04348 11.135L4.35748 11.359C4.10166 11.4423 3.87044 11.5876 3.68444 11.782C3.49843 11.9764 3.36343 12.2138 3.29148 12.473L3.00848 14.522C2.95248 14.925 3.16548 15.227 3.46848 15.299C3.69182 15.3537 3.96282 15.407 4.28148 15.459C4.34636 15.4695 4.40852 15.4927 4.46444 15.5272C4.52035 15.5617 4.56892 15.607 4.60736 15.6603C4.64581 15.7136 4.67337 15.7739 4.68849 15.8379C4.70361 15.9018 4.70599 15.9681 4.69548 16.033C4.68498 16.0979 4.6618 16.16 4.62726 16.216C4.59273 16.2719 4.54753 16.3204 4.49423 16.3589C4.44092 16.3973 4.38057 16.4249 4.31662 16.44C4.25266 16.4551 4.18636 16.4575 4.12148 16.447C3.82473 16.3998 3.52985 16.3414 3.23748 16.272C2.34248 16.059 1.90448 15.202 2.01748 14.385L2.30948 12.279L2.31548 12.252C2.425 11.8238 2.64104 11.4303 2.94352 11.1081C3.246 10.7858 3.62508 10.5453 4.04548 10.409L4.73048 10.184C4.88382 10.134 5.03715 10.0883 5.19048 10.047ZM19.4195 10.047C19.2651 10.0092 19.1042 10.0063 18.9485 10.0385C18.7928 10.0706 18.6463 10.1371 18.5195 10.233C18.4295 10.298 18.3055 10.378 18.1545 10.451C18.0389 10.5109 17.9512 10.6135 17.9101 10.7371C17.869 10.8606 17.8777 10.9953 17.9343 11.1125C17.991 11.2298 18.0911 11.3203 18.2135 11.3648C18.3358 11.4093 18.4707 11.4044 18.5895 11.351C18.7706 11.2638 18.9436 11.1607 19.1065 11.043C19.1227 11.0314 19.1406 11.0223 19.1595 11.016L19.1665 11.015C19.3018 11.0503 19.4355 11.0903 19.5675 11.135L20.2535 11.359C20.7795 11.532 21.1785 11.953 21.3195 12.473L21.6025 14.522C21.6585 14.925 21.4465 15.227 21.1425 15.299C20.8736 15.3625 20.6024 15.4159 20.3295 15.459C20.2646 15.4695 20.2024 15.4927 20.1465 15.5272C20.0906 15.5617 20.042 15.607 20.0036 15.6603C19.9652 15.7136 19.9376 15.7739 19.9225 15.8379C19.9074 15.9018 19.905 15.9681 19.9155 16.033C19.926 16.0979 19.9492 16.16 19.9837 16.216C20.0182 16.2719 20.0634 16.3204 20.1167 16.3589C20.17 16.3973 20.2304 16.4249 20.2943 16.44C20.3583 16.4551 20.4246 16.4575 20.4895 16.447C20.8308 16.3903 21.1255 16.332 21.3735 16.272C22.2685 16.059 22.7065 15.202 22.5935 14.385L22.3015 12.279L22.2955 12.252C22.186 11.8238 21.9699 11.4303 21.6674 11.1081C21.365 10.7858 20.9859 10.5453 20.5655 10.409L19.8805 10.184C19.7284 10.1343 19.574 10.0886 19.4195 10.047Z"
                          fill="#7009BA"
                        />
                        <path
                        />
                      </svg>
                    </span>
                    <span className="text-dark-blue text-box">Classes</span>
                    <span className="text-black text-box">{totalClasses}</span>
                  </li>
                  <li className="btn-white d-flex align-items-center gap-2 w-100">
                    <span className="icons">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.4082 22.5H3.4082C3.01038 22.5 2.62885 22.342 2.34754 22.0607C2.06624 21.7794 1.9082 21.3978 1.9082 21V3C1.9082 2.60218 2.06624 2.22064 2.34754 1.93934C2.62885 1.65804 3.01038 1.5 3.4082 1.5H15.4082C15.806 1.5 16.1876 1.65804 16.4689 1.93934C16.7502 2.22064 16.9082 2.60218 16.9082 3V15.4635L13.1582 13.5885L9.4082 15.4635V3H3.4082V21H15.4082V18H16.9082V21C16.9076 21.3976 16.7494 21.7788 16.4682 22.06C16.187 22.3412 15.8058 22.4994 15.4082 22.5ZM13.1582 11.9115L15.4082 13.0365V3H10.9082V13.0365L13.1582 11.9115Z"
                          fill="#7009BA"
                        />
                      </svg>
                    </span>
                    <span className="text-dark-blue text-box">Course</span>
                    <span className="text-black text-box">
                      {userData?.courses?.length || 0}
                    </span>
                  </li>
                  <li className="btn-white d-flex align-items-center gap-2 w-100">
                    <span className="icons">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.0001 12V18M12.0001 12C15.8661 12 19.0001 8.883 19.0001 5.038C19.0001 4.938 18.9981 4.838 18.9941 4.738C18.9511 3.738 18.9301 3.238 18.2521 2.619C17.5741 2 16.8251 2 15.3241 2H8.67606C7.17606 2 6.42506 2 5.74806 2.62C5.07106 3.238 5.04906 3.738 5.00606 4.737C5.00206 4.837 5.00006 4.93733 5.00006 5.038C5.00006 8.883 8.13406 12 12.0001 12ZM12.0001 18C10.3261 18 8.87006 19.012 8.11806 20.505C7.75806 21.218 8.27406 22 8.95806 22H15.0411C15.7261 22 16.2411 21.218 15.8821 20.505C15.1301 19.012 13.6741 18 12.0001 18ZM5.00006 5H3.98506C2.99806 5 2.50506 5 2.20006 5.37C1.89506 5.741 1.98506 6.156 2.16406 6.986C2.50406 8.57 3.24506 9.963 4.24906 11M19.0001 5H20.0151C21.0021 5 21.4951 5 21.8001 5.37C22.1051 5.741 22.0151 6.156 21.8371 6.986C21.4951 8.57 20.7551 9.963 19.7501 11"
                          stroke="#7009BA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-dark-blue text-box">City</span>
                    <span className="text-black text-box">
                      {userData?.city || ""}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-4 col-md-6 mb-4 order-xxl-2 order-md-3">
          <div className="profile-attended-box card-box">
            <ProfileAttended
              classesAttended={completedClasses}
              lessonsCompleted={totalAssignments - incompleteAssignmentCount}
            />
          </div>
        </div>

        {/* <div className="col-xxl-3 col-md-6 mb-4 order-xxl-3 order-md-4">
          <div className="card-box card-inner-video-box">
            <div className="card-enrolled-video text-center pt-0">
              <Link href="/student/classSnapshots" className="d-block mb-3">
              <h6 className="mb-4">Latest Class Highlight</h6>
              </Link>
              <div className="video-box">
                <div className="poster-video position-relative text-center">
                  {!isPlaying ? (
                    <div className="poster-wrapper position-relative">
                      <img
                        src={VideoPoster.src}
                        alt="Video Poster"
                        className="img-fluid rounded shadow"
                      />
                      <Button
                        variant="light"
                        className="play-btn position-absolute top-50 start-50 translate-middle rounded-circle p-3 shadow"
                        onClick={() => setIsPlaying(true)}
                      >
                        {" "}
                        ▶{" "}
                      </Button>
                    </div>
                  ) : (
                    <video
                      className="w-100 rounded shadow"
                      controls
                      autoPlay
                      poster={VideoPoster.src}
                    >
                      <source
                        src="https://www.w3schools.com/html/mov_bbb.mp4"
                       
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="col-xxl-4 col-md-6 mb-4 order-xxl-4  order-md-2">
          <div className="refer-and-earn-sec">
            <ReferAndEarn />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xxl-6 col-md-12 mb-4">
          <UpcomingLessons />
        </div>
        <div className="col-xxl-3 col-md-6 mb-4">
          <div className="card-box">
            <div className="top-progress mb-4">
              <SemiCircleProgress
                value={classQualityScore}
                label="Class Quality Score"
              />
              <div className="text-center">
                
                  <Link className="btn btn-primary d-flex align-items-center justify-content-center gap-2" href={sessionSummaryUrl}>
                    Session Summary
                  </Link>
            
              </div>
              <div className="text-center ml-12">
                <div className="student-profile-details-sec">
                  {/* pass assignmentCount down */}
                  {/* <StudentProfileDetails
                    data={studentData}
                    assignmentCount={assignmentCount}
                  /> */}
                </div>
              </div>
            </div>
            <div className="bottom-progress">
              <SemiCircleProgress
                value={studentPerformance}
                label="Overall Student Performance"
              />
              <div className="text-center ml-8">
{/* 
                  <Link className="btn btn-primary d-flex align-items-center justify-content-center gap-2" href={`/student/performance/viewPerformance?studentId=${data.studentId}&courseId=${course._id}`}>
                    View Performance
                  </Link> */}
            
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-md-6 mb-4">
          <div className="card-box">
            <AssignmentPending count={incompleteAssignmentCount} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard;
