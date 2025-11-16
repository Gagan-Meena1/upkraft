"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
  students?: Array<{
    _id: string;
    username: string;
  }>;
}

interface UserData {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  category: string;
  timezone?: string; // added timezone
}

interface UpcomingLessonsProps {
  classDetails: ClassData[];
  userData: UserData | null;
}

const UpcomingLessons = ({ classDetails, userData }: UpcomingLessonsProps) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [studentsMap, setStudentsMap] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userTz = userData?.timezone || getUserTimeZone();

  useEffect(() => {
    // ✅ No API call needed - use props directly
    if (classDetails && classDetails.length > 0) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const futureClasses = classDetails
        .filter((cls: ClassData) => new Date(cls.startTime) > twentyFourHoursAgo)
        .sort(
          (a: ClassData, b: ClassData) =>
            new Date(a.startTime).getTime() -
            new Date(b.startTime).getTime()
        );

      setClasses(futureClasses);
    } else {
      setClasses([]);
    }
  }, [classDetails]); // ✅ Re-run when props change

  useEffect(() => {
    const fetchStudents = async () => {
      const map: { [key: string]: any[] } = {};
      for (let cls of classes) {
        try {
          const res = await fetch(`/Api/classes/${cls._id}/students`);
          const data = await res.json();
          map[cls._id] = data.students || [];
        } catch (err) {
          console.error("Error fetching students for class", cls._id, err);
          map[cls._id] = [];
        }
      }
      setStudentsMap(map);
    };

    if (classes.length > 0) fetchStudents();
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
        `/tutor/video-call?url=${encodeURIComponent(data.url)}&userRole=${
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

  if (loading) {
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
            (Timezone: {userData?.timezone || getUserTimeZone()})
          </span>
        </div>
        <Link href="/tutor/calendar" className="btn-text">
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
              <th>Student Name</th>
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
                  <td>
                    {studentsMap[classItem._id] &&
                    studentsMap[classItem._id].length > 0 ? (
                      <span
                        title={studentsMap[classItem._id]
                          .map((s) => s.username)
                          .join(", ")}
                      >
                        {studentsMap[classItem._id]
                          .slice(0, 2)
                          .map((s) => s.username)
                          .join(", ")}
                        {studentsMap[classItem._id].length > 2 ? "..." : ""}
                      </span>
                    ) : (
                      "No students assigned"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleJoinMeeting(classItem._id)}
                      className="bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Join
                    </button>
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
