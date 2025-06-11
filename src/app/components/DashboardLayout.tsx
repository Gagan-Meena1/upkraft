"use client";
import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userData?: {
    username?: string;
    email?: string;
    _id?: string; // Make sure this is included to access the user ID
  };
  userType: string; // 'student', 'admin', etc.
  studentId?: string;
  courseId?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userData,
  userType,
  studentId,
  courseId
}) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Use the passed studentId or fall back to userData._id
const effectiveStudentId = studentId || userData?._id || '';  
const effectiveCourseId = courseId || '';

  const handleProfileClick = () => {
  router.push(`/${userType}/profile?studentId=${effectiveStudentId}`);
};
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-gray-700 hover:text-orange-500 transition-colors"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-orange-500">
             <div className="text-2xl font-bold text-orange-500">
               <Link href={`/${userType}`} className="cursor-pointer">
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
            </h1>
          </div>
          
          {/* Profile Section */}
          <div
            className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
          >
            <div className="text-right mr-3">
              <div className="font-medium text-gray-800">{userData?.username || 'User'}</div>
              <div className="text-sm text-gray-600">{userData?.email || 'No email'}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <User size={20} className="text-orange-500" />
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          md:block
          fixed md:relative top-0 md:top-0 z-20
          pt-16 md:pt-0
          transition-transform duration-300 ease-in-out
          bg-white md:bg-transparent
          h-screen md:h-auto
          shadow-lg md:shadow-none
        `}>
          <div className="h-full">
            <Sidebar 
              userType={userType} 
              studentId={effectiveStudentId} 
              courseId={effectiveCourseId}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <main className={`
          flex-1
          p-4
          transition-all duration-300
          overflow-x-hidden
          md:ml-0
          ${sidebarOpen ? 'md:ml-0' : 'ml-0'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;