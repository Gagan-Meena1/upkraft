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

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

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
    <nav
      className={`
        fixed top-0 right-0 z-30
        bg-[#FAF8F6]
        w-full h-auto
        min-h-[64px]
        px-5 py-3 
        flex items-center justify-between
        transition-all duration-300
        border-b border-[#EEEEEE]
        ${isMobile 
          ? 'left-0' 
          : sidebarOpen 
            ? 'left-64' 
            : 'left-16'
        }
      `}
    >
      {/* Left Section */}
      <div className="flex items-center w-full max-w-md">
        {isMobile && (
          <button
            aria-label="Toggle Sidebar"
            type="button"
            onClick={toggleSidebar}
            className="p-2 mr-4 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        )}

        {!isMobile && (
          <div className="relative flex-1 items-center gap-[10px] h-[44px] bg-white rounded-lg shadow px-[12px] text-[#505050] flex">
            <Search className="text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search here"
              className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-[#505050]"
            />
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-[16px] pr-65">
        <button
          aria-label="Send Message"
          type="button"
          className="p-3 bg-[#4200EA] text-white rounded-full cursor-pointer transition-colors"
        >
          <Send className="w-2 h-2 sm:w-3 sm:h-3" />
        </button>

        <button
          aria-label="Notification bell"
          type="button"
          className="relative p-2 rounded-full bg-[#C4B0F9]/17 text-[#7A7A7A]"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EE4B4B] rounded-full"></span>
        </button>

        {/* User Profile with Divider */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <p className="font-semibold text-[#212121]">
                {userData?.username || "Loading..."}
              </p>
              <p className="text-sm text-[#505050]">Tutor</p>
            </div>
          </div>
      </div>
    </nav>

  );
};

export default Navbar;