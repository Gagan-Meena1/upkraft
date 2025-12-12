// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   Calendar,
//   BookOpen,
//   Users,
//   PlusCircle,
//   User,
//   BookMarkedIcon,
//   BookCheck,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Menu,
//   X,
// } from "lucide-react";
// import Image from "next/image";
// import { PiNutBold } from "react-icons/pi";
// import dynamic from "next/dynamic";
// import { toast } from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import "../components/tutor/Dashboard.css";
// import ProfileProgress from "../components/tutor/ProfileProgress";
// import "../components/tutor/ReferAndEarn.css";
// import ReferAndEarn from "../components/tutor/ReferAndEarn";
// import UpcomingLessons from "../components/tutor/UpcomingLessons";
// import SemiCircleProgress from "../components/tutor/SemiCircleProgress";
// import "../components/tutor/SemiCircleProgress.css";
// import "../components/tutor/FeedbackPending.css";
// import FeedbackPending from "../components/tutor/FeedbackPending";
// import LogoHeader from "../../assets/LogoHeader.png";
// import Form from "react-bootstrap/Form";
// import Dropdown from "react-bootstrap/Dropdown";
// import Button from "react-bootstrap/Button";
// import Author from "../../assets/author.png";
// import SideMenuHeader from "../components/SideMenuHeader";
// import { useUserData } from "../providers/UserData/page";


// // Dynamically import VideoMeeting component with no SSR
// const VideoMeeting = dynamic(() => import("../components/VideoMeeting"), {
//   ssr: false,
// });

// interface UserData {
//   _id: string;
//   username: string;
//   email: string;
//   category: string;
//   age: number;
//   address: string;
//   contact: string;
//   courses: any[];
//   createdAt: string;
// }

// interface ClassData {
//   _id: string;
//   title: string;
//   course: string;
//   instructor: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   recording: string | null;
//   csat?: Array<{
//     // Add this
//     userId: string;
//     rating: number;
//     feedback: string;
//   }>;
//   createdAt: string;
//   updatedAt: string;
// }

// interface AssignmentData {
//   _id: string;
//   title: string;
//   description: string;
//   deadline: string;
//   courseId: string;
//   courseTitle?: string;
//   courseCategory?: string;
//   courseDuration?: string;
//   courseDescription?: string;
//   status?: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface MeetingState {
//   isActive: boolean;
//   url: string | null;
//   classId: string | null;
// }
// /**
//  * Calculate average CSAT rating from class data
//  * @param {Array} classData - Array of class objects with csat field
//  * @returns {number} - Average rating rounded to 1 decimal place
//  */
// // Progress Box Components

// const calculateAverageCSATRating = (classData: ClassData[]) => {
//   if (!classData || classData.length === 0) {
//     return 0;
//   }

//   let totalRating = 0;
//   let totalRatingsCount = 0;

//   // Iterate through each class
//   classData.forEach((classItem) => {
//     // Check if class has csat data
//     if (
//       classItem.csat &&
//       Array.isArray(classItem.csat) &&
//       classItem.csat.length > 0
//     ) {
//       // Calculate average rating for this specific class
//       const classRatings = classItem.csat
//         .map((csatEntry) => csatEntry.rating)
//         .filter((rating) => rating != null && rating > 0); // Filter out null/undefined/0 ratings

//       if (classRatings.length > 0) {
//         const classAverageRating =
//           classRatings.reduce((sum, rating) => sum + rating, 0) /
//           classRatings.length;

//         // Add to overall totals
//         totalRating += classAverageRating;
//         totalRatingsCount++;
//       }
//     }
//   });
//   if (totalRatingsCount === 0) {
//     return 0;
//   }

//   const overallAverage = totalRating / totalRatingsCount;

//   // Return rounded to 1 decimal place
//   return Math.round(overallAverage * 10) / 10;
// };
// const ClassProgressBox = ({
//   completedClasses,
//   totalClasses,
// }: {
//   completedClasses: number;
//   totalClasses: number;
// }) => {
//   const progressPercentage =
//     totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div className="mb-3 sm:mb-0">
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
//             Class Progress
//           </h3>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
//               <span className="text-xs sm:text-sm text-gray-600">
//                 Completed:{" "}
//                 <span className="font-medium text-green-600">
//                   {completedClasses}
//                 </span>
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Clock size={18} className="text-orange-500 flex-shrink-0" />
//               <span className="text-xs sm:text-sm text-gray-600">
//                 Total:{" "}
//                 <span className="font-medium text-gray-900">
//                   {totalClasses}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="text-left sm:text-right">
//           <div className="text-xl sm:text-2xl font-bold text-orange-500">
//             {completedClasses}/{totalClasses}
//           </div>
//           <div className="text-xs sm:text-sm text-gray-500">
//             {progressPercentage.toFixed(0)}% Complete
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="mt-4">
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-gradient-href-r from-orange-500 href-orange-400 h-2 rounded-full transition-all duration-500 ease-out"
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AssignmentProgressBox = ({
//   incompleteAssignments,
//   totalAssignments,
// }: {
//   incompleteAssignments: number;
//   totalAssignments: number;
// }) => {
//   const completedAssignments = totalAssignments - incompleteAssignments;
//   const progressPercentage =
//     totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div className="mb-3 sm:mb-0">
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
//             Assignment Progress
//           </h3>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
//               <span className="text-xs sm:text-sm text-gray-600">
//                 Completed:{" "}
//                 <span className="font-medium text-green-600">
//                   {completedAssignments}
//                 </span>
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
//               <span className="text-xs sm:text-sm text-gray-600">
//                 Pending:{" "}
//                 <span className="font-medium text-red-600">
//                   {incompleteAssignments}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="text-left sm:text-right">
//           <div className="text-xl sm:text-2xl font-bold text-orange-500">
//             {completedAssignments}/{totalAssignments}
//           </div>
//           <div className="text-xs sm:text-sm text-gray-500">
//             {progressPercentage.toFixed(0)}% Complete
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="mt-4">
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-gradient-href-r from-green-500 href-green-400 h-2 rounded-full transition-all duration-500 ease-out"
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StudentsCountBox = ({ studentCount }: { studentCount: number }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-1 min-w-0">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div className="mb-3 sm:mb-0">
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
//             My Students
//           </h3>
//           <div className="flex items-center gap-2">
//             <Users size={18} className="text-blue-500 flex-shrink-0" />
//             <span className="text-xs sm:text-sm text-gray-600">
//               Total Students:{" "}
//               <span className="font-medium text-blue-600">{studentCount}</span>
//             </span>
//           </div>
//         </div>

//         <div className="text-left sm:text-right">
//           <div className="text-2xl sm:text-3xl font-bold text-blue-500">
//             {studentCount}
//           </div>
//           <div className="text-xs sm:text-sm text-gray-500">
//             Active Students
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const pathname = usePathname(); // Add this hook
//   // const [userData, setUserData] = useState<UserData | null>(null);
//   const [classData, setClassData] = useState<ClassData[]>([]);
//   const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);
//   // const [studentCount, setStudentCount] = useState<number>(0);
//   const [loading, setLoading] = useState(true);
//   const [activePage, setActivePage] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [averageCSATRating, setAverageCSATRating] = useState(0);

//   const [meeting, setMeeting] = useState<MeetingState>({
//     isActive: false,
//     url: null,
//     classId: null,
//   });
//   const [coursePerformance, setCoursePerformance] = useState<number>(0);
//   const [studentPerformance, setStudentPerformance] = useState<number>(0);
//   const [pendingFeedbackCount, setPendingFeedbackCount] = useState<number>(0);
//   const [assignmentCompletionPercentage, setAssignmentCompletionPercentage] =
//     useState<number>(0);
//   const [overallPerformanceScore, setOverallPerformanceScore] =
//     useState<number>(0);
//   const [averageCourseQuality, setAverageCourseQuality] = useState<number>(0);
//   const [pendingFeedbackLoading, setPendingFeedbackLoading] =
//     useState<boolean>(true);
// // const [courseDetails, setCourseDetails] = useState<any[]>([]); // ✅ ADD this
//   const { userData, courseDetails,classDetails, studentCount, loading: contextLoading } = useUserData();


//   const role = "tutor";
//   const isActive = (path: string) => {
//     return pathname === path;
//   };
//   const classesPerPage = isMobile ? 1 : 3; // Show 1 class per page on mobile
//   const totalPages = Math.ceil(classData.length / classesPerPage);

//   //   const LoadingSkeleton = ({ height = "h-8", width = "w-16" }) => (
//   //   <div className={`animate-pulse ${height} ${width} bg-gray-200 rounded`} />
//   // );

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (window.innerWidth >= 768) {
//         setSidebarOpen(true);
//       } else {
//         setSidebarOpen(false);
//       }
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const filterFutureClasses = (classes: ClassData[]) => {
//     const now = new Date();
//     return classes.filter((classItem) => {
//       const classStartTime = new Date(classItem.startTime);
//       return classStartTime > now;
//     });
//   };
//   const fetchInProgress = useRef(false);

//   // useEffect(() => {
//   //   const fetchEssentialData = async () => {
//   //     try {
//   //       if (fetchInProgress.current) {
//   //         console.log("Fetch already in progress, skipping");
//   //         return;
//   //       }

//   //       fetchInProgress.current = true;

//   //       console.log("Phase 1: Loading essential data...");
//   //       const [essentialsResponse, assignmentResponse, perfResponse] =
//   //         await Promise.allSettled([
//   //           fetch("/Api/users/user"), // Changed from "/Api/users/essentials" to "/Api/users/user"
//   //           fetch("/Api/assignment"),
//   //           fetch("/Api/overallPerformanceScore"),
//   //         ]);

//   //       const essentialsData =
//   //         essentialsResponse.status === "fulfilled"
//   //           ? await essentialsResponse.value.json()
//   //           : null;

//   //       const assignmentResponseData =
//   //         assignmentResponse.status === "fulfilled"
//   //           ? await assignmentResponse.value.json()
//   //           : null;

//   //       if (perfResponse.status === "fulfilled") {
//   //         const perfData = await perfResponse.value.json();

//   //         if (perfData.success) {
//   //           setOverallPerformanceScore(perfData.overallScore);
//   //           setAverageCourseQuality(perfData.averageCourseQuality);
//   //         } else {
//   //           setOverallPerformanceScore(0);
//   //           setAverageCourseQuality(0);
//   //         }
//   //       } else {
//   //         setOverallPerformanceScore(0);
//   //         setAverageCourseQuality(0);
//   //       }

//   //       if (!essentialsData?.user) {
//   //         setLoading(false);
//   //         fetchInProgress.current = false;
//   //         return;
//   //       }

//   //       setUserData(essentialsData.user);

//   //       if (
//   //         essentialsData.classDetails &&
//   //         essentialsData.classDetails.length > 0
//   //       ) {
//   //         setClassData(essentialsData.classDetails);
//   //       } else {
//   //         setClassData([]);
//   //       }

//   //       // Handle assignments
//   //       if (assignmentResponseData?.data?.assignments) {
//   //         setAssignmentData(assignmentResponseData.data.assignments);

//   //         const assignments = assignmentResponseData.data.assignments;
//   //         const completedAssignments = assignments.filter(
//   //           (assignment) => assignment.status === true
//   //         ).length;
//   //         const percentage = Math.round(
//   //           (completedAssignments / assignments.length) * 100
//   //         );
//   //         setAssignmentCompletionPercentage(percentage);
//   //       }

//   //       // ✅ SHOW PAGE IMMEDIATELY - Student count and feedback will load in background
//   //       console.log("Phase 1 complete - showing page with loading states");
//   //       setLoading(false);
//   //       fetchInProgress.current = false;

//   //       // ✅ PHASE 2: Load non-critical data in background
//   //       console.log("Phase 2: Loading additional data in background...");
//   //       loadAdditionalData(essentialsData.user._id);
//   //     } catch (error) {
//   //       console.error("Error fetching essential data:", error);
//   //       setLoading(false);
//   //       fetchInProgress.current = false;
//   //     }
//   //   };

//   //   const loadAdditionalData = async (userId: string) => {
//   //     try {
//   //       // Fetch students and pending feedback in parallel
//   //       const [studentsResponse, feedbackResponse] = await Promise.allSettled([
//   //         fetch("/Api/myStudents"),
//   //         fetch("/Api/pendingFeedback"),
//   //       ]);

//   //       // Handle students data
//   //       if (studentsResponse.status === "fulfilled") {
//   //         const studentsData = await studentsResponse.value.json();
//   //         if (studentsData.success) {
//   //           setStudentCount(studentsData.userCount || 0);
//   //           console.log("Student count updated:", studentsData.userCount);
//   //         } else {
//   //           setStudentCount(0);
//   //         }
//   //       } else {
//   //         setStudentCount(0);
//   //       }

//   //       // Handle feedback data
//   //       if (feedbackResponse.status === "fulfilled") {
//   //         try {
//   //           const response = feedbackResponse.value;

//   //           if (!response.ok) {
//   //             console.error(
//   //               "Feedback API error:",
//   //               response.status,
//   //               response.statusText
//   //             );
//   //             setPendingFeedbackCount(0);
//   //             setPendingFeedbackLoading(false);
//   //             return;
//   //           }

//   //           const feedbackData = await response.json();

//   //           if (feedbackData.success) {
//   //             setPendingFeedbackCount(feedbackData.count || 0);
//   //             console.log("Pending feedback count:", feedbackData.count);
//   //           } else {
//   //             setPendingFeedbackCount(0);
//   //           }
//   //         } catch (parseError) {
//   //           console.error("Error parsing feedback response:", parseError);
//   //           setPendingFeedbackCount(0);
//   //         } finally {
//   //           setPendingFeedbackLoading(false);
//   //         }
//   //       } else {
//   //         console.error("Feedback fetch failed:", feedbackResponse.reason);
//   //         setPendingFeedbackCount(0);
//   //         setPendingFeedbackLoading(false);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error loading additional data:", error);
//   //       setStudentCount(0);
//   //       setPendingFeedbackCount(0);
//   //       setPendingFeedbackLoading(false);
//   //     }
//   //   };

//   //   // const calculatePendingFeedback = async (courseDetails: any[], studentsData: any) => {
//   //   //   try {
//   //   //     if (!courseDetails || courseDetails.length === 0) {
//   //   //       setPendingFeedbackCount(0);
//   //   //       return;
//   //   //     }

//   //   //     // Get students from the already fetched data
//   //   //     const students = studentsData?.filteredUsers || [];

//   //   //     if (students.length === 0) {
//   //   //       setPendingFeedbackCount(0);
//   //   //       return;
//   //   //     }

//   //   //     // Get all class IDs from courses
//   //   //     const classIds = courseDetails.reduce((acc, course) => {
//   //   //       return acc.concat(course.class || []);
//   //   //     }, []);

//   //   //     if (classIds.length === 0) {
//   //   //       setPendingFeedbackCount(0);
//   //   //       return;
//   //   //     }

//   //   //     // Fetch all feedback for all courses in parallel
//   //   //     const courseIds = courseDetails.map((c: any) => c._id);

//   //   //     const feedbackPromises = courseIds.map((courseId: string) =>
//   //   //       fetch(`/Api/studentFeedbackForTutor?courseId=${courseId}`)
//   //   //         .then(async (response) => {
//   //   //           if (response.status === 404 || !response.ok) {
//   //   //             return null;
//   //   //           }

//   //   //           try {
//   //   //             const data = await response.json();
//   //   //             return data.data || [];
//   //   //           } catch (e) {
//   //   //             return null;
//   //   //           }
//   //   //         })
//   //   //         .catch(() => null)
//   //   //     );

//   //   //     const feedbackResults = await Promise.all(feedbackPromises);

//   //   //     // Process feedback results
//   //   //     const classesWithFeedback = new Map();

//   //   //     feedbackResults.forEach((feedbacks) => {
//   //   //       if (feedbacks && Array.isArray(feedbacks)) {
//   //   //         feedbacks.forEach((feedback: any) => {
//   //   //           const key = `${feedback.classId}-${feedback.userId}`;
//   //   //           classesWithFeedback.set(key, true);
//   //   //         });
//   //   //       }
//   //   //     });

//   //   //     // Count pending feedback using classIds
//   //   //     let pendingCount = 0;
//   //   //     students.forEach((student: any) => {
//   //   //       classIds.forEach((classId: any) => {
//   //   //         const key = `${classId}-${student._id}`;
//   //   //         if (!classesWithFeedback.has(key)) {
//   //   //           pendingCount++;
//   //   //         }
//   //   //       });
//   //   //     });

//   //   //     console.log("Pending feedback count calculated:", pendingCount);
//   //   //     setPendingFeedbackCount(pendingCount);
//   //   //   } catch (error) {
//   //   //     console.error("Error calculating pending feedback:", error);
//   //   //     setPendingFeedbackCount(0);
//   //   //   }
//   //   // };

//   //   fetchEssentialData();
//   // }, []);
//   useEffect(() => {
//   const fetchEssentialData = async () => {
//     try {
//       if (fetchInProgress.current) {
//         console.log("Fetch already in progress, skipping");
//         return;
//       }

//       fetchInProgress.current = true;

//       console.log("Phase 1: Loading essential data...");
      
//       // ✅ FIXED: Only fetch assignment and performance (removed user fetch)
//       const [assignmentResponse, perfResponse] = await Promise.allSettled([
//         fetch("/Api/assignment"),
//         fetch("/Api/overallPerformanceScore"),
//       ]);

//       const assignmentResponseData =
//         assignmentResponse.status === "fulfilled"
//           ? await assignmentResponse.value.json()
//           : null;

//       // ✅ Handle performance response
//       if (perfResponse.status === "fulfilled") {
//         const perfData = await perfResponse.value.json();

//         if (perfData.success) {
//           setOverallPerformanceScore(perfData.overallScore);
//           setAverageCourseQuality(perfData.averageCourseQuality);
//         } else {
//           setOverallPerformanceScore(0);
//           setAverageCourseQuality(0);
//         }
//       } else {
//         setOverallPerformanceScore(0);
//         setAverageCourseQuality(0);
//       }

//       // ✅ Use data from context (userData, courseDetails, studentCount are already available)
//       if (!userData) {
//         setLoading(false);
//         fetchInProgress.current = false;
//         return;
//       }

//       // ✅ Set class details from context if available
//       // Note: You'll need to add classDetails to your context provider
//       // For now, you might need to keep a separate API call for class details
//       // OR add it to the /Api/users/user endpoint response

//       // Handle assignments
//       if (assignmentResponseData?.data?.assignments) {
//         setAssignmentData(assignmentResponseData.data.assignments);

//         const assignments = assignmentResponseData.data.assignments;
//         const completedAssignments = assignments.filter(
//           (assignment) => assignment.status === true
//         ).length;
//         const percentage = Math.round(
//           (completedAssignments / assignments.length) * 100
//         );
//         setAssignmentCompletionPercentage(percentage);
//       }

//       console.log("Phase 1 complete - showing page");
//       setLoading(false);
//       fetchInProgress.current = false;

//       // ✅ PHASE 2: Only load pending feedback (non-critical)
//       console.log("Phase 2: Loading pending feedback in background...");
//       loadPendingFeedback();
      
//     } catch (error) {
//       console.error("Error fetching essential data:", error);
//       setLoading(false);
//       fetchInProgress.current = false;
//     }
//   };

//   const loadPendingFeedback = async () => {
//     try {
//       const feedbackResponse = await fetch("/Api/pendingFeedback");
      
//       if (!feedbackResponse.ok) {
//         console.error("Feedback API error:", feedbackResponse.status);
//         setPendingFeedbackCount(0);
//         setPendingFeedbackLoading(false);
//         return;
//       }

//       const feedbackData = await feedbackResponse.json();

//       if (feedbackData.success) {
//         setPendingFeedbackCount(feedbackData.count || 0);
//         console.log("Pending feedback count:", feedbackData.count);
//       } else {
//         setPendingFeedbackCount(0);
//       }
//     } catch (error) {
//       console.error("Error loading pending feedback:", error);
//       setPendingFeedbackCount(0);
//     } finally {
//       setPendingFeedbackLoading(false);
//     }
//   };

//   // ✅ Only fetch when userData is available from context
//   if (userData) {
//     fetchEssentialData();
//   }
// }, [userData]); // ✅ Add dependency on userData from context
// useEffect(() => {
//   if (classDetails && classDetails.length > 0) {
//     setClassData(classDetails);
//     // console.log("Class details set from context:", classDetails);
//   }
// }, [classDetails]);
  
//   useEffect(() => {
//     if (classData && classData.length > 0) {
//       const avgRating = calculateAverageCSATRating(classData);
//       setAverageCSATRating(avgRating);
//       console.log("Average CSAT Rating:", avgRating);
//     }
//   }, [classData]);
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const formatTime = (dateString: string) => {
//     const utcDate = new Date(dateString);
//     // Treat the UTC time as if it were local time
//     const localDate = new Date(
//       utcDate.getUTCFullYear(),
//       utcDate.getUTCMonth(),
//       utcDate.getUTCDate(),
//       utcDate.getUTCHours(),
//       utcDate.getUTCMinutes(),
//       utcDate.getUTCSeconds()
//     );

//     return localDate.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const handleNextPage = () => {
//     if (activePage < totalPages - 1) {
//       setActivePage(activePage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (activePage > 0) {
//       setActivePage(activePage - 1);
//     }
//   };

//   const currentClasses = classData.slice(
//     activePage * classesPerPage,
//     (activePage + 1) * classesPerPage
//   );

//   const handleJoinMeeting = async (classId: string) => {
//     try {
//       console.log("[Meeting] Creating meeting for class:", classId);
//       const response = await fetch("/Api/meeting/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           classId: classId,
//           userId: userData._id,
//           userRole: userData.category,
//         }),
//       });
//       console.log("userData:", userData);
//       console.log("[printing for debugging] userData:", userData);

//       const data = await response.json();
//       console.log("[Meeting] Server response:", data);

//       if (!response.ok) {
//         throw new Error(data.error || "Failed href create meeting");
//       }

//       router.push(
//         `/tutor/video-call?url=${encodeURIComponent(data.url)}&userRole=${
//           userData.category
//         }`
//       );
//     } catch (error: any) {
//       console.error("[Meeting] Error details:", error);
//       toast.error(
//         error.message || "Failed href create meeting. Please try again."
//       );
//     }
//   };

//   const handleLeaveMeeting = () => {
//     setMeeting({
//       isActive: false,
//       url: null,
//       classId: null,
//     });
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   // Calculate assignment completion percentage
//   const calculateAssignmentCompletion = (assignments) => {
//     if (!assignments || assignments.length === 0) return 0;

//     // Count completed assignments (status === true)
//     const completedCount = assignments.filter(
//       (assignment) => assignment.status === true
//     ).length;

//     // Calculate percentage
//     const percentage = (completedCount / assignments.length) * 100;

//     // Return formatted percentage
//     return Math.round(percentage);
//   };

//   // useEffect(() => {
//   //   const fetchActualCourses = async () => {
//   //     try {
//   //       // Fetch the actual courses from the courses API
//   //       const response = await fetch("/Api/tutors/courses");
//   //       const data = await response.json();
//   //       console.log("Actual courses loaded:", data.course);

//   //       setActualCourses(data.course);
//   //       // if (data.success && data.courses) {
//   //       // } else {
//   //       //   // Fallback to any available course data
//   //       //   console.warn("Unable to fetch actual courses, using fallback data");
//   //       // }
//   //     } catch (error) {
//   //       console.error("Error fetching actual courses:", error);
//   //     }
//   //   };

//   //   fetchActualCourses();
//   // }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   const totalClasses = classData.length;
//   const completedClasses = classData.filter(
//     (classItem) => classItem.recording
//   ).length;

//   // Calculate assignment progress
//   const totalAssignments = assignmentData.length;
//   const incompleteAssignments = assignmentData.filter(
//     (assignment) => !assignment.status
//   ).length;

//   function setRole(arg0: string): void {
//     throw new Error("Function not implemented.");
//   }

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <div className="container">
//         <div className="row">
//           <div className="col col-xxl-5 order-xxl-1 order-sm-1 col-md-6 order-md-1 mb-4">
//             <div className="card-box profile-card">
//               <h2 className="mb-4">Profile</h2>
//               <div className="com-profile d-flex align-items-center flex-md-nowrap flex-wrap justify-content-center gap-2">
//                 <div className="col-img-profile">
//                   <ProfileProgress user={userData ? userData : null} />
//                 </div>
//                 <div className="col-text-profile">
//                   <ul className="p-0 m-0 list-unstyled">
//                     <li className="btn-white d-flex align-items-center gap-2 w-100">
//                       <span className="icons">
//                         <svg
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             d="M8.97648 4.9C8.58925 4.56224 8.11196 4.34468 7.60301 4.27394C7.09407 4.2032 6.57554 4.28236 6.11087 4.50171C5.64621 4.72107 5.25556 5.07112 4.98673 5.50903C4.7179 5.94693 4.58255 6.45371 4.59724 6.96734C4.61193 7.48097 4.77603 7.97918 5.06944 8.401C5.36286 8.82283 5.77288 9.14998 6.24932 9.34242C6.72576 9.53486 7.24797 9.58425 7.75204 9.48454C8.25611 9.38483 8.72019 9.14034 9.08748 8.781C9.42707 9.30846 9.89356 9.7423 10.4442 10.0428C10.9949 10.3433 11.6122 10.5008 12.2395 10.501C12.8666 10.501 13.4838 10.3438 14.0344 10.0437C14.5851 9.74353 15.0517 9.31009 15.3915 8.783C15.7588 9.14234 16.2229 9.38683 16.7269 9.48654C17.231 9.58625 17.7532 9.53686 18.2296 9.34442C18.7061 9.15198 19.1161 8.82483 19.4095 8.403C19.7029 7.98118 19.867 7.48297 19.8817 6.96934C19.8964 6.45571 19.7611 5.94893 19.4922 5.51103C19.2234 5.07312 18.8328 4.72307 18.3681 4.50371C17.9034 4.28436 17.3849 4.2052 16.876 4.27594C16.367 4.34668 15.8897 4.56424 15.5025 4.902C15.1755 4.32463 14.7012 3.84437 14.1279 3.51022C13.5547 3.17607 12.903 3.00001 12.2395 3C11.5762 2.99981 10.9246 3.17557 10.3514 3.50935C9.77817 3.84314 9.30373 4.32301 8.97648 4.9ZM9.98948 6.75C9.98948 6.15326 10.2265 5.58097 10.6485 5.15901C11.0705 4.73705 11.6427 4.5 12.2395 4.5C12.8362 4.5 13.4085 4.73705 13.8305 5.15901C14.2524 5.58097 14.4895 6.15326 14.4895 6.75C14.4895 7.34674 14.2524 7.91903 13.8305 8.34099C13.4085 8.76295 12.8362 9 12.2395 9C11.6427 9 11.0705 8.76295 10.6485 8.34099C10.2265 7.91903 9.98948 7.34674 9.98948 6.75ZM8.57748 5.94C8.44395 6.54465 8.46181 7.17292 8.62948 7.769C8.43999 8.0711 8.1573 8.3033 7.82414 8.4305C7.49098 8.55769 7.12547 8.57297 6.78286 8.47401C6.44025 8.37506 6.13916 8.16725 5.92512 7.88202C5.71109 7.59678 5.59573 7.24961 5.59648 6.893C5.59668 6.54497 5.70738 6.206 5.91264 5.92494C6.11789 5.64388 6.40709 5.43526 6.73855 5.32915C7.07 5.22304 7.42659 5.22492 7.75691 5.33453C8.08723 5.44413 8.37421 5.65579 8.57648 5.939M15.8485 7.768C16.0167 7.17166 16.0346 6.54293 15.9005 5.938C16.1049 5.6512 16.3962 5.4377 16.7312 5.32898C17.0662 5.22026 17.4273 5.22208 17.7612 5.33417C18.0951 5.44626 18.3841 5.66269 18.5857 5.95153C18.7873 6.24038 18.8907 6.58635 18.8807 6.93842C18.8707 7.2905 18.7478 7.63004 18.5301 7.90697C18.3125 8.1839 18.0116 8.38356 17.6719 8.47651C17.3322 8.56946 16.9716 8.55077 16.6433 8.42321C16.3149 8.29564 16.0363 8.06594 15.8485 7.768ZM5.19048 10.047C5.53748 9.955 5.86548 10.069 6.09148 10.233C6.18148 10.298 6.30548 10.378 6.45648 10.451C6.57208 10.5109 6.65976 10.6135 6.70087 10.7371C6.74198 10.8606 6.73328 10.9953 6.67663 11.1125C6.61997 11.2298 6.51982 11.3203 6.39747 11.3648C6.27513 11.4093 6.14024 11.4044 6.02148 11.351C5.84039 11.2638 5.66737 11.1607 5.50448 11.043C5.48826 11.0314 5.4704 11.0223 5.45148 11.016L5.44448 11.015C5.30965 11.051 5.17592 11.091 5.04348 11.135L4.35748 11.359C4.10166 11.4423 3.87044 11.5876 3.68444 11.782C3.49843 11.9764 3.36343 12.2138 3.29148 12.473L3.00848 14.522C2.95248 14.925 3.16548 15.227 3.46848 15.299C3.69182 15.3537 3.96282 15.407 4.28148 15.459C4.34636 15.4695 4.40852 15.4927 4.46444 15.5272C4.52035 15.5617 4.56892 15.607 4.60736 15.6603C4.64581 15.7136 4.67337 15.7739 4.68849 15.8379C4.70361 15.9018 4.70599 15.9681 4.69548 16.033C4.68498 16.0979 4.6618 16.16 4.62726 16.216C4.59273 16.2719 4.54753 16.3204 4.49423 16.3589C4.44092 16.3973 4.38057 16.4249 4.31662 16.44C4.25266 16.4551 4.18636 16.4575 4.12148 16.447C3.82473 16.3998 3.52985 16.3414 3.23748 16.272C2.34248 16.059 1.90448 15.202 2.01748 14.385L2.30948 12.279L2.31548 12.252C2.425 11.8238 2.64104 11.4303 2.94352 11.1081C3.246 10.7858 3.62508 10.5453 4.04548 10.409L4.73048 10.184C4.88382 10.134 5.03715 10.0883 5.19048 10.047ZM19.4195 10.047C19.2651 10.0092 19.1042 10.0063 18.9485 10.0385C18.7928 10.0706 18.6463 10.1371 18.5195 10.233C18.4295 10.298 18.3055 10.378 18.1545 10.451C18.0389 10.5109 17.9512 10.6135 17.9101 10.7371C17.869 10.8606 17.8777 10.9953 17.9343 11.1125C17.991 11.2298 18.0911 11.3203 18.2135 11.3648C18.3358 11.4093 18.4707 11.4044 18.5895 11.351C18.7706 11.2638 18.9436 11.1607 19.1065 11.043C19.1227 11.0314 19.1406 11.0223 19.1595 11.016L19.1665 11.015C19.3018 11.0503 19.4355 11.0903 19.5675 11.135L20.2535 11.359C20.7795 11.532 21.1785 11.953 21.3195 12.473L21.6025 14.522C21.6585 14.925 21.4465 15.227 21.1425 15.299C20.8736 15.3625 20.6024 15.4159 20.3295 15.459C20.2646 15.4695 20.2024 15.4927 20.1465 15.5272C20.0906 15.5617 20.042 15.607 20.0036 15.6603C19.9652 15.7136 19.9376 15.7739 19.9225 15.8379C19.9074 15.9018 19.905 15.9681 19.9155 16.033C19.926 16.0979 19.9492 16.16 19.9837 16.216C20.0182 16.2719 20.0634 16.3204 20.1167 16.3589C20.17 16.3973 20.2304 16.4249 20.2943 16.44C20.3583 16.4551 20.4246 16.4575 20.4895 16.447C20.8308 16.3903 21.1255 16.332 21.3735 16.272C22.2685 16.059 22.7065 15.202 22.5935 14.385L22.3015 12.279L22.2955 12.252C22.186 11.8238 21.9699 11.4303 21.6674 11.1081C21.365 10.7858 20.9859 10.5453 20.5655 10.409L19.8805 10.184C19.7284 10.1343 19.574 10.0886 19.4195 10.047Z"
//                             fill="#7009BA"
//                           />
//                         </svg>
//                       </span>
//                       <span className="text-dark-blue text-box">Students</span>
//                       <span className="text-black text-box">
//                         {/* {studentCount === 0 ? (
//                         <LoadingSkeleton height="h-5" width="w-12" />
//                             ) : (
//                               <span className="text-black text-box">{studentCount}</span>
//                             )}  */}
//                         <span className="text-black text-box">
//                           {studentCount}
//                         </span>
//                       </span>
//                     </li>
//                     <li className="btn-white d-flex align-items-center gap-2 w-100">
//   <span className="icons">
//     <svg
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M15.4082 22.5H3.4082C3.01038 22.5 2.62885 22.342 2.34754 22.0607C2.06624 21.7794 1.9082 21.3978 1.9082 21V3C1.9082 2.60218 2.06624 2.22064 2.34754 1.93934C2.62885 1.65804 3.01038 1.5 3.4082 1.5H15.4082C15.806 1.5 16.1876 1.65804 16.4689 1.93934C16.7502 2.22064 16.9082 2.60218 16.9082 3V15.4635L13.1582 13.5885L9.4082 15.4635V3H3.4082V21H15.4082V18H16.9082V21C16.9076 21.3976 16.7494 21.7788 16.4682 22.06C16.187 22.3412 15.8058 22.4994 15.4082 22.5ZM13.1582 11.9115L15.4082 13.0365V3H10.9082V13.0365L13.1582 11.9115Z"
//         fill="#7009BA"
//       />
//     </svg>
//   </span>
//   <span className="text-dark-blue text-box">Course</span>
//   {/* ✅ Changed from actualCourses to courseDetails */}
//   <span className="text-black text-box">
//     {courseDetails.length}
//   </span>
// </li>
//                     <li className="btn-white d-flex align-items-center gap-2 w-100">
//                       <span className="icons">
//                         <svg
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             d="M12.0001 12V18M12.0001 12C15.8661 12 19.0001 8.883 19.0001 5.038C19.0001 4.938 18.9981 4.838 18.9941 4.738C18.9511 3.738 18.9301 3.238 18.2521 2.619C17.5741 2 16.8251 2 15.3241 2H8.67606C7.17606 2 6.42506 2 5.74806 2.62C5.07106 3.238 5.04906 3.738 5.00606 4.737C5.00206 4.837 5.00006 4.93733 5.00006 5.038C5.00006 8.883 8.13406 12 12.0001 12ZM12.0001 18C10.3261 18 8.87006 19.012 8.11806 20.505C7.75806 21.218 8.27406 22 8.95806 22H15.0411C15.7261 22 16.2411 21.218 15.8821 20.505C15.1301 19.012 13.6741 18 12.0001 18ZM5.00006 5H3.98506C2.99806 5 2.50506 5 2.20006 5.37C1.89506 5.741 1.98506 6.156 2.16406 6.986C2.50406 8.57 3.24506 9.963 4.24906 11M19.0001 5H20.0151C21.0021 5 21.4951 5 21.8001 5.37C22.1051 5.741 22.0151 6.156 21.8371 6.986C21.4951 8.57 20.7551 9.963 19.7501 11"
//                             stroke="#7009BA"
//                             strokeWidth="1.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       </span>
//                       <span className="text-dark-blue text-box">
//                         Upkraft Certified Tutor
//                       </span>
//                       <span className="text-black text-box">{}</span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="col-xxl-4 col-md-12 order-xxl-2 order-sm-2 order-md-3 mb-4">
//             <div className="details-student-box">
//               <div className="row">
//                 <div className="col-md-12 mb-3">
//                   <div className="card-box">
//                     {/* {studentCount === 0 ? (
//                     <>
//                       <LoadingSkeleton height="h-8" width="w-16" />
//                       <LoadingSkeleton height="h-4" width="w-32" />
//                     </>
//                   ) : (
//                     <>
//                       <h2 className="top-text">{studentCount}</h2>
//                       <p className="bottom-text">Total Active Students</p>
//                     </>
//                   )} */}
//                     {/* <span className="text-black text-box">{studentCount}</span> */}

//                     <h2 className="top-text">{studentCount}</h2>
//                     <p className="bottom-text">Total Active Students</p>
//                   </div>
//                 </div>
//                 <div className="col-md-12 mb-3">
//                   <div className="card-box">
//                     <h2 className="top-text">
//                       {assignmentCompletionPercentage}%
//                     </h2>
//                     <p className="bottom-text">Assignment Completion %</p>
//                   </div>
//                 </div>
//                 <div className="col-md-12 mb-3">
//                   <div className="card-box">
//                     <div className="d-flex flex-column align-items-left">
//                       <div className="stars-container mb-2 d-flex justify-content-left">
//                         {[...Array(5)].map((_, index) => (
//                           <span key={index} className="star-icon mx-1">
//                             <svg
//                               width="24"
//                               height="24"
//                               viewBox="0 0 24 24"
//                               fill={
//                                 index < Math.floor(averageCSATRating)
//                                   ? "#FFD700"
//                                   : "#E0E0E0"
//                               }
//                               xmlns="http://www.w3.org/2000/svg"
//                             >
//                               <path
//                                 d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
//                                 stroke={
//                                   index < Math.floor(averageCSATRating)
//                                     ? "#FFD700"
//                                     : "#E0E0E0"
//                                 }
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             </svg>
//                           </span>
//                         ))}
//                       </div>
//                       <h2 className="top-text">
//                         {averageCSATRating > 0
//                           ? `${averageCSATRating}/5.0`
//                           : "No ratings yet"}
//                       </h2>
//                       <p className="bottom-text">Tutor Rating</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="col-xxl-3 col-md-6 order-xxl-3 order-sm-3 order-md-2 mb-4">
//             <div className="refer-and-earn-sec">
//               <ReferAndEarn />
//             </div>
//           </div>
//         </div>
//         <div className="row">
//           <div className="col-xxl-6 col-md-12 mb-4">
// <UpcomingLessons 
//   classDetails={classData} 
//   userData={userData}
// />          </div>
//           <div className="col-xxl-3 col-md-6 mb-4">
//             <div className="card-box">
//               <div className="top-progress mb-4">
//                 <SemiCircleProgress
//                   value={averageCourseQuality}
//                   label="Class Quality Score"
//                 />
//               </div>
//               <div className="bottom-progress">
//                 <SemiCircleProgress
//                   value={overallPerformanceScore}
//                   label="Overall Performance Score"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="col-xxl-3 col-md-6 mb-4">
//             <div className="card-box">
//               {/* pendingFeedbackCount === 0 ?  */}
//               {/* // <div className="p-4">
//               //   <LoadingSkeleton height="h-8" width="w-24" />
//               //   <LoadingSkeleton height="h-4" width="w-full" />
//               // </div> */}
//               {/* ) :  */}
//               <FeedbackPending
//                 count={pendingFeedbackCount}
//                 loading={pendingFeedbackLoading}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
// src>app>tutor>page.tsx

// replace all code with this

"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "../components/tutor/Dashboard.css";
import ProfileProgress from "../components/tutor/ProfileProgress";
import "../components/tutor/ReferAndEarn.css";
import ReferAndEarn from "../components/tutor/ReferAndEarn";
import UpcomingLessons from "../components/tutor/UpcomingLessons";
import SemiCircleProgress from "../components/tutor/SemiCircleProgress";
import "../components/tutor/SemiCircleProgress.css";
import "../components/tutor/FeedbackPending.css";
import FeedbackPending from "../components/tutor/FeedbackPending";
// import { useUserData } from "../providers/UserData/page";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchDashboardData } from "@/store/slices/dashboardDataSlice";


// // Dynamically import VideoMeeting component with no SSR
// const VideoMeeting = dynamic(() => import("../components/VideoMeeting"), {
//   ssr: false,
// });

// interface UserData {
//   _id: string;
//   username: string;
//   email: string;
//   category: string;
//   age: number;
//   address: string;
//   contact: string;
//   courses: any[];
//   createdAt: string;
// }

interface ClassData {
  _id: string;
  title: string;
  course: string;
  instructor: string;
  description: string;
  startTime: string;
  endTime: string;
  recording: string | null;
  csat?: Array<{
    // Add this
    userId: string;
    rating: number;
    feedback: string;
  }>;
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

interface MeetingState {
  isActive: boolean;
  url: string | null;
  classId: string | null;
}
/**
 * Calculate average CSAT rating from class data
 * @param {Array} classData - Array of class objects with csat field
 * @returns {number} - Average rating rounded to 1 decimal place
 */
// Progress Box Components

const calculateAverageCSATRating = (classData: ClassData[]) => {
  if (!classData || classData.length === 0) {
    return 0;
  }

  let totalRating = 0;
  let totalRatingsCount = 0;

  // Iterate through each class
  classData.forEach((classItem) => {
    // Check if class has csat data
    if (
      classItem.csat &&
      Array.isArray(classItem.csat) &&
      classItem.csat.length > 0
    ) {
      // Calculate average rating for this specific class
      const classRatings = classItem.csat
        .map((csatEntry) => csatEntry.rating)
        .filter((rating) => rating != null && rating > 0); // Filter out null/undefined/0 ratings

      if (classRatings.length > 0) {
        const classAverageRating =
          classRatings.reduce((sum, rating) => sum + rating, 0) /
          classRatings.length;

        // Add to overall totals
        totalRating += classAverageRating;
        totalRatingsCount++;
      }
    }
  });
  if (totalRatingsCount === 0) {
    return 0;
  }

  const overallAverage = totalRating / totalRatingsCount;

  // Return rounded to 1 decimal place
  return Math.round(overallAverage * 10) / 10;
};
interface Assignment {
  status?: boolean | null;
}
export default function Dashboard() {
  const pathname = usePathname(); // Add this hook
  // const [userData, setUserData] = useState<UserData | null>(null);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData[]>([]);
  // const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [averageCSATRating, setAverageCSATRating] = useState(0);

  const [pendingFeedbackCount, setPendingFeedbackCount] = useState<number>(0);
  const [assignmentCompletionPercentage, setAssignmentCompletionPercentage] =
    useState<number>(0);
  const [overallPerformanceScore, setOverallPerformanceScore] =
    useState<number>(0);
  const [averageCourseQuality, setAverageCourseQuality] = useState<number>(0);
  const [pendingFeedbackLoading, setPendingFeedbackLoading] =
    useState<boolean>(true);
  // const [courseDetails, setCourseDetails] = useState<any[]>([]); // ✅ ADD this
  // const { userData, courseDetails, classDetails, studentCount, loading: contextLoading } = useUserData();
  const dispatch = useDispatch<AppDispatch>();

  const prevPathRef = useRef<string | null>(null);

  const { userData, courseDetails, classDetails, studentCount } =
    useSelector((state: RootState) => state.dashboard);


  // First load
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Silent refresh when coming to /tutor
  useEffect(() => {
    if (!pathname) return;

    if (
      prevPathRef.current !== null &&
      pathname === "/tutor" &&
      prevPathRef.current !== "/tutor"
    ) {
      dispatch(fetchDashboardData());
    }

    prevPathRef.current = pathname;
  }, [pathname, dispatch]);


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

  const fetchInProgress = useRef(false);

  useEffect(() => {
    const fetchEssentialData = async () => {
      try {
        if (fetchInProgress.current) {
          console.log("Fetch already in progress, skipping");
          return;
        }

        fetchInProgress.current = true;

        console.log("Phase 1: Loading essential data...");

        // ✅ FIXED: Only fetch assignment and performance (removed user fetch)
        const [assignmentResponse, test, perfResponse] = await Promise.allSettled([
          fetch("/Api/assignment"), // need to remove
          fetch("/Api/assignment/completion-percentage"),
          fetch("/Api/overallPerformanceScore"),
        ]);

        const assignmentResponseData =
          assignmentResponse.status === "fulfilled"
            ? await assignmentResponse.value.json()
            : null;

        const res = test.status === "fulfilled" && await test.value.json()

        console.log("res===>", res);
        // ✅ Handle performance response
        if (perfResponse.status === "fulfilled") {
          const perfData = await perfResponse.value.json();

          if (perfData.success) {
            setOverallPerformanceScore(perfData.overallScore);
            setAverageCourseQuality(perfData.averageCourseQuality);
          } else {
            setOverallPerformanceScore(0);
            setAverageCourseQuality(0);
          }
        } else {
          setOverallPerformanceScore(0);
          setAverageCourseQuality(0);
        }

        // ✅ Use data from context (userData, courseDetails, studentCount are already available)
        if (!userData) {
          setLoading(false);
          fetchInProgress.current = false;
          return;
        }
        const assignments: Assignment[] = assignmentResponseData?.data?.assignments ?? [];
        const pct = assignments.length
          ? Math.round(assignments.reduce((c, x) => c + (x.status ? 1 : 0), 0) * 100 / assignments.length)
          : 0;

        setAssignmentCompletionPercentage(pct);



        console.log("Phase 1 complete - showing page");
        setLoading(false);
        fetchInProgress.current = false;

        // ✅ PHASE 2: Only load pending feedback (non-critical)
        console.log("Phase 2: Loading pending feedback in background...");
        loadPendingFeedback();

      } catch (error) {
        console.error("Error fetching essential data:", error);
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    const loadPendingFeedback = async () => {
      try {
        const feedbackResponse = await fetch("/Api/dashboard/pendingFeedbackCount");
        const feedbackResponses = await fetch("/Api/pendingFeedback"); // need to remove

        if (!feedbackResponse.ok) {
          console.error("Feedback API error:", feedbackResponse.status);
          setPendingFeedbackCount(0);
          setPendingFeedbackLoading(false);
          return;
        }

        const feedbackData = await feedbackResponse.json();

        console.log("feedbackResponse", feedbackData);
        if (feedbackData.success) {
          setPendingFeedbackCount(feedbackData.count || 0);
          console.log("Pending feedback count:", feedbackData.count);
        } else {
          setPendingFeedbackCount(0);
        }
      } catch (error) {
        console.error("Error loading pending feedback:", error);
        setPendingFeedbackCount(0);
      } finally {
        setPendingFeedbackLoading(false);
      }
    };

    // ✅ Only fetch when userData is available from context
    if (userData) {
      fetchEssentialData();
    }
  }, [userData]); // ✅ Add dependency on userData from context
  useEffect(() => {
    if (classDetails && classDetails.length > 0) {
      setClassData(classDetails);
      // console.log("Class details set from context:", classDetails);
    }
  }, [classDetails]);

  useEffect(() => {
    if (classData && classData.length > 0) {
      const avgRating = calculateAverageCSATRating(classData);
      setAverageCSATRating(avgRating);
      console.log("Average CSAT Rating:", avgRating);
    }
  }, [classData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="container">
        <div className="row">
          <div className="col col-xxl-5 order-xxl-1 order-sm-1 col-md-6 order-md-1 mb-4">
            <div className="card-box profile-card">
              <h2 className="mb-4">Profile</h2>
              <div className="com-profile d-flex align-items-center flex-md-nowrap flex-wrap justify-content-center gap-2">
                <div className="col-img-profile">
                  <ProfileProgress user={userData ? userData : null} />
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
                        </svg>
                      </span>
                      <span className="text-dark-blue text-box">Students</span>
                      <span className="text-black text-box">
                        {/* {studentCount === 0 ? (
                        <LoadingSkeleton height="h-5" width="w-12" />
                            ) : (
                              <span className="text-black text-box">{studentCount}</span>
                            )}  */}
                        <span className="text-black text-box">
                          {studentCount}
                        </span>
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
                            d="M15.4082 22.5H3.4082C3.01038 22.5 2.62885 22.342 2.34754 22.0607C2.06624 21.7794 1.9082 21.3978 1.9082 21V3C1.9082 2.60218 2.06624 2.22064 2.34754 1.93934C2.62885 1.65804 3.01038 1.5 3.4082 1.5H15.4082C15.806 1.5 16.1876 1.65804 16.4689 1.93934C16.7502 2.22064 16.9082 2.60218 16.9082 3V15.4635L13.1582 13.5885L9.4082 15.4635V3H3.4082V21H15.4082V18H16.9082V21C16.9076 21.3976 16.7494 21.7788 16.4682 22.06C16.187 22.3412 15.8058 22.4994 15.4082 22.5ZM13.1582 11.9115L15.4082 13.0365V3H10.9082V13.0365L13.1582 11.9115Z"
                            fill="#7009BA"
                          />
                        </svg>
                      </span>
                      <span className="text-dark-blue text-box">Course</span>
                      {/* ✅ Changed from actualCourses to courseDetails */}
                      <span className="text-black text-box">
                        {courseDetails.length}
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
                      <span className="text-dark-blue text-box">
                        Upkraft Certified Tutor
                      </span>
                      <span className="text-black text-box">{ }</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-4 col-md-12 order-xxl-2 order-sm-2 order-md-3 mb-4">
            <div className="details-student-box">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <div className="card-box">
                    <h2 className="top-text">{studentCount}</h2>
                    <p className="bottom-text">Total Active Students</p>
                  </div>
                </div>
                <div className="col-md-12 mb-3">
                  <div className="card-box">
                    <h2 className="top-text">
                      {assignmentCompletionPercentage}%
                    </h2>
                    <p className="bottom-text">Assignment Completion %</p>
                  </div>
                </div>
                <div className="col-md-12 mb-3">
                  <div className="card-box">
                    <div className="d-flex flex-column align-items-left">
                      <div className="stars-container mb-2 d-flex justify-content-left">
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className="star-icon mx-1">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill={
                                index < Math.floor(averageCSATRating)
                                  ? "#FFD700"
                                  : "#E0E0E0"
                              }
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                stroke={
                                  index < Math.floor(averageCSATRating)
                                    ? "#FFD700"
                                    : "#E0E0E0"
                                }
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ))}
                      </div>
                     <h2 className="top-text">
  {averageCSATRating > 0
    ? `${averageCSATRating}/5.0`
    : "No ratings yet"}
</h2>
                      <p className="bottom-text">Tutor Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-md-6 order-xxl-3 order-sm-3 order-md-2 mb-4">
            <div className="refer-and-earn-sec">
              <ReferAndEarn />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xxl-6 col-md-12 mb-4">
            <UpcomingLessons
              classDetails={classData}
              userData={userData}
            />
          </div>
          <div className="col-xxl-3 col-md-6 mb-4">
            <div className="card-box">
              <div className="top-progress mb-4">
                <SemiCircleProgress
                  value={averageCourseQuality}
                  label="Class Quality Score"
                />
              </div>
              <div className="bottom-progress">
                <SemiCircleProgress
                  value={overallPerformanceScore}
                  label="Overall Performance Score"
                />
              </div>
            </div>
          </div>
          <div className="col-xxl-3 col-md-6 mb-4">
            <div className="card-box">
              <FeedbackPending
                count={pendingFeedbackCount}
                loading={pendingFeedbackLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}