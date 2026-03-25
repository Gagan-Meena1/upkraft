"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import CourseCard from "@/app/components/courseCard";
import DashboardLayout from "@/app/components/DashboardLayout";
import "@/app/components/MyCourse.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setStudentCourses } from "@/store/slices/studentCoursesSlice";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";

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
  createdAt?: string;
}

const PAGE_LENGTH = 10;

export default function TutorCoursesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const coursesFromStore = useSelector(
    (state: RootState) => state.studentCourses.courses
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startedFromDate, setStartedFromDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
        if (Array.isArray(coursesFromStore) && coursesFromStore.length > 0) {
          setCourses(coursesFromStore as Course[]);
          setIsLoading(false);
          return;
        }

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
  dispatch(setStudentCourses({ courseDetails: data.courseDetails }));
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
  }, [coursesFromStore, dispatch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (
        searchQuery &&
        !course.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCourses.length / PAGE_LENGTH));
  }, [filteredCourses.length]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_LENGTH;
    return filteredCourses.slice(start, start + PAGE_LENGTH);
  }, [filteredCourses, currentPage]);

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
      <Link
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        href="/student"
      >
        <ArrowLeft size={20} />
        Back
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-600 !text-[20px]">
          My Courses
        </h1>
      </div>

      {/* Filter: search (styled similar to tutor My Courses) */}
      <div className="mb-4">
        <Form>
          <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
            {/* Search box */}
            <div className="search-box" style={{ maxWidth: 260, width: "100%" }}>
              <Form.Group className="position-relative mb-0">
                <Form.Label className="d-none">search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 m-0 position-absolute"
                  style={{ right: 10, top: "50%", transform: "translateY(-50%)" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.4995 17.5L13.8828 13.8833"
                      stroke="#505050"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                      stroke="#505050"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Form.Group>
            </div>
          </div>
        </Form>
      </div>

      <Toaster />

      {courses.length === 0 && !searchQuery ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <h2 className="text-2xl text-gray-800 mb-4">No Courses Available</h2>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
          <h2 className="text-2xl text-gray-800 mb-2">No matching courses</h2>
          <p className="text-sm text-gray-600">
            Try changing your search.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                userData={userData}
                viewPerformanceRoutes={viewPerformanceRoutes}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={currentPage === idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      <div className="p-0 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">{coursesContent}</div>
      </div>
    </DashboardLayout>
  );
}
