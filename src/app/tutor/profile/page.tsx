"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Curriculum {
  _id: string;
  title: string;
  description: string;
}

interface Course {
  _id: string;
  title: string;
  instructorId: string;
  description: string;
  duration: string;
  price: number;
  curriculum: Curriculum[];
  createdAt: string;
  updatedAt: string;
}

interface Tutor {
  _id: string;
  username: string;
  age: number;
  address: string;
  contact: string;
  email: string;
  category: string;
  courses: any[];
  // Missing fields from requirements
  education?: string;
  city?: string;
  skills?: string;
  experience?: number;
  musicEducation?: string;
  studentsCoached?: number;
  teachingMode?: string;
  instagramLink?: string;
  facebookLink?: string;
  linkedInLink?: string;
  profileImage?: string;
  aboutMyself?: string;
}

const TutorProfilePage = () => {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        const response = await axios.get('/Api/tutors/tutorInfo');
        setTutor(response.data.tutor);
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tutor info:', error);
        setError('Failed to load tutor information');
        setLoading(false);
      }
    };

    fetchTutorInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-500 text-xl">No tutor information available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                {tutor.profileImage ? (
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <Image 
                      src={tutor.profileImage} 
                      alt={tutor.username} 
                      width={144}
                      height={144}
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-5xl font-light text-orange-500">{tutor.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">{tutor.username}</h1>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-1 md:space-y-0 md:space-x-4">
                  <p className="text-white bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tutor.email}
                  </p>
                  <p className="text-white bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tutor.contact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-orange-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Tutor Profile
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tutor Name</h3>
                  <p className="text-lg text-gray-800">{tutor.username}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Relevant Education</h3>
                  <p className="text-lg text-gray-800">{tutor.education || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">City</h3>
                  <p className="text-lg text-gray-800">{tutor.city || tutor.address || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Skill Expertise</h3>
                  <p className="text-lg text-gray-800">{tutor.skills || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Music Teaching Experience (years)</h3>
                  <p className="text-lg text-gray-800">{tutor.experience || "Not specified"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Music Education / Degree</h3>
                  <p className="text-lg text-gray-800">{tutor.musicEducation || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Students Coached</h3>
                  <p className="text-lg text-gray-800">{tutor.studentsCoached || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Pricing per Class</h3>
                  <p className="text-lg text-gray-800">
                    {courses.length > 0 ? `₹${courses[0].price.toLocaleString()}` : "Not specified"}
                  </p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Teaching Mode</h3>
                  <p className="text-lg text-gray-800">{tutor.teachingMode || "Not specified"}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Social Media</h3>
                  <div className="flex space-x-3 mt-2">
                    {tutor.instagramLink && (
                      <a href={tutor.instagramLink} target="_blank" rel="noopener noreferrer" 
                         className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    )}
                    {tutor.facebookLink && (
                      <a href={tutor.facebookLink} target="_blank" rel="noopener noreferrer" 
                         className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                    )}
                    {tutor.linkedInLink && (
                      <a href={tutor.linkedInLink} target="_blank" rel="noopener noreferrer" 
                         className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-800">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                    )}
                    {!tutor.instagramLink && !tutor.facebookLink && !tutor.linkedInLink && (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-orange-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                About Me
              </h2>
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">{tutor.aboutMyself || "No information provided."}</p>
              </div>
            </div>

            {/* Courses Section */}
            {courses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-orange-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  Courses Offered
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <span className="bg-orange-100 text-orange-500 p-3 rounded-full mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        </span>
                        <h4 className="font-bold text-lg text-gray-800">{course.title}</h4>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.duration}
                        </span>
                        <span className="text-orange-500 font-bold">₹{course.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;