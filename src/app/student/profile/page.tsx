"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/DashboardLayout';
import Image from 'next/image';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructorId: string;
  curriculum: any[];
  class: any[];
}

interface User {
  _id: string;
  username: string;
  age: number;
  address: string;
  contact: string;
  email: string;
  category: string;
  courses: string[]; // Array of course IDs
  isVerified: boolean;
  isAdmin: boolean;
  classes: any[];
  profileImage?: string;
}

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/Api/users/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        
        // Check the structure of the response and handle accordingly
        if (data.user && data.courseDetails) {
          setUser(data.user);
          setCourses(data.courseDetails);
          setFormData(data.user);
        } else if (data.courseDetails) {
          // If only courses are present
          setCourses(data.courseDetails);
        } else if (data.user) {
          // If only user is present
          setUser(data.user);
          setFormData(data.user);
        } else {
          // Fallback case - maybe the entire data object is the user
          setUser(data);
          setFormData(data);
        }
        
        console.log("Fetched data:", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) return;
    
    setIsSubmitting(true);
    try {
      // Create form data
      const submitFormData = new FormData();
      
      // Add user data as JSON
      submitFormData.append('userData', JSON.stringify(formData));
      
      // Add profile image if there's a new one
      if (profileImageFile) {
        submitFormData.append('profileImage', profileImageFile);
      }
      
      const response = await fetch(`/Api/userUpdate?userId=${user._id}`, {
        method: 'PUT',
        body: submitFormData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await response.json();
      console.log('Update success:', result);
      
      // Update the user state with the new data
      setUser(prev => prev ? { ...prev, ...formData, profileImage: result.tutor.profileImage || prev.profileImage } : null);
      setUpdateSuccess(true);
      
      // Close modal after successful update
      setTimeout(() => {
        setIsEditModalOpen(false);
        setUpdateSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">No user data available</div>;

  return (
    <DashboardLayout userData={user || undefined} userType="student">
      <div className="w-full bg-gray-50">
        {/* Header Section */}
        <div className="text-center mb-6 bg-gradient-to-r from-orange-500 to-orange-400 text-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold">Student Profile</h1>
          <p className="mt-3 max-w-md mx-auto">Your personal information and enrolled courses at a glance</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-orange-500">Personal Information</h2>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-3">
                  {user.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt="Profile" 
                      fill
                      className="rounded-full object-cover border-4 border-orange-100"
                      sizes="(max-width: 768px) 100vw, 160px"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-800">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.category}</p>
              </div>
              
              {/* User Details */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-lg text-gray-800">{user.username || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg text-gray-800">{user.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="text-lg text-gray-800">{user.age || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-lg text-gray-800">{user.address || "Not provided"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-lg text-gray-800">{user.contact || "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {user.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-orange-500 mb-4">Enrolled Courses</h2>
            
            <div className="space-y-6">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{course.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${course.price}</p>
                        <p className="text-xs text-gray-500">Duration: {course.duration}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No courses enrolled</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 md:mx-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Profile Image Section */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-3">
                    {previewImage ? (
                      <Image 
                        src={previewImage} 
                        alt="Profile Preview" 
                        fill
                        className="rounded-full object-cover border-4 border-orange-100"
                        sizes="(max-width: 768px) 100vw, 128px"
                      />
                    ) : user.profileImage ? (
                      <Image 
                        src={user.profileImage} 
                        alt="Profile" 
                        fill
                        className="rounded-full object-cover border-4 border-orange-100"
                        sizes="(max-width: 768px) 100vw, 128px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <label className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Change Profile Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      value={formData.contact || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                  </button>
                  
                  {/* Success Message */}
                  {updateSuccess && (
                    <div className="mt-3 text-center text-sm text-green-600">
                      Profile updated successfully!
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserProfilePage;