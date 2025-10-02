"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  duration: string;
  instructor: string;
}

export default function TutorCoursesPage() {
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);
   const [addStudentMessage, setAddStudentMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [tutorId, setTutorId] = useState<string>("");
  const [expandedCourses, setExpandedCourses] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get('studentId'); //
    //   const tutorId = urlParams.get('tutorId'); //
      setStudentId(`${studentId}`);
    //   setTutorId(`${tutorId}`);
        console.log("Fetching courses from API...");
        
        const response = await axios.get('/Api/tutors/courses', {
          params: {
            studentId: studentId,
            tutorId: tutorId
          }
        });
        console.log("API response:", response.data);
        
        // Check the structure of the response and extract courses properly
        let coursesArray: Course[] = [];
        
        if (response.data && response.data.courses) {
          coursesArray = response.data.courses;
        } else if (Array.isArray(response.data)) {
          // If the response directly returns an array
          coursesArray = response.data;
        } else {
          // Try to find courses in the response object
          const possibleCourseData = Object.values(response.data).find(
            value => Array.isArray(value)
          );
          
          if (possibleCourseData) {
            coursesArray = possibleCourseData as Course[];
          }
        }
        
        console.log(`Found ${coursesArray.length} courses to display`);
        setCourses(coursesArray);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError(`Failed to load courses: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  const handleAddStudentToCourse = async (courseId: string) => {
    try {
      // You might want to add loading state for this specific course
      
      const response = await axios.post('/Api/addStudentToCourse', {
        courseId: courseId,
        studentId:studentId,
        // tutorId:tutorId
        // Add any other required data for your API, such as studentId
      });
      
      console.log("Added student to course:", response.data);
      // You can add success notification or state update here
      
      // Optionally refresh the course list or update UI
      // Show success message
    setAddStudentMessage({
      text: response.data.message || 'Course added to student successfully!',
      type: 'success'
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setAddStudentMessage(null);
    }, 3000);
      
    } catch (error: any) {
      console.error("Error adding student to course:", error);
      // Handle error - show notification or update error state
      // Show error message
    setAddStudentMessage({
      text: error.response?.data?.message || 'Failed to add course to student',
      type: 'error'
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setAddStudentMessage(null);
    }, 3000);
  } finally {
    setIsAddingStudent(false); // Add this line to hide loading overlay
  }
    
  };

  // Handler to toggle expanded state for a course
const toggleExpanded = (courseId: string) => {
  setExpandedCourses(prev => ({
    ...prev,
    [courseId]: !prev[courseId]
  }));
};

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation - keep as is */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
        </div>
        <div className="flex space-x-4">
          <Link href={`/tutor/myStudents`}>
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Back 
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 md:mb-0">Course Library</h1>
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full md:w-64 px-5 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {!courses || courses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No courses available at the moment.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No courses found matching your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                </div>
                
                {/* Changed from grid to single column layout */}
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        {/* Left side - Course info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{course.title || 'Untitled Course'}</h3>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                Started: {formatDate(course.createdAt)}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-600">
                                Duration: {course.duration || 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <p className={`text-gray-600 text-sm mb-3 ${!expandedCourses[course._id] ? "line-clamp-1" : ""}`}>
                            {course.description || 'No description available'}
                          </p>
                          {course.description && course.description.length > 60 && (
                            <button
                              className="text-blue-600 text-xs underline cursor-pointer"
                              onClick={() => toggleExpanded(course._id)}
                            >
                              {!expandedCourses[course._id] ? "Show more..." : "Show less"}
                            </button>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Fees: Rs 3000</span>
                            <span>Sessions: 2 Sessions</span>
                            <span>Student: Eunice Robel</span>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-3 ml-6">
                        
                          <button 
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                            onClick={() => handleAddStudentToCourse(course._id)}
                            title="Add course to Student"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

    {/* Keep all existing loading overlay and notification code exactly as is */}
    {isAddingStudent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-700">Adding student to course...</p>
        </div>
      </div>
    )}

    {addStudentMessage && (
      <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        addStudentMessage.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
      }`}>
        <div className="flex items-center">
          {addStudentMessage.type === 'success' ? (
            <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <p className={addStudentMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {addStudentMessage.text}
          </p>
        </div>
      </div>
    )}
    </div>
  );
}