"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List, MessageCircle, Trash2, ChevronLeft, BarChart3, Pencil, Edit, Eye, Copy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import MyCourse from '@/app/components/MyCourse';

// Define the Course interface based on your mongoose schema
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

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/tutors/courses'); // Use the correct route
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Courses data:', data);
        
        // Change this line to match the API response
        setCourses(data.course);
        setAcademyId(data.academyId || null);
        setIsLoading(false);
      } catch (err) {
        console.error('Detailed error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Unable to load courses');
        toast.error('Failed to load courses');
        setIsLoading(false);
      }
    };
  
    fetchCourses();
  }, []);

  

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      
      {/* Header */}
       <div>
<MyCourse data={courses} academyId={academyId} />    
</div>
    </div>
  );
}