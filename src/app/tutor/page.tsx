/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Settings,
  ArrowRight,
  Users,
  BookOpen,
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Dynamically import VideoMeeting component with no SSR
const VideoMeeting = dynamic(() => import("../components/VideoMeeting"), {
  ssr: false,
});

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
  certified: string;
  profileImage: string;
}

interface ClassData {
  _id: string;
  title: string;
  course: string;
  instructor: string;
  description: string;
  startTime: string;
  endTime: string;
  recording: string | null;
  createdAt: string;
  updatedAt: string;
  feedbackId: string;
}

interface CourseData {
  _id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: string;
    topic: string;
    tangibleOutcome: string;
  }[];
}

interface CourseTitleMap {
  [courseId: string]: {
    title: string;
    category: string;
    description: string;
    duration: string;
    price: number;
    curriculum: {
      sessionNo: string;
      topic: string;
      tangibleOutcome: string;
    }[];
  };
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

interface MeetingState {
  isActive: boolean;
  url: string | null;
  classId: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [courseTitleMap, setCourseTitleMap] = useState<CourseTitleMap>({});
  const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [feedbackPendingCount, setFeedbackPendingCount] = useState<number>(0);
  const [totalClassesCount, setTotalClassesCount] = useState<number>(0);
  const [meeting, setMeeting] = useState<MeetingState>({
    isActive: false,
    url: null,
    classId: null,
  });
  const [profileBorderColor, setProfileBorderColor] = useState<string>("#FFC55A");

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const src = userData?.profileImage;
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = src;

    const handleLoad = () => {
      try {
        const w = 50, h = 50;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          const alpha = imageData[i + 3];
          if (!alpha) continue;
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setProfileBorderColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch (err) {
        console.warn("Color sampling failed:", err);
      }
    };

    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [userData?.profileImage]);

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

        if (userData.courseDetails) {
          setCourseData(userData.courseDetails);
        }

        if (userData.courseTitleMap) {
          setCourseTitleMap(userData.courseTitleMap);
        }

        if (userData.classDetails && Array.isArray(userData.classDetails) && userData.classDetails.length > 0) {
          const sortedClasses = userData.classDetails.sort(
            (a: ClassData, b: ClassData) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

          const futureClasses = filterFutureClasses(sortedClasses);
          setClassData(futureClasses);

          const pendingCount = calculateFeedbackPendingCount(userData.classDetails);
          setFeedbackPendingCount(pendingCount);
          setTotalClassesCount(userData.classDetails.length);
        } else {
          setClassData([]);
          setFeedbackPendingCount(0);
          setTotalClassesCount(0);
        }

        if (assignmentResponseData?.assignments) {
          setAssignmentData(assignmentResponseData.assignments);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setClassData([]);
        setFeedbackPendingCount(0);
        setTotalClassesCount(0);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCourseNameById = (courseId: string) => {
    return courseTitleMap[courseId]?.title || courseId;
  };

  const handleJoinMeeting = async (classId: string) => {
    try {
      console.log("[Meeting] Creating meeting for class:", classId);
      const response = await fetch("/Api/meeting/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: classId,
          userId: userData._id,
          userRole: userData.category,
        }),
      });

      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meeting");
      }

      router.push(
        `/tutor/video-call?url=${encodeURIComponent(data.url)}&userRole=${userData.category}`
      );
    } catch (error: any) {
      console.error("[Meeting] Error details:", error);
      toast.error(error.message || "Failed to create meeting. Please try again.");
    }
  };

  const handleLeaveMeeting = () => {
    setMeeting({
      isActive: false,
      url: null,
      classId: null,
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <SimpleLoader />;
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "SW";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {/* <div
          className={`bg-white border-r border-gray-200 h-screen ${
            isMobile
              ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : sidebarOpen
              ? "w-64"
              : "w-16"
          } transition-all duration-300 flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div
              className={`font-extrabold text-l text-orange-600 ${
                !sidebarOpen && !isMobile && "hidden"
              }`}
            >
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
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              {isMobile ? (
                sidebarOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )
              ) : sidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          <div className="flex flex-col h-full">
            <nav className="flex-1 px-2 py-4">
              <Link
                href="tutor/profile"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Users size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">Profile</span>
                )}
              </Link>
              <Link
                href="tutor/courses"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <BookOpen size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">My Courses</span>
                )}
              </Link>
              <Link
                href="tutor/create-course"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Users size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">Create Course</span>
                )}
              </Link>
              <Link
                href="tutor/myStudents"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Users size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">My Students</span>
                )}
              </Link>
              <Link
                href="tutor/assignments"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <BookOpen size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">Assignments</span>
                )}
              </Link>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/Api/users/logout");
                    if (response.ok) {
                      toast.success("Logged out successfully");
                      router.push("/login");
                    } else {
                      toast.error("Failed to logout");
                    }
                  } catch (error) {
                    toast.error("Error during logout");
                    console.error("Logout error:", error);
                  }
                  isMobile && setSidebarOpen(false);
                }}
                className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              >
                <LogOut size={20} />
                {(sidebarOpen || isMobile) && (
                  <span className="ml-3">Logout</span>
                )}
              </button>
            </nav>
          </div>
        </div>
      */}

        <div className="flex-1 flex flex-col">
          {/* Header */}
          {/* <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
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
                    aria-label="Toggle menu"
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
                  >
                    <Menu size={20} />
                  </button>
                )}

                <button
                  aria-label="Settings"
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
                  <div className="hidden sm:block">
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
          <main className="flex-1 p-4 lg:p-6">
            {meeting.isActive && meeting.url ? (
              <VideoMeeting url={meeting.url} onLeave={handleLeaveMeeting} />
            ) : (
              <>
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6">
                  {/* Profile Card */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div 
                      className="bg-white p-6 rounded-2xl border shadow-sm"
                      style={{ borderColor: profileBorderColor }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Profile
                      </h3>
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 bg-[#FFC357] rounded-full flex items-center justify-center overflow-hidden">
                            {userData?.profileImage ? (
                              <Image 
                                src={userData.profileImage} 
                                alt={userData.username || 'Profile'} 
                                width={80}
                                height={80}
                                className="w-full h-full object-cover rounded-full"
                                priority
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {getUserInitials(userData?.username)}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        </div>
                        <h4 className="text-2xl font-medium text-black mb-2">
                          {userData?.username || "Loading..."}
                        </h4>
                        <p className="text-gray-600 mb-6">
                          {courseData.length > 0
                            ? `${courseData[0].category} Tutor`
                            : "Tutor"}
                        </p>
                        <div className="flex flex-col space-y-3 w-full max-w-[200px]">
                          <div className="flex items-center justify-between rounded-lg bg-[#F1ECF7] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-[#7009BA]" />
                              <span className="text-sm font-medium text-[#7009BA]">Students</span>
                            </div>
                            <span className="text-sm font-semibold text-[#212121]">{studentCount}</span>
                          </div>

                          <div className="flex items-center justify-between rounded-lg bg-[#F1ECF7] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <BookOpen size={16} className="text-[#7009BA]" />
                              <span className="text-sm font-medium text-[#7009BA]">Courses</span>
                            </div>
                            <span className="text-sm font-semibold text-[#212121]">
                              {courseData.length || 0}
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded-lg bg-[#F1ECF7] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-[#7009BA]" />
                              <span className="text-sm font-medium text-[#7009BA]">Certified</span>
                            </div>
                            <span className="text-sm font-semibold text-[#212121]">Yes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-7 xl:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                      {/* Stats Column */}
                      <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                          <div className="text-3xl font-bold text-[#6F09BA] mb-1">15%</div>
                          <p className="text-sm text-gray-600">Lesson Completion</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                          <div className="text-3xl font-bold text-[#6F09BA] mb-1">80%</div>
                          <p className="text-sm text-gray-600">Session Engagement</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                          <div className="text-3xl font-bold text-[#6F09BA] mb-1">95%</div>
                          <p className="text-sm text-gray-600">Student Satisfaction</p>
                        </div>
                      </div>
                      
                      {/* Performance Column */}
                      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between">
                        {/* Course Performance */}
                        <div className="text-center mb-8">
                          <p className="text-sm font-semibold text-[#212121] mb-4">
                            Overall Course Performance
                          </p>
                          <svg width="120" height="60" viewBox="0 0 120 60" className="mx-auto">
                            <path
                              d="M 10 60 A 50 50 0 0 1 110 60"
                              stroke="#FFF7E8"
                              strokeWidth="8"
                              fill="none"
                            />
                            <path
                              d="M 10 60 A 50 50 0 0 1 110 60"
                              stroke="#FFC357"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={Math.PI * 50}
                              strokeDashoffset={Math.PI * 50 * (1 - 7.6 / 10)}
                            />
                          </svg>
                          <div className="text-3xl font-bold text-purple-700 -mt-4">
                            7.6<span className="text-gray-500 text-base">/10</span>
                          </div>
                        </div>

                        {/* Student Performance */}
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[#212121] mb-4">
                            Overall Student Performance
                          </p>
                          <svg width="120" height="60" viewBox="0 0 120 60" className="mx-auto">
                            <path
                              d="M 10 60 A 50 50 0 0 1 110 60"
                              stroke="#FFF7E8"
                              strokeWidth="8"
                              fill="none"
                            />
                            <path
                              d="M 10 60 A 50 50 0 0 1 110 60"
                              stroke="#FFC357"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={Math.PI * 50}
                              strokeDashoffset={Math.PI * 50 * (1 - 6.6 / 10)}
                            />
                          </svg>
                          <div className="text-3xl font-bold text-purple-700 -mt-4">
                            6.6<span className="text-gray-500 text-base">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Image and Refer Card */}
                      <div className="flex flex-col">
                        <div className="flex-1 flex items-center justify-center mb-4">
                          <Image
                            src="/tutorDashboard.png"
                            alt="Tutor Dashboard"
                            width={200}
                            height={200}
                            className="rounded-lg object-contain max-w-full h-auto"
                            priority
                          />
                        </div>

                        {/* Refer and Earn Card */}
                        <div className="bg-gradient-to-br from-[#6F09BA] to-[#4A0680] rounded-lg p-4 text-white">
                          <h3 className="text-lg font-bold mb-2">Refer and Earn</h3>
                          <p className="text-sm text-white/90 mb-4">
                            Invite friends and earn exclusive rewards!
                          </p>
                          <button className="w-full bg-[#FFC357] hover:bg-[#FFB627] transition-colors rounded-lg px-4 py-3 text-gray-900 font-medium text-sm flex items-center justify-center gap-2">
                            <span>Refer Now</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Upcoming Lessons */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Upcoming Lessons
                        </h3>
                        <button className="text-[#6F09BA] text-sm font-medium hover:underline">
                          View All
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Date
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Time
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Course
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Class Name
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Student Name
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-[#212121]">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {classData.slice(0, 7).map((classItem, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-3 px-2 text-sm text-gray-900">
                                  {formatDate(classItem.startTime)}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">
                                  {formatTime(classItem.startTime)} -{" "}
                                  {formatTime(classItem.endTime)}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-900">
                                  <div>
                                    <div className="font-medium">
                                      {getCourseNameById(classItem.course)}
                                    </div>
                                    {courseTitleMap[classItem.course]?.category && (
                                      <div className="text-xs text-gray-500">
                                        {courseTitleMap[classItem.course].category}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">
                                  {classItem.title}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">
                                  {classItem.title}
                                </td>
                                <td className="py-3 px-2">
                                  <button
                                    onClick={() => handleJoinMeeting(classItem._id)}
                                    className="bg-[#6F09BA] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#5A0799] transition-colors"
                                  >
                                    Join
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {classData.length === 0 && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-6 px-2 text-center text-gray-500"
                                >
                                  No upcoming lessons
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Pending */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                        <span className="block">Feedback</span>
                        <span className="block">Pending</span>
                      </h3>
                      {!loading ? (
                        <>
                          <div className="flex items-center justify-center mb-8">
                            <div className="relative w-32 h-32">
                              <svg
                                className="w-32 h-32 transform -rotate-90"
                                viewBox="0 0 36 36"
                              >
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2"
                                  strokeDasharray={`${
                                    totalClassesCount > 0
                                      ? ((totalClassesCount - feedbackPendingCount) / totalClassesCount) * 100
                                      : 0
                                  }, 100`}
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  strokeDasharray={`${
                                    totalClassesCount > 0
                                      ? (feedbackPendingCount / totalClassesCount) * 100
                                      : 0
                                  }, 100`}
                                  strokeDashoffset={`${
                                    totalClassesCount > 0
                                      ? -((totalClassesCount - feedbackPendingCount) / totalClassesCount) * 100
                                      : 0
                                  }`}
                                />
                              </svg>

                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-gray-900">
                                    {feedbackPendingCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center space-x-4 mb-6">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">
                                Pending ({feedbackPendingCount})
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">
                                Complete ({totalClassesCount - feedbackPendingCount})
                              </span>
                            </div>
                          </div>

                          <Link
                            href={"/tutor/feedback"}
                            className="w-full bg-[#6F09BA] text-white py-3 rounded-lg font-medium hover:bg-[#5A0799] transition-colors flex items-center justify-center space-x-2"
                          >
                            <span>Give Feedback</span>
                            <ArrowRight size={16} />
                          </Link>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-48">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}