"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses from API...");
        
        const response = await axios.get('/Api/tutors/courses');
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
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userid'); //
      const response = await axios.post('/Api/addStudentToCourse', {
        courseId: courseId,
        userId:userId
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

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <img src="/logo.png" alt="UPKRAFT" className="w-36 h-auto" />
        </div>
        <div className="flex space-x-4">
          <Link href="/tutor/allStudents">
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Back to Students
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
                className="w-full md:w-64 px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div 
                      key={course._id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-px"
                    >
                      <div className="bg-gray-900 h-3"></div>
                      <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{course.title || 'Untitled Course'}</h3>
                        <button 
                        className="w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full hover:bg-orange-700 transition"
                        title="Add course to Student"
                        aria-label="Add course"
                        onClick={() => handleAddStudentToCourse(course._id)} // Add this line

                        >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        </button>
                    </div>
                        <p className="text-gray-600 mb-4 line-clamp-3">{course.description || 'No description available'}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="px-3 py-1 bg-orange-100 rounded-full text-xs font-medium text-orange-600">
                            <span className="flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(course.createdAt)}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-600">
                            <span className="flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {course.duration || 'Duration not specified'}
                            </span>
                          </div>
                        </div>
                        {/* <div className="pt-4 border-t border-gray-100"> */}
                          {/* <Link 
                            href={`/tutor/courses/${course._id}`}
                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition"
                          >
                            <svg 
                              className="h-5 w-5 mr-2" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                              />
                            </svg>
                            View Course Details
                          </Link> */}
                        {/* </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="font-bold text-xl text-gray-900 mb-4 md:mb-0">UPKRAFT</div>
          <div className="text-gray-500">© 2025 UPKRAFT. All rights reserved.</div>
        </div>
      </footer>
      {/* Add loading overlay and notification here */}
{/* Loading overlay */}
{isAddingStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4"></div>
      <p className="text-gray-700">Adding student to course...</p>
    </div>
  </div>
)}
{/* Success/Error notification */}
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