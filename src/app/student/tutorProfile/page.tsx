"use client"
import React, { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

// Loading component for suspense fallback
function LoadingComponent() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}

// SearchParamsWrapper component to handle the useSearchParams hook
function TutorProfileContent() {
  const searchParams = useSearchParams();
  const tutorId = searchParams?.get('tutorId');
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        const response = await axios.get(`/Api/tutorInfoForStudent?tutorId=${tutorId}`);
        setTutor(response.data.tutor);
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tutor info:', error);
        setError('Failed to load tutor information');
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorInfo();
    } else {
      setError('Tutor ID is missing');
      setLoading(false);
    }
  }, [tutorId]);

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
            <Link
              href='/student/tutors'
              className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="text-white bg-gray-800 rounded-xl" size={24} />
            </Link>
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                {tutor.profileImage ? (
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <Image 
                      src={tutor.profileImage} 
                      alt={tutor.username} 
                      width={144}
                      height={144}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
                  <p className="text-white bg-gray-500 bg-opacity-20 px-3 py-1 rounded-xl text-sm flex items-center">
                    {tutor.email}
                  </p>
                  <p className="text-white bg-gray-500 bg-opacity-20 px-3 py-1 rounded-xl text-sm flex items-center">
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1"> Teaching Experience (years)</h3>
                  <p className="text-lg text-gray-800">{tutor.experience || "Not specified"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Music Education / Degree</h3>
                  <p className="text-lg text-gray-800">{tutor.musicEducation || "Not specified"}</p>
                </div> */}
                
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
          
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
const TutorProfilePage = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <TutorProfileContent />
    </Suspense>
  );
};

export default TutorProfilePage;