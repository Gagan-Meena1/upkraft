"use client"
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  studentsCoached?: number;
  teachingMode?: string;
  instagramLink?: string;
  facebookLink?: string;
  linkedInLink?: string;
  profileImage?: string;
  aboutMyself?: string;
}

const TutorProfilePage = () => {
    const router = useRouter();
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTutor, setEditedTutor] = useState<Tutor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openEditModal = () => {
    if (tutor) {
      setEditedTutor({...tutor});
      setPreviewImage(tutor.profileImage || null);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedTutor(null);
    setProfileImageFile(null);
    setPreviewImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedTutor) {
      setEditedTutor({
        ...editedTutor,
        [name]: value
      });
    }
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 // Updated handleSaveChanges function for TutorProfilePage.tsx
const handleSaveChanges = async () => {
  if (!editedTutor) return;
  
  setIsSaving(true);
  try {
    // Create a FormData object to handle both text data and files
    const formData = new FormData();
    
    // Add the tutor data as a JSON string
    formData.append('userData', JSON.stringify(editedTutor));
    
    // Add profile image if there's a new one
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }
    
    // Send the combined data to the API
    const response = await axios.put(`/Api/userUpdate?userId=${tutor._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Update local state with new data
    setTutor(response.data.tutor);
    setIsSaving(false);
    closeEditModal();
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    setIsSaving(false);
    // Error handling can be improved by showing a toast or alert to the user
  }
};

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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 relative">
          {/* Edit Button */}
          <button 
            onClick={openEditModal}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
            aria-label="Edit profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
       {/* Header Section */}
<div className="bg-gradient-to-r from-orange-400 to-orange-500 p-8">
  <div className="container mx-auto">
    <div className="flex items-center mb-4">
      <button 
        onClick={() => router.back()} 
        className="mr-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-100 transition-colors flex items-center"
        aria-label="Go back"
      >
        <ArrowLeft className="text-orange-500 mr-1" size={20} />
        <span className="text-black font-medium">Back</span>
      </button>
    </div>
    <div className="flex flex-col md:flex-row items-center">
      <div className="relative mb-6 md:mb-0 md:mr-8">
        {tutor.profileImage ? (
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md">
          <Image 
            src={tutor.profileImage} 
            alt={tutor.username} 
            width={144}
            height={144}
            className="w-full h-full object-cover"
            priority
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
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <p className="text-gray-800 bg-gray-300 bg-opacity-30 px-4 py-2 rounded-md text-base font-medium w-full md:w-auto text-center md:text-left">
            📧 {tutor.email}
          </p>
          <p className="text-gray-800 bg-gray-300 bg-opacity-30 px-4 py-2 rounded-md text-base font-medium w-full md:w-auto text-center md:text-left">
            📞 {tutor.contact}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Main Content */}
          <div className="p-8">
           <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-orange-500 pl-3">
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Teaching Experience (years)</h3>
                  <p className="text-lg text-gray-800">{tutor.experience || "Not specified"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
               
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Students Coached</h3>
                  <p className="text-lg text-gray-800">{tutor.studentsCoached || "Not specified"}</p>
                </div>
                
                {/* <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Pricing per Class</h3>
                  <p className="text-lg text-gray-800">
                    {courses.length > 0 ? `₹${courses[0].price.toLocaleString()}` : "Not specified"}
                  </p>
                </div> */}
                
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
                    {/* {tutor.facebookLink && (
                      <a href={tutor.facebookLink} target="_blank" rel="noopener noreferrer" 
                         className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                    )} */}
                    {/* {tutor.linkedInLink && (
                      <a href={tutor.linkedInLink} target="_blank" rel="noopener noreferrer" 
                         className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-800">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                    )} */}
                    {/* {!tutor.instagramLink && !tutor.facebookLink && !tutor.linkedInLink && (
                      <span className="text-gray-500">Not specified</span>
                    )} */}
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && editedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center overflow-hidden">
  <div className="bg-white rounded-xl shadow-xl w-full h-full md:h-auto md:max-w-5xl md:max-h-[95vh] overflow-y-auto m-0 md:m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">Edit Profile</h3>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-8">
                <div 
                  onClick={handleProfileImageClick}
                  className="relative w-36 h-36 rounded-full overflow-hidden cursor-pointer group border-4 border-dashed border-orange-300 hover:border-orange-500 transition-colors duration-300"
                >
                  {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover absolute inset-0" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                  </div>
                )}

                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden" 
                />
                <p className="text-sm text-gray-500 mt-2">Click to upload a new profile image</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className='text-gray-800'>
                  <h4 className="font-bold text-gray-700 mb-4">Basic Information</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        name="username" 
                        value={editedTutor.username} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={editedTutor.email} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input 
                        type="text" 
                        name="contact" 
                        value={editedTutor.contact} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={editedTutor.city || ''} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus
                        focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={editedTutor.address} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div className='text-gray-800'>
                  <h4 className="font-bold text-gray-700 mb-4">Professional Information</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                      <input 
                        type="text" 
                        name="education" 
                        value={editedTutor.education || ''} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <input 
                        type="text" 
                        name="skills" 
                        value={editedTutor.skills || ''} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g. Guitar, Piano, Vocal"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input 
                        type="number" 
                        name="experience" 
                        value={editedTutor.experience || ''} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="mt-6 text-gray-800">
                <h4 className="font-bold text-gray-700 mb-4">Additional Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Students Coached</label>
                    <input 
                      type="number" 
                      name="studentsCoached" 
                      value={editedTutor.studentsCoached || ''} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Mode</label>
                    <select
                      name="teachingMode"
                      value={editedTutor.teachingMode || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Teaching Mode</option>
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
               <div className="mt-6"> 
                <h4 className="font-bold text-gray-700 mb-4">Social Media Links</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram profile</label>
                    <input 
                      type="url" 
                      name="instagramLink" 
                      value={editedTutor.instagramLink || ''} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input 
                      type="url" 
                      name="facebookLink" 
                      value={editedTutor.facebookLink || ''} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://facebook.com/username"
                    />
                  </div> */}
{/*                   
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input 
                      type="url" 
                      name="linkedInLink" 
                      value={editedTutor.linkedInLink || ''} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div> */}
                </div>
              </div> 
              
              {/* About Me */}
              <div className="mt-6 text-gray-800">
                <h4 className="font-bold text-gray-700 mb-4">About Me</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tell students about yourself</label>
                  <textarea 
                    name="aboutMyself" 
                    value={editedTutor.aboutMyself || ''} 
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Share your teaching philosophy, experience, and what makes you unique..."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeEditModal}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfilePage;