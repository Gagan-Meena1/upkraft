"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserData } from "../providers/UserData/page"; // ✅ Add this import
import {
  formatInTz,
  formatTimeRangeInTz,
  getUserTimeZone,
} from "@/helper/time";

interface ClassData {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  instructorId?: string;
  students?: Array<{
    _id: string;
    username: string;
  }>;
}

const UpcomingLessons = () => {
  // ✅ REPLACE the state and API call with context hook
  const { userData, classDetails, loading: contextLoading } = useUserData();
  
  // ❌ REMOVE these lines:
  // const [userData, setUserData] = useState<UserData | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tutorsMap, setTutorsMap] = useState<{ [key: string]: string | null }>({});
  const router = useRouter();
  const userTz = userData?.timezone || getUserTimeZone();
  const [loadingTutors, setLoadingTutors] = useState(false);


  // ✅ REPLACE the first useEffect with this simpler version
  useEffect(() => {
    if (!contextLoading && classDetails) {
      try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const futureClasses = classDetails
          .filter((cls: ClassData) => new Date(cls.startTime) > twentyFourHoursAgo)
          .sort(
            (a: ClassData, b: ClassData) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
        .slice(0, 10); // ✅ ADD THIS LINE - Limit to 10 classes

        setClasses(futureClasses);
      } catch (err) {
        console.error("Error processing classes:", err);
        setError("Failed to load upcoming lessons");
      }
    }
  }, [contextLoading, classDetails]);



// 3️⃣ REPLACE the entire tutor fetching useEffect with this:
useEffect(() => {
  const fetchTutorNames = async () => {
    if (classes.length === 0) return;

    setLoadingTutors(true);
    try {
      const classIds = classes.map((cls) => cls._id);

      const response = await fetch("/Api/academy/tutors/names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tutor names");
      }

      const data = await response.json();
      
      if (data.success && data.tutorNames) {
        setTutorsMap(data.tutorNames);
      }
    } catch (err) {
      console.error("Error fetching tutor names:", err);
      // Set all to null on error
      const fallbackMap: { [key: string]: string | null } = {};
      classes.forEach((cls) => {
        fallbackMap[cls._id] = null;
      });
      setTutorsMap(fallbackMap);
    } finally {
      setLoadingTutors(false);
    }
  };

  fetchTutorNames();
}, [classes]);

  const formatDate = (dateString: string) => {
    try {
      return formatInTz(dateString, userTz, { day: "numeric", month: "short" });
    } catch {
      return "Invalid date";
    }
  };

  const handleJoinMeeting = async (classId: string) => {
    try {
      if (!userData) {
        toast.error("User data not available. Please refresh the page.");
        return;
      }

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

      window.open(
        `/student/video-call?url=${encodeURIComponent(data.url)}&userRole=${
          userData.category
        }&token=${encodeURIComponent(data.token || "")}`,
        '_blank'
      );
    } catch (error: any) {
      console.error("[Meeting] Error details:", error);
      toast.error(
        error.message || "Failed to create meeting. Please try again."
      );
    }
  };

  // ✅ Use contextLoading instead of loading
  if (contextLoading) {
    return (
      <div className="card-box table-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
          <h2>Upcoming Sessions</h2>
        </div>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-box table-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
          <h2>Upcoming Sessions</h2>
        </div>
        <div className="text-center py-4 text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="card-box table-sec">
      <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
        <div className="flex gap-2 items-center">
          <h2 className="!text-[20px] !mb-0">Upcoming Sessions</h2>
          <span className="!text-sm text-gray-500">
            (Timezone: {userData?.timezone || 'Loading...'})
          </span>
        </div>
        <Link href="/student/calendar" className="btn-text">
          View All
        </Link>
      </div>
      <div className="table-responsive">
        <table className="table align-middle m-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Course</th>
              <th>Tutor Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-3">
                  No upcoming lessons
                </td>
              </tr>
            ) : (
              classes.slice(0, 8).map((classItem) => (
                <tr key={classItem._id}>
                  <th>{formatDate(classItem.startTime)}</th>
                  <td>
                    <div className="text-xs flex flex-col gap-2 text-gray-600">
                      <span>
                        {formatTimeRangeInTz(
                          classItem.startTime,
                          classItem.endTime,
                          userTz
                        )}
                      </span>
                    </div>
                  </td>
                  <th>{classItem.title}</th>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
  {loadingTutors ? (
    <span className="text-gray-400">Loading...</span>
  ) : tutorsMap[classItem._id] ? (
    tutorsMap[classItem._id]
  ) : (
    <span className="text-gray-400">No tutor assigned</span>
  )}
</td>
                  <td>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
  <button
    onClick={() => handleJoinMeeting(classItem._id)}
    className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors w-full sm:w-auto"
  >
    Join Class
  </button>
  {classItem.googleMeetUrl && (
    <a
      href={classItem.googleMeetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto text-center"
      style={{ marginTop: "4px" }}
    >
      Google Meet
    </a>
  )}
</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingLessons;