"use client";
import React, { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import {
  Book,
  Clock,
  IndianRupee,
  List,
  MessageCircle,
  Trash2,
  ChevronLeft,
  BarChart3,
  Pencil,
  Edit,
  Eye,
  Copy,
  UserPlus,
  User,
  ArrowLeft,
  Users,
} from "lucide-react";

import Student01 from "../../assets/student-01.png";
import Link from "next/link";
import Pagination from "react-bootstrap/Pagination";
import "./MyCourse.css";
import EditCourseModal from "./EditCourseModal";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: string | number;
    topic: string;
    tangibleOutcome: string;
  }[];
  category?: string;
  createdAt?: string;
  class?: any[];
  students?: any[];
  tutors?: any[];
  subCategory?: string;
  maxStudentCount?: number;
  tag?: string;

}

interface MyCourseProps {
  data: Course[];
  academyId: string | null;
  category: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface CourseUser {
  _id: string;
  username: string;
  category: string;
  email: string;
  profileImage: string;
}

const MyCourse = ({ 
  data, 
  academyId, 
  category, 
  currentPage, 
  setCurrentPage, 
  totalPages,
  searchQuery,
  setSearchQuery
}: MyCourseProps) => {
  console.log("MyCourse received props:", { data, academyId, category });

  const [courses, setCourses] = useState<Course[]>(data || []);
  const [studentNameMap, setStudentNameMap] = useState<Record<string, string>>({});
  // Map for resolving tutorId -> username
  const [tutorNameMap, setTutorNameMap] = useState<Record<string, string>>({});
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [copyingCourseId, setCopyingCourseId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update local courses when data prop changes
  useEffect(() => {
    setCourses(data || []);
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ids = new Set<string>();
        courses.forEach((c) => {
          const ai = (c as any).academyInstructorId || [];
          if (Array.isArray(ai)) {
            ai.forEach((a: any) => {
              if (!a) return;
              const id = typeof a === "string" ? a : String(a._id || a);
              ids.add(id);
            });
          }
          const inst = (c as any).instructorId;
          if (inst) {
            const idStr = typeof inst === "string" ? inst : String(inst._id || inst);
            ids.add(idStr);
          }
        });

        if (ids.size === 0) return;

        const entries = await Promise.all(
          Array.from(ids).map(async (id) => {
            try {
              const res = await fetch(`/Api/tutorInfoForStudent?tutorId=${id}`);
              if (!res.ok) return null;
              const data = await res.json();
              const user = data?.tutor;
              const category = (user?.category || "").toString().toLowerCase();
              if (category !== "tutor") return null;
              const name = user?.username || user?.name || user?.email || "Tutor";
              return [id, name] as [string, string];
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;
        const map: Record<string, string> = {};
        entries.forEach((p) => {
          if (p) map[p[0]] = p[1];
        });
        setTutorNameMap((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error("Tutor resolver error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery, setCurrentPage]);

  // Auto-focus search input when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  console.log("category in MyCourse:", category);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      // Restore focus to search input after pagination
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleEditCourse = (course: Course) => {
    const fixedCourse = {
      ...course,
      curriculum: course.curriculum.map((item) => ({
        ...item,
        sessionNo:
          typeof item.sessionNo === "string"
            ? Number(item.sessionNo)
            : item.sessionNo,
      })),
    };
    setSelectedCourse(fixedCourse);
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    setUpdatingCourseId(updatedCourse._id);
    toast.loading("Updating course...", { id: "update-course" });
    try {
      const response = await fetch(`/Api/tutors/courses/${updatedCourse._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course");
      }
      const data = await response.json();
      setCourses((prev) =>
        prev.map((course) =>
          course._id === updatedCourse._id
            ? { ...course, ...updatedCourse }
            : course
        )
      );
      toast.success(data.message || "Course updated successfully!", {
        id: "update-course",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update course", {
        id: "update-course",
      });
    } finally {
      setShowEditModal(false);
      setUpdatingCourseId(null);
      // Restore focus after modal closes
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleCopyCourse = async (course: Course) => {
    if (
      !confirm(`Are you sure you want to create a copy of "${course.title}"?`)
    ) {
      // Restore focus if user cancels
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      return;
    }

    try {
      setCopyingCourseId(course._id);

      const courseDataToCopy = {
        title: `(Copy) ${course.title} `,
        description: course.description,
        duration: course.duration,
        price: course.price,
        curriculum: course.curriculum,
        category: course.category || "",
        tag: course.tag || "",
      };

      const response = await fetch("/Api/dublicateCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseDataToCopy),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to copy course");
      }

      const data = await response.json();

      if (data.course) {
        toast.success("Course copied successfully!");
        setCourses((prevCourses) => [...prevCourses, data.course]);
      } else {
        toast.success("Course copied successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error copying course:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to copy course"
      );
    } finally {
      setCopyingCourseId(null);
      // Restore focus
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      return;
    }

    try {
      setDeletingCourseId(courseId);

      const response = await fetch(`/Api/tutors/courses?courseId=${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Course deleted successfully");
        setCourses((prevCourses) =>
          prevCourses.filter((course) => course._id !== courseId)
        );
      } else {
        throw new Error(data.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      );
    } finally {
      setDeletingCourseId(null);
      // Restore focus
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="card-box">
      {category == "Tutor" && (
        <Link
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          href="/tutor"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      )}
      <Toaster />
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head d-flex align-items-center gap-2">
            <Link href={category === "Academic" ? "/academy" : "/tutor"} className='link-text back-btn'>
              <ChevronLeft />
            </Link>
            <h2 className="m-0">My Courses</h2>
          </div>
          <div className="right-form">
            <Form>
              <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
                <div className="search-box">
                  <Form.Group className="position-relative mb-0">
                    <Form.Label className="d-none">search</Form.Label>
                    <Form.Control
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search here"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      type="button"
                      className="border-0 bg-transparent p-0 m-0 position-absolute"
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
                    </Button>
                  </Form.Group>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>Monthly</option>
                    <option value="1">Monthly</option>
                    <option value="2">HalfYearly</option>
                    <option value="3">Yearly</option>
                  </Form.Select>
                </div>
                {!academyId && category !== "Academic" && (
                  <Link
                    href="/tutor/create-course"
                    role="button"
                    className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
                  >
                    <span>Add Course </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.9997 8.66536H8.66634V11.9987C8.66634 12.1755 8.5961 12.3451 8.47108 12.4701C8.34605 12.5951 8.17649 12.6654 7.99967 12.6654C7.82286 12.6654 7.65329 12.5951 7.52827 12.4701C7.40325 12.3451 7.33301 12.1755 7.33301 11.9987V8.66536H3.99967C3.82286 8.66536 3.65329 8.59513 3.52827 8.4701C3.40325 8.34508 3.33301 8.17551 3.33301 7.9987C3.33301 7.82189 3.40325 7.65232 3.52827 7.52729C3.65329 7.40227 3.82286 7.33203 3.99967 7.33203H7.33301V3.9987C7.33301 3.82189 7.40325 3.65232 7.52827 3.52729C7.65329 3.40227 7.82286 3.33203 7.99967 3.33203C8.17649 3.33203 8.34605 3.40227 8.47108 3.52729C8.5961 3.65232 8.66634 3.82189 8.66634 3.9987V7.33203H11.9997C12.1765 7.33203 12.3461 7.40227 12.4711 7.52729C12.5961 7.65232 12.6663 7.82189 12.6663 7.9987C12.6663 8.17551 12.5961 8.34508 12.4711 8.4701C12.3461 8.59513 12.1765 8.66536 11.9997 8.66536Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                )}
                {category === "Academic" && (
                  <Link
                    href="/academy/create-course"
                    role="button"
                    className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
                  >
                    <span>Add Course </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.9997 8.66536H8.66634V11.9987C8.66634 12.1755 8.5961 12.3451 8.47108 12.4701C8.34605 12.5951 8.17649 12.6654 7.99967 12.6654C7.82286 12.6654 7.65329 12.5951 7.52827 12.4701C7.40325 12.3451 7.33301 12.1755 7.33301 11.9987V8.66536H3.99967C3.82286 8.66536 3.65329 8.59513 3.52827 8.4701C3.40325 8.34508 3.33301 8.17551 3.33301 7.9987C3.33301 7.82189 3.40325 7.65232 3.52827 7.52729C3.65329 7.40227 3.82286 7.33203 3.99967 7.33203H7.33301V3.9987C7.33301 3.82189 7.40325 3.65232 7.52827 3.52729C7.65329 3.40227 7.82286 3.33203 7.99967 3.33203C8.17649 3.33203 8.34605 3.40227 8.47108 3.52729C8.5961 3.65232 8.66634 3.82189 8.66634 3.9987V7.33203H11.9997C12.1765 7.33203 12.3461 7.40227 12.4711 7.52729C12.5961 7.65232 12.6663 7.82189 12.6663 7.9987C12.6663 8.17551 12.5961 8.34508 12.4711 8.4701C12.3461 8.59513 12.1765 8.66536 11.9997 8.66536Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </Form>
          </div>
        </div>
        <hr className="hr-light" />

        {/* Course List */}
        {courses.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No courses found</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="assignments-list-box">
              <div className="w-100">
                {/* <div className="d-flex align-items-center justify-content-between mb-1">
                  <h5 className="mb-0">{course.title}</h5>
                  {course.tag && (
                    <span className="badge bg-light text-primary border border-primary ms-2">
                      {course.tag}
                    </span>
                  )}
                </div> */}
                <div className="d-flex align-items-center justify-content-left mb-3 flex-wrap gap-3">
                  {/* Course title + students-on-hover */}
                  <div className="relative d-inline-block">
                    <h3 className="mb-0 cursor-pointer">{course.title}</h3>

                    {/* Hover popup: tutors only */}
                    <div className="d-none position-absolute bg-white border rounded shadow-sm p-2 mt-2"
                         style={{ minWidth: 220 }}
                    >
                      <div className="d-flex flex-wrap gap-2">
                        {(() => {
                          // Tutor IDs from instructorId / academyInstructorId
                          const tutorsList: string[] = [];
                          const studentIdsSet = new Set<string>(
                            ((course as any).students || []).map((s: any) =>
                              typeof s === "string" ? s : String(s._id || s)
                            )
                          );

                          const ai = (course as any).academyInstructorId || [];
                          if (Array.isArray(ai) && ai.length > 0) {
                            ai.forEach((a: any) => {
                              if (!a) return;
                              const id = typeof a === "string" ? a : String(a._id || a);
                              if (!studentIdsSet.has(id) && !tutorsList.includes(id)) {
                                tutorsList.push(id);
                              }
                            });
                          }

                          const inst = (course as any).instructorId;
                          if (inst) {
                            const idStr = typeof inst === "string" ? inst : String(inst._id || inst);
                            if (!studentIdsSet.has(idStr) && !tutorsList.includes(idStr)) {
                              tutorsList.unshift(idStr);
                            }
                          }

                          if (tutorsList.length === 0) {
                            return <div className="text-sm text-muted">No tutors assigned</div>;
                          }

                          // Render tutor names only
                          return tutorsList.slice(0, 8).map((tId) => {
                            const name = (tutorNameMap && tutorNameMap[tId]) || "Tutor";
                            return (
                              <div
                                key={tId}
                                className="bg-white border rounded px-2 py-1 text-sm text-gray-700"
                              >
                                {name}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <style jsx>{`
                      .relative:hover div[position] { display: none; }
                      .relative:hover .position-absolute { display: block !important; }
                    `}</style>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {category === "Academic" && (
                      <>
                        <Link
                          href={`/academy/assignCourseToStudent?courseId=${course._id}`}
                          className="btn btn-border !py-2 !px-3 d-flex align-items-center justify-content-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Assign Students</span>
                        </Link>
                        <Link
                          href={`/academy/assignCourseToTutor?courseId=${course._id}`}
                          className="btn btn-border !py-2 !px-3 d-flex align-items-center justify-content-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Assign Tutor</span>
                        </Link>
                      </>
                    )}
                    {course.tag && (
                      <span className="badge bg-light text-primary border border-primary ms-2 d-inline-flex align-items-center gap-2">
                        {/* tag icon (left) */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                          <path d="M20 10V6a2 2 0 0 0-2-2h-4" stroke="#6E09BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 14v4a2 2 0 0 0 2 2h4l8-8-6-6L4 14z" stroke="#6E09BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-sm">{course.tag}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between">
                <div className="left-assignment d-flex align-items-center gap-xl-4 gap-2 flex-wrap">
                  <ul className="d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0">
                    <li className="d-flex align-items-center gap-2">
                      <span className="student-text">Started From :</span>
                      <span className="student-txt">
                        <strong>
                          {course.createdAt
                            ? new Date(course.createdAt).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <span className="student-text">Duration :</span>
                      <span className="student-txt">
                        <strong>{course.duration}</strong>
                      </span>
                    </li>
                    {!academyId && (
                      <li className="d-flex align-items-center gap-2">
                        <span className="student-text">Fees :</span>
                        <span className="student-txt">
                          <strong>Rs {course.price}</strong>
                        </span>
                      </li>
                    )}
                    <li className="d-flex align-items-center gap-2">
                      <span className="student-text">Lessons :</span>
                      <span className="student-txt">
                        <strong>
                          <span className="text-gray-700">
                            {course.curriculum.length} Lessons
                          </span>
                        </strong>
                      </span>
                    </li>
                    
                  </ul>
                </div>
                <div className="right-assignment my-course-student-right mt-xxl-0 mt-3">
                  <div className="student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2">
                    <ul className="d-flex align-items-center gap-2 list-unstyled m-0 p-0 action-icons-container">
                      <li className="d-flex align-items-center gap-2">
                        <span className="student-text d-flex align-items-center gap-2">
                          <Users className="h-5 w-5 text-gray-700" />
                          <strong className="text-gray-700">
                            {/* show assigned student count */}
                            {(course.students && course.students.length) }
                          </strong>
                        </span>
                      </li>
                      <li>
                        <Button
                          type="button"
                          onClick={() => handleEditCourse(course)}
                          className="!bg-transparent !border-0 !p-0"
                          disabled={updatingCourseId === course._id}
                        >
                          {updatingCourseId === course._id ? (
                            <span className="spinner-border spinner-border-sm text-primary" />
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.50195 21H21.502"
                                stroke="#1E88E5"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z"
                                stroke="#1E88E5"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </Button>
                      </li>
                      <li>
                        <Button
                          onClick={() => handleCopyCourse(course)}
                          disabled={copyingCourseId === course._id}
                          className="hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed !bg-transparent !border-0 !p-0"
                          title="Copy course"
                        >
                          {copyingCourseId === course._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                          ) : (
                            <Copy className="text-gray-600 hover:text-orange-500 h-5 w-5" />
                          )}
                        </Button>
                      </li>
                    </ul>
                    <ul className="d-flex align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0">
                      <li>
                        <Link
                          href={`/tutor/courseQuality?courseId=${course._id}`}
                          className="btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>Class Quality</span>
                          <svg
                            width="23"
                            height="24"
                            viewBox="0 0 23 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z"
                              fill="#6E09BD"
                            />
                          </svg>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={
                            category === "Academic"
                              ? `/academy/courses/${course._id}`
                              : `/tutor/courses/${course._id}`
                          }
                          className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>View Detail</span>
                          <svg
                            width="23"
                            height="24"
                            viewBox="0 0 23 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z"
                              fill="white"
                            />
                          </svg>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            />

            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() =>
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
      <EditCourseModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        course={selectedCourse}
        onUpdate={handleUpdateCourse}
      />
    </div>
  );
};

export default MyCourse;