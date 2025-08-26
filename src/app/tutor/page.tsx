/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  X,
  ArrowRight,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import VideoMeeting from "../components/VideoMeeting";
import AlphaTabVisualiser from "../components/AlphaTabVisualiser";

// Placeholder type for ClassData
interface ClassData {
  // Add actual properties as needed
  [key: string]: any;
}

export default function TutorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [classData, setClassData] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [feedbackPendingCount, setFeedbackPendingCount] = useState(0);
  const [totalClassesCount, setTotalClassesCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // Fix: Add missing state for courseTitleMap
  const [courseTitleMap, setCourseTitleMap] = useState<any>(null);
  const isMobile = false; // Replace with actual mobile detection logic
  const meeting = { isActive: false, url: "" }; // Replace with actual meeting state

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleJoinMeeting = (classId: string) => {
    // Implement join meeting logic
  };

  const handleLeaveMeeting = () => {
    // Implement leave meeting logic
  };

  const getUserInitials = (username: string | undefined) => {
    if (!username) return "";
    const names = username.split(" ");
    return names
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  const filterFutureClasses = (classes: ClassData[]) => {
    const now = new Date();
    return classes.filter((classItem) => {
      const classStartTime = new Date(classItem.startTime);
      return classStartTime > now;
    });
  };
  const calculateFeedbackPendingCount = (classes: ClassData[]) => {
    if (!classes || !Array.isArray(classes)) {
      return 0;
    }

    return classes.filter((classItem) => {
      // Check if feedbackId field exists but is empty/null/undefined
      return !classItem.feedbackId || classItem.feedbackId === "";
    }).length;
  };

  const SimpleLoader = () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();

        const assignmentResponse = await fetch("/Api/assignment");
        const assignmentResponseData = await assignmentResponse.json();

        setUserData(userData.user);
        setStudentCount(userData.studentCount || 0);

        // Set course data (keeping original naming)
        if (userData.courseDetails) {
          setCourseData(userData.courseDetails);
        }

        // Set the new course title map
        if (userData.courseTitleMap) {
          setCourseTitleMap(userData.courseTitleMap);
        }

        // Add null checks here
        if (
          userData.classDetails &&
          Array.isArray(userData.classDetails) &&
          userData.classDetails.length > 0
        ) {
          const sortedClasses = userData.classDetails.sort(
            (a: ClassData, b: ClassData) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

          const futureClasses = filterFutureClasses(sortedClasses);
          setClassData(futureClasses);

          // Calculate feedback pending count for ALL classes (not just future ones)
          const pendingCount = calculateFeedbackPendingCount(
            userData.classDetails
          );
          setFeedbackPendingCount(pendingCount);

          // Set total classes count
          setTotalClassesCount(userData.classDetails.length);
        }
        setLoading(false); // Set loading to false after data is loaded
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Removed for brevity */}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        {/* <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search here"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isMobile && (
                <button
                  aria-label="button"
                  type="button"
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
                >
                  <Menu size={20} />
                </button>
              )}

              <button
                aria-label="bbutton"
                className="p-2 text-gray-600 hover:text-[#6F09BA] transition-colors"
              >
                <Settings size={20} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#FFC357] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials(userData?.username)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.username || "Loading..."}
                  </p>
                  <p className="text-xs text-gray-500">Tutor</p>
                </div>
              </div>
            </div>
          </div>
        </header> */}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Render the React AlphaTab visualiser component for full integration */}
          <AlphaTabVisualiser />
        </main>
      </div>
    </div>
  );
}
