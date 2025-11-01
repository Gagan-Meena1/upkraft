"use client";

import React, { useState, useEffect } from "react";
import { Book, Clock, IndianRupee, List } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import CourseCard from "@/app/components/courseCard";
import DashboardLayout from "@/app/components/DashboardLayout";
import "@/app/components/MyCourse.css";

// Define the Course interface based on your mongoose schema
interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/Api/users/user");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user data: ${await response.text()}`
          );
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/Api/users/user");

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }

        const data = await response.json();
        console.log("Courses data:", data);

        setCourses(data.courseDetails);
        console.log("data.courseDetails : ", data.courseDetails);

        setIsLoading(false);
      } catch (err) {
        console.error("Detailed error fetching courses:", err);
        setError(err instanceof Error ? err.message : "Unable to load courses");
        toast.error("Failed to load courses");
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const viewPerformanceRoutes = {
    Music: "/student/performance/viewPerformance",
    Dance: "/student/performance/viewPerformance/dance",
    Drawing: "/student/performance/viewPerformance/drawing",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-2xl font-light text-gray-800 animate-pulse">
          Loading courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-50 p-8 rounded-xl text-center shadow-md">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  const coursesContent = (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-600 !text-[20px]">My Courses</h1>
      </div>

      <Toaster />

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <h2 className="text-2xl text-gray-800 mb-4">No Courses Available</h2>
        </div>
      ) : (
        <div className="flex flex-col">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              userData={userData}
              viewPerformanceRoutes={viewPerformanceRoutes}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">{coursesContent}</div>
      </div>
    </DashboardLayout>
  );
}
