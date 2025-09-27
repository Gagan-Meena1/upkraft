"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

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

const UpcomingLessons = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Fetch user data to get the classes
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();

        if (userData.classDetails && userData.classDetails.length > 0) {
          // Filter future classes
          const now = new Date();
          const futureClasses = userData.classDetails
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
      return `${format(start, "h:mm")} - ${format(end, "h:mm a")}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  if (loading) {
    return (
      <div className="card-box table-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
          <h2>Upcoming Lessons</h2>
        </div>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-box table-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
          <h2>Upcoming Lessons</h2>
        </div>
        <div className="text-center py-4 text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="card-box table-sec">
      <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
        <h2>Upcoming Lessons</h2>
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
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-3">
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
                    {classItem.students && classItem.students.length > 0
                      ? classItem.students
                          .map((student) => student.username)
                          .join(", ")
                      : "No students assigned"}
                    <button
                      className="btn btn-link p-0 ms-1"
                      onClick={() => handleJoinMeeting(classItem._id)}
                      style={{ marginLeft: "5px" }}
                      // disabled={!userData}
                    >
                    

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
