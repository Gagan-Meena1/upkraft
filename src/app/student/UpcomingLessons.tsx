"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserData } from "../providers/UserData/page"; // ✅ Add this import
import {
  formatInTz,
  formatTimeRangeInTz,
  getUserTimeZone,
} from "@/helper/time";
import UpcomingSessionsTable, { type UpcomingSessionRow } from "../components/UpcomingSessionsTable";

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
  const { userData, classDetails, loading: contextLoading } = useUserData();
  
  // const [userData, setUserData] = useState<UserData | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tutorsMap, setTutorsMap] = useState<{ [key: string]: string | null }>({});
  const router = useRouter();
  const userTz = userData?.timezone || getUserTimeZone();
  const [loadingTutors, setLoadingTutors] = useState(false);


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
        .slice(0, 10); 

        setClasses(futureClasses);
      } catch (err) {
        console.error("Error processing classes:", err);
        setError("Failed to load upcoming lessons");
      }
    }
  }, [contextLoading, classDetails]);



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

  const rows: UpcomingSessionRow[] = classes.slice(0, 8).map((classItem) => ({
    id: classItem._id,
    date: formatDate(classItem.startTime),
    time: formatTimeRangeInTz(classItem.startTime, classItem.endTime, userTz),
    course: classItem.title,
    secondary: (
      <span className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {loadingTutors ? (
          <span className="text-gray-400">Loading...</span>
        ) : tutorsMap[classItem._id] ? (
          tutorsMap[classItem._id]
        ) : (
          <span className="text-gray-400">No tutor assigned</span>
        )}
      </span>
    ),
    onJoin: () => handleJoinMeeting(classItem._id),
  }));

  return (
    <UpcomingSessionsTable
      title="Upcoming Sessions"
      timezone={userData?.timezone || "Loading..."}
      viewAllHref="/student/calendar"
      secondaryHeader="Tutor Name"
      rows={rows}
      isLoading={contextLoading}
      error={error}
      emptyMessage="No upcoming lessons"
      joinLabel="Join"
    />
  );
};

export default UpcomingLessons;