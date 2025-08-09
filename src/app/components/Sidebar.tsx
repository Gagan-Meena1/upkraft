"use client";
import React, { useState } from 'react';
import { CheckCircle, Users, Home, User, BookOpen, Calendar, TrendingUp, MessageSquare, IndianRupee, Video, ChevronLeft, ChevronRight, LogOut, BarChart3, Music, Bot, CreditCard, Gift, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MdAssignment, MdAssignmentReturn } from 'react-icons/md';
import { BiBulb } from 'react-icons/bi';
import { PiNutBold } from 'react-icons/pi';
import { toast } from 'react-hot-toast';

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
        cursor-pointer hover:bg-white/10 active:bg-white/20 
        transition-colors duration-200 rounded-lg my-1
        ${collapsed && !isMobile ? 'py-3 px-3' : 'py-3 px-4'}
        ${isMobile ? 'py-4 px-4' : ''}
      `}
      onClick={handleClick}
    >
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="text-white flex-shrink-0">
          {icon}
        </div>
        {(!collapsed || isMobile) && (
          <h3 className={`
            font-medium text-white ml-3 whitespace-nowrap
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

  const handleLogout = async () => {
    try {
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
            icon={<Home size={20} className="text-white" />}
            route="/student"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Talent Identification Centre" 
            icon={<BiBulb size={20} className="text-white" />}
            route="/student/talent"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Student Profile" 
            icon={<User size={20} className="text-white" />}
            route="/student/profile"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Tutors Profile" 
            icon={<Users size={20} className="text-white" />}
            route="/student/tutors"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="My Courses" 
            icon={<Calendar size={20} className="text-white" />}
            route="/student/courses"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Performance Video" 
            icon={<Video size={20} className="text-white" />}
            route="/student/performanceVideo"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Assignments" 
            icon={<MdAssignment size={20} className="text-white" />}
            route="/student/assignments"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Logout" 
            icon={<LogOut size={20} className="text-white" />}
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
            icon={<Home size={20} className="text-white" />}
            route="/admin"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Students" 
            icon={<Users size={20} className="text-white" />}
            route="/admin/students"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Tutors" 
            icon={<Users size={20} className="text-white" />}
            route="/admin/tutors"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Approval Requests" 
            icon={<CheckCircle size={20} className="text-white" />}
            route="/admin/approvalRequest"
            collapsed={sidebarCollapsed}
            onItemClick={onItemClick}
            isMobile={isMobile}
          />
          <SidebarItem 
            title="Logout" 
            icon={<LogOut size={20} className="text-white" />}
            collapsed={sidebarCollapsed}
            onClick={handleLogout}
            isMobile={isMobile}
          />
        </>
      );
    }
    
    // Tutor menu items matching the first sidebar
    return (
      <>
        <SidebarItem 
          title="Home"
          icon={<Home size={20} className="text-white" />}
          route="/tutor"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="My Students"
          icon={<Users size={20} className="text-white" />}
          route="/tutor/students"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="My Courses"
          icon={<BookOpen size={20} className="text-white" />}
          route="/tutor/courses"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Calendar"
          icon={<Calendar size={20} className="text-white" />}
          route="/tutor/calendar"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Assignment"
          icon={<MdAssignment size={20} className="text-white" />}
          route="/tutor/assignments"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Student's"
          icon={<User size={20} className="text-white" />}
          route="/tutor/student-profiles"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Tutor's"
          icon={<Users size={20} className="text-white" />}
          route="/tutor/tutor-profiles"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Report & Analytics"
          icon={<BarChart3 size={20} className="text-white" />}
          route="/tutor/analytics"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Music Library"
          icon={<Music size={20} className="text-white" />}
          route="/tutor/music-library"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="AI Music Coach"
          icon={<Bot size={20} className="text-white" />}
          route="/tutor/ai-coach"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Payment Summary"
          icon={<CreditCard size={20} className="text-white" />}
          route="/tutor/payments"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Refer & Earn"
          icon={<Gift size={20} className="text-white" />}
          route="/tutor/referrals"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <SidebarItem 
          title="Settings"
          icon={<Settings size={20} className="text-white" />}
          route="/tutor/settings"
          collapsed={sidebarCollapsed}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
        <div className="border-t border-white/20 my-4"></div>
        <SidebarItem 
          title="Logout" 
          icon={<LogOut size={20} className="text-white" />}
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
      bg-gradient-to-br from-[#6F09BA] via-[#8B1FD1] to-[#4A0680]
      ${isMobile ? 'h-full' : 'min-h-screen shadow-xl'}
      transition-all duration-300 ease-in-out
      ${isMobile ? 'pt-4' : 'pt-4'}
      flex flex-col
      shadow-2xl
    `}>
      <div className="flex flex-col flex-grow">
        {/* Logo */}
        <div className={`px-4 pb-6 ${sidebarCollapsed && !isMobile ? 'px-3' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}>
            <div className="text-white font-bold text-xl">
              {(!sidebarCollapsed || isMobile) ? 'UPKRAFT' : 'UK'}
            </div>
          </div>
        </div>

        {/* Collapse button - hidden on mobile */}
        {!isMobile && (
          <div className="px-4 pb-4 flex justify-end">
            <button 
              onClick={toggleSidebarCollapse} 
              className="text-white/70 hover:text-white transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div className="px-4 pb-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white capitalize">
              {userType} Menu
            </h2>
          </div>
        )}
        
        <div className={`space-y-1 px-2 flex-grow ${isMobile ? 'pt-2' : ''}`}>
          {getMenuItems()}
        </div>

        {/* Mobile footer */}
        {isMobile && (
          <div className="px-4 pt-4 border-t border-white/20 mt-4">
            <p className="text-xs text-white/70 text-center">
              UpKraft Learning Platform
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;