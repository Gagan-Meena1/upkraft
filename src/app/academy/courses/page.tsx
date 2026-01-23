"use client";

import React, { useState, useEffect } from 'react';
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
}

interface ApiResponse {
  course: Course[];
  academyId: string | null;
  category: string | null;
}

export default function TutorCoursesPage() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("tutorCoursesPage");
      return savedPage ? Number(savedPage) : 1;
    }
    return 1;
  });

  const [pageLength] = useState(2);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const savedPage = sessionStorage.getItem("tutorCoursesPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem("tutorCoursesPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/Api/tutors/courses?page=${currentPage}&pageLength=${pageLength}`
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
        // Store everything in one state object
        setApiData({
          course: data.course,
          academyId: data.academyId || null,
          category: data.category || null
        });

        console.log("Setting category:", data.category);

      } catch (err) {
        console.error('Detailed error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Unable to load courses');
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
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
    return null; // Don't render if no data
  }

  console.log("Rendering with apiData:", apiData, totalPages);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      <div>
        <MyCourse
          data={apiData.course}
          academyId={apiData.academyId}
          category={apiData.category}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}