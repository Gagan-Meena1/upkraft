"use client";
import React, { useState } from 'react';
import { CheckCircle, Users, Home, User, BookOpen, Calendar, TrendingUp, MessageSquare, IndianRupee, Video, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MdAssignment, MdAssignmentReturn } from 'react-icons/md';
import { BiBulb } from 'react-icons/bi';
import { PiNutBold } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { useUserData } from "@/app/providers/UserData/page";

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  route?: string;
  collapsed: boolean;
  onClick?: () => void;
  onItemClick?: () => void; // For mobile sidebar closing
  isMobile?: boolean;
}

interface SidebarProps {
  userType: string;
  courseId?: string;
  studentId?: string;
  onItemClick?: () => void; // Callback to close sidebar on mobile
  isMobile?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  title,
  icon,
  route,
  collapsed,
  onClick,
  onItemClick,
  isMobile
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      router.push(route);
    }

    // Call onItemClick to close mobile sidebar
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div
      className={`
        cursor-pointer hover:bg-gray-100 active:bg-gray-200 
        transition-colors duration-200 rounded-lg my-1
        ${collapsed && !isMobile ? 'py-3 px-3' : 'py-3 px-4'}
        ${isMobile ? 'py-4 px-4' : ''}
      `}
      onClick={handleClick}
    >
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="text-gray-700 flex-shrink-0">
          {icon}
        </div>
        {(!collapsed || isMobile) && (
          <h3 className={`
            font-medium text-gray-700 ml-3 whitespace-nowrap
            ${isMobile ? 'text-base' : 'text-sm md:text-base'}
          `}>
            {title}
          </h3>
        )}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  userType,
  studentId = '',
  courseId = '',
  onItemClick,
  isMobile = false
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const router = useRouter();

  const toggleSidebarCollapse = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const { clearData } = useUserData();

  const handleLogout = async () => {
    try {
      clearData(); // Clear user data
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error during logout');
      console.error('Logout error:', error);
    }

    // Close mobile sidebar after logout
    if (onItemClick) {
      onItemClick();
    }
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
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Talent Identification Centre"
            icon={<BiBulb size={20} className="text-gray-700" />}
            route="/student/talent"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Student Profile"
            icon={<User size={20} className="text-gray-700" />}
            route="/student/profile"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Tutors Profile"
            icon={<Users size={20} className="text-gray-700" />}
            route="/student/tutors"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="My Courses"
            icon={<Calendar size={20} className="text-gray-700" />}
            route="/student/courses"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Practice Studio"
            icon={<Calendar size={20} className="text-gray-700" />}
            route="/visualizer.html?user=student"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Music Library"
            icon={<Calendar size={20} className="text-gray-700" />}
            route="/student/musicLibrary"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Performance Video"
            icon={<Video size={20} className="text-gray-700" />}
            route="/student/performanceVideo"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Assignments"
            icon={<MdAssignment size={20} className="text-gray-700" />}
            route="/student/assignments"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="My Archives"
            icon={<MdAssignment size={20} className="text-gray-700" />}
            route="/tutor/myArchieve"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Logout"
            icon={<LogOut size={20} className="text-gray-700" />}
            collapsed={sidebarCollapsed}
            onClick={handleLogout}
            isMobile={isMobile}
          />
        </>
      );
    } else if (userType === 'admin') {
      return (
        <>
          <SidebarItem
            title="Dashboard"
            icon={<Home size={20} className="text-gray-700" />}
            route="/admin"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Students"
            icon={<Users size={20} className="text-gray-700" />}
            route="/admin/students"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Tutors"
            icon={<Users size={20} className="text-gray-700" />}
            route="/admin/tutors"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Music Library"
            icon={<CheckCircle size={20} className="text-gray-700" />}
            route="/admin/musicLibrary"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Approval Requests"
            icon={<CheckCircle size={20} className="text-gray-700" />}
            route="/admin/approvalRequest"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Leads Dashboard"
            icon={<TrendingUp size={20} className="text-gray-700" />}
            route="/admin/leads"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem
            title="Logout"
            icon={<LogOut size={20} className="text-gray-700" />}
            collapsed={sidebarCollapsed}
            onClick={handleLogout}
            isMobile={isMobile}
          />
        </>
      );
    }
    // Default menu items for tutor
    return (
      <>
        <SidebarItem
          title="Home"
          icon={<Home size={20} className="text-gray-700" />}
          route="/tutor"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem
          title="Logout"
          icon={<LogOut size={20} className="text-gray-700" />}
          collapsed={sidebarCollapsed}
          onClick={handleLogout}
          isMobile={isMobile}
        />
      </>
    );
  };

  return (
    <aside className={`
      ${sidebarCollapsed && !isMobile ? 'w-16' : isMobile ? 'w-full' : 'w-64'} 
      bg-white
      ${isMobile ? 'h-full' : 'min-h-screen shadow-sm'}
      transition-all duration-300 ease-in-out
      ${isMobile ? 'pt-4' : 'pt-4'}
      flex flex-col
    `}>
      <div className="flex flex-col flex-grow">
        {/* Collapse button - hidden on mobile */}
        {!isMobile && (
          <div className="px-4 pb-4 flex justify-end">
            <button
              onClick={toggleSidebarCollapse}
              className="text-gray-500 hover:text-orange-500 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div className="px-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {userType} Menu
            </h2>
          </div>
        )}

        <div className={`space-y-1 px-2 flex-grow ${isMobile ? 'pt-2' : ''}`}>
          {getMenuItems()}
        </div>

        {/* Mobile footer */}
        {isMobile && (
          <div className="px-4 pt-4 border-t border-gray-200 mt-4">
            <p className="text-xs text-gray-500 text-center">
              UpKraft Learning Platform
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;