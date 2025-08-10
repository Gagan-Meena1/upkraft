/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, Send, Bell, Menu } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
  username: string;
}

const Navbar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Get user initials for profile
  const getUserInitials = useCallback(() => {
    const name = userData?.username || "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [userData]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
        console.log("User Data:", userData.user);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <nav className="bg-[#FAF8F6] border-b border-gray-200 px-6 py-4 h-20">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        {!isMobile && (
          <div className="relative flex-1 max-w-xl text-[#505050]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={20}
            />
            <input
              type="text"
              placeholder="Search here"
              className="w-full pl-10  pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-[#505050]"
            />
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button
              aria-label="Toggle Sidebar"
              type="button"
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          {/* Send Icon */}
          <button
            aria-label="Send Message"
            type="button"
            className="p-3 bg-[#4200EA] text-white rounded-full cursor-pointer transition-colors"
          >
            <Send size={24} />
          </button>

          {/* Notification Bell */}
          <button
            aria-label="Notification bell"
            type="button"
            className="relative p-2 rounded-full bg-[#C4B0F9]/17 text-[#7A7A7A]  transition-colors"
          >
            <Bell size={32} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EE4B4B] rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              {/* <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              /> */}
              {getUserInitials()}
            </div>
            <div>
              <p className="font-semibold text-[#212121]">
                {userData?.username || "Loading..."}
              </p>
              <p className="text-sm text-[#505050]">Tutor</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
