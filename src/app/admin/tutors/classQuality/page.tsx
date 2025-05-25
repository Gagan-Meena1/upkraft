"use client";

import React, { useState, useEffect } from 'react';
import { Book, Clock, IndianRupee, List } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use } from 'react';
import { toast, Toaster } from 'react-hot-toast';

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
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [tutorId, setTutorId] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const tutorIdFromUrl = urlParams.get('tutorId');
        setTutorId(tutorIdFromUrl);
        const response = await fetch(`/Api/tutors/courses?tutorId=${tutorIdFromUrl}`); // Use the correct route
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch courses: ${errorText}`);
        }
  
        const data = await response.json();
        // console.log('Courses data:', data);
        
        // Change this line to match the API response
        setCourses(data.course); // Use 'course' instead of 'courses'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-pink-400 to-pink-700 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-pink-400 to-pink-700 flex items-center justify-center">
        <div className="bg-white/30 backdrop-blur-lg p-8 rounded-xl text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 via-pink-400 to-pink-700 text-gray-800 p-6">
      <Toaster />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className=" text-4xl font-bold text-black drop-shadow-md">My Courses</h1>
         
          <Link href={`/admin/tutors/tutorInfo?tutorId=${tutorId}`}>
            <button className="bg-gray-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-pink-500 hover:to-blue-500 transition-colors">
              <Book size={24} /> Back 
            </button>
          </Link>
        </div>
       

        {courses.length === 0 ? (
          <div className="bg-white/30 backdrop-blur-lg rounded-xl p-8 text-center">
            <h2 className="text-2xl text-gray-800 mb-4">No Courses Available</h2>
            <p className="text-gray-700">Start creating your first course!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course._id} 
                className="bg-white/30 backdrop-blur-lg rounded-xl shadow-lg p-6 transform transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
                  <div className="flex items-center gap-2">
                    <Clock className="text-green-600" size={20} />
                    <span className="text-gray-700">{course.duration}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600 font-bold text-lg">₹</span>
                    <span className="text-gray-800 font-semibold">{course.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="text-purple-600" size={20} />
                    <span className="text-gray-700">{course.curriculum.length} Sessions</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={`/admin/tutors/classQuality/${course._id}?tutorId=${tutorId}`}>
                    <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}