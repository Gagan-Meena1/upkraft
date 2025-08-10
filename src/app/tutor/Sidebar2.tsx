"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

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
  CreditCard,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";

const Sidebar2 = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const pathname = usePathname();
  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/tutor" },
    {
      id: "my-students",
      label: "My Students",
      icon: Users,
      href: "/tutor/myStudents",
    },
    {
      id: "my-courses",
      label: "My Courses",
      icon: BookOpen,
      href: "/tutor/courses",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      href: "/tutor/calendar",
    },
    {
      id: "assignment",
      label: "Assignment",
      icon: FileText,
      hasDropdown: true,
      href: "/tutor/assignments",
      subItems: [
        { label: "Create Assignment", href: "/tutor/assignment/create" },
        // { label: "View Assignments", href: "/tutor/assignment/view" },
        // { label: "Grade Submissions", href: "/tutor/assignment/grade" },
      ],
    },
    {
      id: "students",
      label: "Student's",
      icon: GraduationCap,
      href: "/tutor/students",
    },
    { id: "tutors", label: "Tutor's", icon: User, href: "/tutor/tutors" },
    {
      id: "reports",
      label: "Report & Analytics",
      icon: BarChart3,
      href: "/tutor/reports",
    },
    {
      id: "music-library",
      label: "Music Library",
      icon: Music,
      href: "/tutor/music-library",
    },
    {
      id: "ai-coach",
      label: "AI Music Coach",
      icon: Bell,
      href: "/tutor/ai-coach",
    },
    {
      id: "payment",
      label: "Payment Summary",
      icon: CreditCard,
      href: "/tutor/payment",
    },
    {
      id: "refer-earn",
      label: "Refer & Earn",
      icon: Gift,
      href: "/tutor/refer-earn",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/tutor/settings",
    },
  ];
  const isActivePath = (href: string, id: string) => {
    if (id === "home") {
      return pathname === "/tutor";
    }
    return pathname.startsWith(href);
  };

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
  console.log("pathname", pathname);
  return (
    <div
      className={`bg-gradient-to-b min-h-screen from-[#4201EB] to-[#7109B9] text-white flex flex-col border-r border-gray-200 h-screen ${
        isMobile
          ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : sidebarOpen
          ? "w-64"
          : "w-16"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/tutor" className="cursor-pointer">
          <Image
            src="/upkraft.svg"
            alt="UpKraft"
            width={288}
            height={72}
            priority
            className="object-contain w-36 h-auto"
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-6 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={() => {
                  if (item.hasDropdown) {
                    setIsAssignmentOpen(!isAssignmentOpen);
                  }
                }}
                className={`w-full flex font-semibold text-[16px] items-center justify-between px-2 py-3 rounded-lg text-left transition-all duration-200 hover:bg-white hover:shadow-md hover:text-[#6F09BA] ${
                  // partial match for others
                  isActivePath(item.href, item.id)
                    ? "bg-white shadow-md text-[#6F09BA]"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasDropdown &&
                  (isAssignmentOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  ))}
              </Link>

              {/* Assignment Dropdown */}
              {item.hasDropdown && isAssignmentOpen && (
                <ul className="ml-8 mt-2 space-y-1">
                  {item.subItems?.map((subItem, index) => (
                    <li key={index}>
                      <Link
                        href={subItem.href}
                        className="w-full text-left px-3 py-2 text-sm text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-md transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-6 pb-6">
        <button
          onClick={async () => {
            try {
              const response = await fetch("/Api/users/logout");
              if (response.ok) {
                toast.success("Logged out successfully");
                router.push("/login");
              } else {
                toast.error("Failed to logout");
              }
            } catch (error) {
              toast.error("Error during logout");
              console.error("Logout error:", error);
            }
          }}
          className="w-full text-[#FFC357] text-[16px] flex items-center space-x-3 px-2 py-3 rounded-lg text-left transition-colors hover:bg-purple-500/50"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar2;
