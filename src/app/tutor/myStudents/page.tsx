"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { Form } from "react-bootstrap";
import CommonTable from "@/components/tutor/CommonTable";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setStudent } from "@/store/slices/studentDataSlice";

interface Course {
  _id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  courseQuality: number;
  curriculum: any[];
  performanceScores: {
    userId: { _id: string; username: string; email: string };
    score: number;
    date: string;
  }[];
  instructorId: { _id: string; username: string; email: string };
}

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
  city: string;
  assignment: string[];
  courses: Course[];
  pendingAssignments?: number;
  performanceAverage?: number;
  courseQualityAverage?: number;
}

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  cellClassName?: (value: any, row: T) => string;
}

const PAGE_SIZE = 10;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function calcPerformanceAverage(student: Student): number {
  if (!student.courses?.length) return 0;
  const scores: number[] = [];
  student.courses.forEach((course) => {
    const found = course.performanceScores?.find(
      (s) => s.userId?._id === student._id
    );
    if (found) scores.push(found.score);
  });
  if (!scores.length) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

function calcCourseQualityAverage(student: Student): number {
  const valid = student.courses?.filter((c) => c.courseQuality > 0) || [];
  if (!valid.length) return 0;
  return (
    Math.round(
      (valid.reduce((a, c) => a + c.courseQuality, 0) / valid.length) * 100
    ) / 100
  );
}

export default function MyStudents() {
  const dispatch = useDispatch<AppDispatch>();
  const { student } = useSelector((state: RootState) => state.student);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const router = useRouter();

  // Warning modal state
  const [warningStudent, setWarningStudent] = useState<Student | null>(null);

  // Reset to page 1 whenever search changes
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<Student>[] = [
    { key: "username", label: "Name", sortable: true, filterable: true },
    {
      key: "pendingAssignments",
      label: "Pending",
      sortable: true,
      render: (v: number) => <span>{v || 0}</span>,
    },
    {
      key: "performanceAverage",
      label: "Perf Avg",
      sortable: true,
      render: (v: number) => (v > 0 ? v : "N/A"),
      cellClassName: (v: number) => {
        if (!v || v <= 0) return "text-gray-400";
        if (v >= 80) return "text-green-600 font-semibold";
        if (v >= 60) return "text-yellow-600 font-semibold";
        return "text-red-600 font-semibold";
      },
    },
    {
      key: "courseQualityAverage",
      label: "Quality Avg",
      sortable: true,
      render: (v: number) => (v > 0 ? v : "N/A"),
      cellClassName: (v: number) => {
        if (!v || v <= 0) return "text-gray-400";
        if (v >= 80) return "text-green-600 font-semibold";
        if (v >= 60) return "text-yellow-600 font-semibold";
        return "text-red-600 font-semibold";
      },
    },
    {
      key: "assign",
      label: "Assign",
      sortable: false,
      render: (_: any, row: Student) => (
        <button
          onClick={() => {
            if (row.courses && row.courses.length > 0) {
              setWarningStudent(row);
            } else {
              router.push(`/tutor/addToCourseTutor?studentId=${row._id}`);
            }
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          Course
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: Student) => (
        <Link
          href={`/tutor/studentDetails?studentId=${row._id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
        >
          Details
        </Link>
      ),
    },
  ];

  // ── Fetch (page + search → API; API returns one page slice) ──────────────
  const fetchStudents = useCallback(
    async (page: number, search: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          pageLength: String(PAGE_SIZE),
          ...(search && { search }),
        });

        const response = await fetch(`/Api/myStudents?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Unknown server error");

        if (data.academyId) setAcademyId(data.academyId);

        // Store pagination meta from API
        setTotalPages(data.totalPages ?? 1);
        setTotalCount(data.totalCount ?? 0);

        const enriched: Student[] = (data.filteredUsers ?? []).map(
          (s: Student) => ({
            ...s,
            performanceAverage: calcPerformanceAverage(s),
            courseQualityAverage: calcCourseQualityAverage(s),
          })
        );

        setStudents(enriched);
        dispatch(setStudent(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  // Fetch on mount and whenever page or debounced search changes
  useEffect(() => {
    fetchStudents(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchStudents]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="right-form">
      <div className="card-box">
        <div className="assignments-list-sec mobile-left-right">
          {loading ? (
            <div className="w-full flex justify-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md w-full text-center">
                <h3 className="mt-4 text-base sm:text-lg font-medium text-red-800">
                  Failed to Load Students
                </h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                  onClick={() => fetchStudents(currentPage, debouncedSearch)}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : students.length === 0 && !debouncedSearch ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                No Students Yet
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                You haven't added any students. Start by adding your first student.
              </p>
              {!academyId && (
                <Link href="/tutor/createStudent">
                  <button className="mt-5 px-4 sm:px-6 py-2 sm:py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors inline-flex items-center text-sm">
                    + Add Your First Student
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="assignments-list-com table-responsive">
              <div className="table-responsive w-1230">
                <div className="table-sec">
                  <CommonTable
                    pageSize={PAGE_SIZE}
                    // ── Controlled pagination ────────────────────────────────
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={(page) => setCurrentPage(page)}
                    // ────────────────────────────────────────────────────────
                    headerContent={
                      <div className="head-com-sec w-full d-flex align-items-center gap-2 justify-between mb-2">
                        <div className="left-head d-flex align-items-center gap-2">
                          <Link href="/tutor" className="link-text back-btn">
                            <ChevronLeft />
                          </Link>
                          <h2 className="m-0">My Students</h2>
                        </div>
                        <div className="right-form d-flex align-items-center gap-2">
                          <Form.Label className="d-none">search</Form.Label>
                          <Form.Control
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          {!academyId && (
                            <Link
                              href="/tutor/createStudent"
                              className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
                            >
                              <span className="mr-2">+</span> Add
                            </Link>
                          )}
                        </div>
                      </div>
                    }
                    columns={columns}
                    data={students}
                    rowKey="_id"
                  />
                  {students.length === 0 && debouncedSearch && (
                    <p className="text-center text-gray-500 py-6">
                      No students match &ldquo;<strong>{debouncedSearch}</strong>&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning modal: student already has courses */}
      {warningStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWarningStudent(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Student Already Has Courses
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">{warningStudent.username}</span>{" "}
                  is already enrolled in the following course{warningStudent.courses.length > 1 ? "s" : ""}:
                </p>
              </div>
            </div>

            {/* Course list */}
            <div className="px-6 pb-4">
              <div className="ml-[52px] flex flex-wrap gap-1.5">
                {warningStudent.courses.map((course) => (
                  <span
                    key={course._id}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {course.title}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setWarningStudent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = warningStudent._id;
                  setWarningStudent(null);
                  router.push(`/tutor/addToCourseTutor?studentId=${id}`);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Assign Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}