"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import MyCourse from '@/app/components/MyCourse';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
  category?: string;
  tag?: string;
}

interface ApiResponse {
  course: Course[];
  academyId: string | null;
  category: string | null;
}

export default function TutorCoursesPage() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("tutorCoursesPage");
      return savedPage ? Number(savedPage) : 1;
    }
    return 1;
  });

  const [pageLength] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const savedPage = sessionStorage.getItem("tutorCoursesPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("tutorCoursesPage", currentPage.toString());
  }, [currentPage]);

  // Fetch function
  const fetchCourses = useCallback(async (search: string, page: number) => {
    try {
      // Only show full loading on initial mount
      if (isInitialMount.current) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(
        `/Api/tutors/courses?page=${page}&pageLength=${pageLength}${searchParam}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch courses: ${errorText}`);
      }

      const data = await response.json();
      console.log('Courses data:', data);

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }

      setApiData({
        course: data.course,
        academyId: data.academyId || null,
        category: data.category || null
      });

      console.log("Setting category:", data.category);

    } catch (err) {
      console.error('Detailed error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Unable to load courses');
      if (isInitialMount.current) {
        toast.error('Failed to load courses');
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isInitialMount.current = false;
    }
  }, [pageLength]);

  // Debounce effect for search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCourses(searchQuery, currentPage);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentPage, fetchCourses]);

  // Only show full page loader on initial mount
  if (isLoading && isInitialMount.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && isInitialMount.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md border border-gray-100 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  if (!apiData) {
    return null;
  }

  console.log("Rendering with apiData:", apiData, totalPages);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      <div className="position-relative">
        {/* Subtle loading overlay */}
        {isFetching && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center pt-4" style={{ zIndex: 10, pointerEvents: 'none' }}>
            <div className="bg-white rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <small className="text-muted">Searching...</small>
            </div>
          </div>
        )}
        <MyCourse
          data={apiData.course}
          academyId={apiData.academyId}
          category={apiData.category}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </div>
  );
}