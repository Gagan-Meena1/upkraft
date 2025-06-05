"use client";
import React, { useState } from 'react';
import { Users, Home, User, BookOpen, Calendar, TrendingUp, MessageSquare, IndianRupee, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MdAssignment, MdAssignmentReturn } from 'react-icons/md';
import { BiBulb } from 'react-icons/bi';
import { PiNutBold } from 'react-icons/pi';

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  route: string;
  collapsed: boolean;
}

interface SidebarProps {
  userType: string; // 'student', 'admin', etc.
  courseId?: string; // Optional courseId property
  studentId?: string; // Optional courseId property
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  title, 
  icon, 
  route,
  collapsed
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <div 
      className={`cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg my-1 ${collapsed ? 'py-3 px-3' : 'py-2 px-4'}`}
      onClick={handleClick}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
        <div className={`${collapsed ? 'text-gray-700' : 'text-gray-700'}`}>
          {icon}
        </div>
        {!collapsed && <h3 className="text-md font-medium text-gray-700 ml-3 whitespace-nowrap">{title}</h3>}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ userType, studentId = '', courseId = '' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Define different menu items based on user type
  const getMenuItems = () => {
    if (userType === 'student') {
      return (
        <>
          <SidebarItem 
            title="Home" 
            icon={<Home size={20} className="text-gray-700" />}
            route="/student"
            collapsed={sidebarCollapsed}
          />
           <SidebarItem 
            title="Talent Identification Centre" 
            icon={<BiBulb size={20} className="text-gray-700" />}
            route="/student/talent"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Student Profile" 
            icon={<User size={20} className="text-gray-700" />}
            route="/student/profile"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Tutors Profile" 
            icon={<Users size={20} className="text-gray-700" />}
            route="/student/tutors"
            collapsed={sidebarCollapsed}
          />
           <SidebarItem 
            title="My Courses" 
            icon={<Calendar size={20} className="text-gray-700" />}
            route="/student/courses"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="My Performance" 
            icon={<TrendingUp size={20} className="text-gray-700" />}
            route={`/student/performance?studentId=${studentId}`}
            collapsed={sidebarCollapsed}
          />

          <SidebarItem 
            title="Class Quality" 
            icon={<PiNutBold size={20} className="text-gray-700" />}
            route={`/student/courses?studentId=${studentId}`}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Assignments" 
            icon={<MdAssignment size={20} className="text-gray-700" />}
            route="/student/assignments"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Payment Summary" 
            icon={<IndianRupee size={20} className="text-gray-700" />}
            route="/student/payments"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="UpKraft AI" 
            icon={<IndianRupee size={20} className="text-gray-700" />}
            route="/student/ai"
            collapsed={sidebarCollapsed}
          />
         
          
          
        </>
      );
    } else if (userType === 'admin') {
      // Define admin menu items here
      return (
        <>
          <SidebarItem 
            title="Dashboard" 
            icon={<Home size={20} className="text-gray-700" />}
            route="admin"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Students" 
            icon={<Users size={20} className="text-gray-700" />}
            route="admin/students"
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            title="Tutors" 
            icon={<Users size={20} className="text-gray-700" />}
            route="admin/tutors"
            collapsed={sidebarCollapsed}
          />
          {/* Add more admin menu items as needed */}
        </>
      );
    }
    // Add more user types as needed
    
    // Default menu items
    return (
      <>
        <SidebarItem 
          title="Home" 
          icon={<Home size={20} className="text-gray-700" />}
          route=""
          collapsed={sidebarCollapsed}
        />
      </>
    );
  };

  return (
    <aside className={`
      ${sidebarCollapsed ? 'w-16' : 'w-64'} 
      bg-white shadow-sm
      min-h-screen 
      transition-all duration-300 ease-in-out
      pt-4
    `}>
      <div className="flex flex-col h-full">
        <div className="px-4 pb-4 flex justify-end">
          <button 
            onClick={toggleSidebarCollapse} 
            className="hidden md:block text-gray-500 hover:text-orange-500 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <div className="space-y-1 px-2">
          {getMenuItems()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;