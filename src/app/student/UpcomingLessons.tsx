"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ClassData {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  instructorId?: string; // added to use tutor lookup
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
}

const UpcomingLessons = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tutorData, setTutorData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // replaced studentsMap with tutorsMap: maps classId -> tutor name (or null)
  const [tutorsMap, setTutorsMap] = useState<{ [key: string]: string | null }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const userResponse = await fetch("/Api/users/user");
        const userResponseData = await userResponse.json();

        // Save user data
        if (userResponseData.user) {
          setUserData(userResponseData.user);
        }

        if (userResponseData.classDetails && userResponseData.classDetails.length > 0) {
          const now = new Date();
          const futureClasses = userResponseData.classDetails
            .filter((cls: ClassData) => new Date(cls.startTime) > now)
            .sort(
              (a: ClassData, b: ClassData) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
            );

          setClasses(futureClasses);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load upcoming lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      const map: { [key: string]: string | null } = {};
      for (let cls of classes) {
        const instructorId = cls.instructorId || (cls as any).instructor;
        if (!instructorId) {
          map[cls._id] = null;
          continue;
        }
        try {
          const res = await fetch(`/Api/tutorInfoForStudent?tutorId=${encodeURIComponent(instructorId)}`);
          const data = await res.json();
          // Use tutor.username from API response
          const name = data?.tutor?.username?.trim() || null;
          map[cls._id] = name;
        } catch (err) {
          console.error("Error fetching tutor for class", cls._id, err);
          map[cls._id] = null;
        }
      }
      setTutorsMap(map);
    };

    if (classes.length > 0) fetchTutors();
  }, [classes]);


  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMM");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Use UTC methods to get EXACT stored time (same as CourseDetailsPage)
      const startHours = start.getUTCHours();
      const startMinutes = start.getUTCMinutes();
      const endHours = end.getUTCHours();
      const endMinutes = end.getUTCMinutes();

      // Format manually
      const formatTimeString = (hours: number, minutes: number) => {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert to 12-hour format
        const displayMinutes = String(minutes).padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${period}`;
      };

      return `${formatTimeString(startHours, startMinutes)} - ${formatTimeString(endHours, endMinutes)}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  const handleJoinMeeting = async (classId: string) => {
    try {
      if (!userData) {
        toast.error("User data not available. Please refresh the page.");
        return;
      }

      console.log("[Meeting] Creating meeting for class:", classId);
      const response = await fetch('/Api/meeting/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: classId,
          userId: userData._id,
          userRole: userData.category
        }),
      });

      const data = await response.json();
      console.log("[Meeting] Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      router.push(`/student/video-call?url=${encodeURIComponent(data.url)}&userRole=${userData.category}&token=${encodeURIComponent(data.token || '')}`);
    } catch (error: any) {
      console.error('[Meeting] Error details:', error);
      toast.error(error.message || 'Failed to create meeting. Please try again.');
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
        <h2 className="!text-[20px]">Upcoming Sessions</h2>
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
                  <td>{formatTime(classItem.startTime, classItem.endTime)}</td>
                  <th>{classItem.title}</th>
                  <td>
                    {tutorsMap[classItem._id]
                      ? tutorsMap[classItem._id]
                      : "No tutor assigned"}
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

