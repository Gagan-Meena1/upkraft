"use client";
import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userData?: {
    username?: string;
    email?: string;
  };
  userType: string; // 'student', 'admin', etc.
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userData, 
  userType 
}) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleProfileClick = () => {
    router.push(`/${userType}/profile`);
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
              <img src="/logo.png" alt="UPKRAFT" className="h-13 w-auto"/>
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
                 <Sidebar userType={userType} />
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