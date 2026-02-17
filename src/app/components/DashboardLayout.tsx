"use client";
import React, { useState, useEffect } from 'react';
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
    _id?: string;
  };
  userType: string;
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Changed default to false for mobile-first
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (sidebar && menuButton && 
            !sidebar.contains(event.target as Node) && 
            !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);
  
  const effectiveStudentId = studentId || userData?._id || '';  
  const effectiveCourseId = courseId || '';

  const handleProfileClick = () => {
    router.push(`/${userType}/profile?studentId=${effectiveStudentId}`);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when navigating on mobile
  const handleSidebarItemClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      {/* <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              id="menu-button"
              className="md:hidden text-gray-700 hover:text-orange-500 transition-colors p-1"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link href={`/${userType}`} className="cursor-pointer">
              <Image 
                src="/logo.png"
                alt="UpKraft"
                width={288}
                height={72}
                priority
                className="object-contain w-24 sm:w-32 md:w-36 h-auto" 
              />
            </Link>
          </div> */}
          
          {/* Profile Section */}
          {/* <div
            className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
          >
            <div className="text-right mr-3 hidden sm:block">
              <div className="font-medium text-gray-800 text-sm md:text-base">
                {userData?.username || 'User'}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                {userData?.email || 'No email'}
              </div>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <User size={16} className="text-orange-500 md:w-5 md:h-5" />
            </div>
          </div>
        </div>
      </header> */}
      
      <div className="">
        {/* Sidebar */}
        {userType=="admin" && (
           <div 
          id="mobile-sidebar"
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:relative
            top-0 md:top-0
            left-0
            z-40 md:z-auto
            w-64 md:w-auto
            h-full
            pt-16 md:pt-0
            transition-transform duration-300 ease-in-out
            bg-white
            shadow-xl md:shadow-sm
            overflow-y-auto
          `}
        >
          <Sidebar 
            userType={userType} 
            studentId={effectiveStudentId} 
            courseId={effectiveCourseId}
            onItemClick={handleSidebarItemClick}
            isMobile={isMobile}
          />
        </div>
        )}
        {/* <div 
          id="mobile-sidebar"
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:relative
            top-0 md:top-0
            left-0
            z-40 md:z-auto
            w-64 md:w-auto
            h-full
            pt-16 md:pt-0
            transition-transform duration-300 ease-in-out
            bg-white
            shadow-xl md:shadow-sm
            overflow-y-auto
          `}
        >
          <Sidebar 
            userType={userType} 
            studentId={effectiveStudentId} 
            courseId={effectiveCourseId}
            onItemClick={handleSidebarItemClick}
            isMobile={isMobile}
          />
        </div> */}
        
        {/* Main Content */}
        <main className="">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;