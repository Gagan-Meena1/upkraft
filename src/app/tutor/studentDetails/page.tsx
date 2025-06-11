"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Users, PlusCircle, User, ExternalLink, HomeIcon, Edit, X, Camera } from "lucide-react";
import Image from "next/image";
import { BiBulb } from "react-icons/bi";

interface CourseData {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: string;
    topic: string;
    tangibleOutcome: string;
    _id: string;
  }[];
}

interface StudentData {
  message: string;
  studentId: string;
  username: string;
  email: string;
  contact?: string;
  age?: number;
  profileImage?: string;
  courses: CourseData[];
}

interface EditFormData {
  username: string;
  email: string;
  contact: string;
  age: string;
  profileImage?: File | null;
}

export default function StudentDetails() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    username: '',
    email: '',
    contact: '',
    age: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
         const userId = urlParams.get('studentId');
        const response = await fetch(`/Api/studentCourses?studentId=${userId}`);
        const data = await response.json();
        setStudentData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleEditClick = () => {
    if (studentData) {
      setFormData({
        username: studentData.username || '',
        email: studentData.email || '',
        contact: studentData.contact || '',
        age: studentData.age?.toString() || '',
        profileImage: null
      });
      setPreviewImage(studentData.profileImage || null);
      setIsEditModalOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;

    setIsUpdating(true);

    try {
      const formDataToSend = new FormData();
      
      const userData = {
        username: formData.username,
        email: formData.email,
        contact: formData.contact,
        ...(formData.age && { age: parseInt(formData.age) })
      };
      
      formDataToSend.append('userData', JSON.stringify(userData));
      
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      const response = await fetch(`/Api/userUpdate?userId=${studentData.studentId}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state with new data
        setStudentData(prev => prev ? {
          ...prev,
          username: formData.username,
          email: formData.email,
          contact: formData.contact,
          age: formData.age ? parseInt(formData.age) : prev.age,
          profileImage: result.tutor.profileImage || prev.profileImage
        } : null);
        
        setIsEditModalOpen(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setFormData({
      username: '',
      email: '',
      contact: '',
      age: '',
      profileImage: null
    });
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 h-screen ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col sticky top-0`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-l text-orange-600 ${!sidebarOpen && 'hidden'}`}>
             <Link href="/tutor" className="cursor-pointer">
                                     <Image 
                                       src="/logo.png"
                                       alt="UpKraft"
                                       width={288} // Use 2x the display size for crisp rendering
                                       height={72}  // Adjust based on your logo's actual aspect ratio
                                       priority
                                       className="object-contain w-36 h-auto" 
                                     />
                                   </Link>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <User size={20} />
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">Tutor Name</p>
              <p className="text-sm text-gray-500 truncate">Tutor</p>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4">
          <Link href="/tutor/allStudents" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <Users size={20} />
            {sidebarOpen && <span className="ml-3">Students</span>}
          </Link>
          <Link href="/tutor/courses" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all">
            <BookOpen size={20} />
            {sidebarOpen && <span className="ml-3">My Courses</span>}
          </Link>
          <Link href="/tutor/create-course" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <PlusCircle size={20} />
            {sidebarOpen && <span className="ml-3">Create Course</span>}
          </Link>
          <Link href="/tutor/myStudents" className="flex items-center p-2 rounded-lg bg-gray-100 text-orange-600 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">My Students</span>}
          </Link>
        </nav>
        
        {/* Profile Link */}
        <div className="p-4 border-t border-gray-200">
          <Link href="#profile" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
            <User size={20} />
            {sidebarOpen && <span className="ml-3">Profile</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <Link href="/tutor" className="flex items-center p-2 rounded-lg bg-gray-100 text-orange-600 hover:bg-gray-200 transition-all">
            <ChevronLeft size={20} />
            {sidebarOpen && <span className="ml-3">Home</span>}
          </Link>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {studentData && (
            <>
              {/* Student Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
                    {studentData.profileImage ? (
                      <Image
                        src={studentData.profileImage}
                        alt={studentData.username}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">{studentData.username}</h2>
                      <p className="text-gray-600">{studentData.email}</p>
                      {studentData.contact && (
                        <p className="text-gray-500 text-sm">Contact: {studentData.contact}</p>
                      )}
                      {studentData.age && (
                        <p className="text-gray-500 text-sm">Age: {studentData.age}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex justify-between space-x-4">
                    <Link 
                      href={`/tutor/talent?studentId=${studentData.studentId}`}
                      className="  flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      <BiBulb size={16} className="mr-2" />
                      Talent
                    </Link>
                    <button
                      onClick={handleEditClick}
                      className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </button>
                    
                  </div>
                </div>
              </div>

              {/* Courses Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
                  <div className="text-sm text-gray-500">
                    Total Courses: {studentData.courses.length}
                  </div>
                </div>

                {studentData.courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentData.courses.map((course) => (
                      <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                            {course.duration}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <Calendar size={16} className="mr-2" />
                          <span>{course.curriculum.length} Sessions</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-gray-900 font-semibold">
                            {course.price.toFixed(2)}
                          </div>
                          <Link 
                            href={`/tutor/courseDetailsForFeedback/${course._id}?studentId=${studentData.studentId}`} 
                            className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            <span>View Details</span>
                            <ExternalLink size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-gray-500">No courses available for this student</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      formData.username.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-orange-600 text-white p-1 rounded-full cursor-pointer hover:bg-orange-700 transition-colors"
                  >
                    <Camera size={12} />
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Click camera icon to change photo</p>
              </div>

              {/* Form Fields */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}