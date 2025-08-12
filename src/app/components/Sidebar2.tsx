"use client";

import React, { useState } from "react";
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  User,
  BarChart3,
  Music,
  Bot,
  CreditCard,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";

const Sidebar2 = () => {
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "my-students", label: "My Students", icon: Users },
    { id: "my-courses", label: "My Courses", icon: BookOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    {
      id: "assignment",
      label: "Assignment",
      icon: FileText,
      hasDropdown: true,
      subItems: ["Create Assignment", "View Assignments", "Grade Submissions"],
    },
    { id: "students", label: "Student's", icon: GraduationCap },
    { id: "tutors", label: "Tutor's", icon: User },
    { id: "reports", label: "Report & Analytics", icon: BarChart3 },
    { id: "music-library", label: "Music Library", icon: Music },
    { id: "ai-coach", label: "AI Music Coach", icon: Bell },
    { id: "payment", label: "Payment Summary", icon: CreditCard },
    { id: "refer-earn", label: "Refer & Earn", icon: Gift },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div 
      className="w-[240px] bg-gradient-to-b from-[#4201EB] to-[#7109B9] h-screen text-white flex flex-col"
      style={{
        overflow: 'hidden'
      }}
    >
      {/* Logo */}
      <div className="p-3 flex-shrink-0">
        <img src="upkraft.svg" alt="Upkraft" className="h-6" />
      </div>

      {/* Navigation Menu - NO SCROLL, FIXED HEIGHT */}
      <div 
        className="flex-1 px-3"
        style={{
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 120px)'
        }}
      >
        <ul className="space-y-0">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveItem(item.id);
                  if (item.hasDropdown) {
                    setIsAssignmentOpen(!isAssignmentOpen);
                  }
                }}
                className={`w-full flex font-medium text-[12px] items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all duration-200 hover:bg-white hover:shadow-md hover:text-[#6F09BA] ${
                  activeItem === item.id
                    ? "bg-white shadow-md text-[#6F09BA]"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon size={14} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasDropdown &&
                  (isAssignmentOpen ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  ))}
              </button>
              
              {/* Assignment Dropdown */}
              {item.hasDropdown && isAssignmentOpen && (
                <ul className="ml-4 mt-0.5 space-y-0">
                  {item.subItems?.map((subItem, index) => (
                    <li key={index}>
                      <button className="w-full text-left px-2 py-1 text-[10px] text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-md transition-colors">
                        {subItem}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout - Fixed at bottom */}
      <div className="px-3 pb-3 flex-shrink-0">
        <button className="w-full text-[#FFC357] text-[12px] flex items-center space-x-2 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-purple-500/50">
          <LogOut size={14} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar2;