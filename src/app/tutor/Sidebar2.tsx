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
  Music,
  CreditCard,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
  Archive,
} from "lucide-react";

const Sidebar2 = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const rawPath = usePathname();
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    if (rawPath) setPathname(rawPath);
  }, [rawPath]);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/tutor" },
    { id: "my-students", label: "My Students", icon: Users, href: "/tutor/myStudents" },
    { id: "my-courses", label: "My Courses", icon: BookOpen, href: "/tutor/courses" },
    { id: "calendar", label: "Calendar", icon: Calendar, href: "/tutor/calendar" },
    {
      id: "assignment",
      label: "Assignment",
      icon: FileText,
      href: "/tutor/assignments",
    },
    { id: "music-library", label: "Music Library", icon: Music, href: "/tutor/music-library" },
    {
      id: "myArchieve",
      label: "My Archive",
      icon: Archive, // still using the Archive icon
      href: "/tutor/myArchieve",
    },
    { id: "ai-coach", label: "AI Music Coach", icon: Bell, href: "/visualizer.html" },
    { id: "payment", label: "Payment Summary", icon: CreditCard, href: "/tutor/payment" },
    { id: "refer-earn", label: "Refer & Earn", icon: Gift, href: "/tutor/refer-earn" },
    { id: "settings", label: "Settings", icon: Settings, href: "/tutor/settings" },
  ];

  const isActivePath = (href: string, id: string) => {
    if (!pathname) return false;
    if (id === "home") return pathname === "/tutor";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
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
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-gradient-to-b from-[#4201EB] to-[#7109B9] text-white 
          border-r border-purple-400/20
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobile
            ? (sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full w-64")
            : (sidebarOpen ? "w-64" : "w-20")
          }
        `}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-6 border-b border-purple-400/20">
          <Link href="/tutor" className="block">
            <Image
              src="/upkraft.svg"
              alt="UpKraft"
              width={288}
              height={72}
              priority
              className={`object-contain w-full h-auto transition-all duration-300 ${!isMobile && !sidebarOpen ? 'opacity-0 w-0' : 'opacity-100'
                }`}
            />
          </Link>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(e) => {

                    if (isMobile) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    group flex items-center justify-between
                    px-3 py-3 rounded-lg
                    font-medium text-base
                    transition-all duration-200
                    hover:bg-white/10 hover:shadow-lg hover:translate-x-1
                    ${isActivePath(item.href, item.id)
                      ? "bg-white text-[#6F09BA] shadow-lg"
                      : "text-white"
                    }
                    ${!isMobile && !sidebarOpen ? 'justify-center px-0' : ''}
                  `}
                >
                  <div className={`flex items-center min-w-0 ${!isMobile && !sidebarOpen ? '' : 'gap-3'}`}>
                    <item.icon
                      size={20}
                      className={`flex-shrink-0 ${!isMobile && !sidebarOpen ? 'mx-auto' : ''}`}
                    />
                    {(isMobile || sidebarOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {(isMobile || sidebarOpen) && (
                    <div className="flex-shrink-0">
                      {isAssignmentOpen ? (
                        <ChevronDown size={16} className="transition-transform" />
                      ) : (
                        <ChevronRight size={16} className="transition-transform" />
                      )}
                    </div>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {isAssignmentOpen && (isMobile || sidebarOpen) && (
                  <ul className="mt-2 ml-6 space-y-1 border-l-2 border-purple-400/30 pl-4">
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (isMobile) {
                            setSidebarOpen(false);
                          }
                        }}
                        className="block px-3 py-2 text-sm text-purple-200 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-purple-400/20">
          <button
            onClick={handleLogout}
            className={`
              group w-full flex items-center
              px-3 py-3 rounded-lg
              font-medium text-base
              text-[#FFC357] hover:text-white
              transition-all duration-200
              hover:bg-white/10 hover:shadow-lg
              ${!isMobile && !sidebarOpen
                ? 'justify-center px-0'
                : 'gap-3'
              }
            `}
          >
            <LogOut size={20} className={`flex-shrink-0 ${!isMobile && !sidebarOpen ? 'mx-auto' : ''}`} />
            {(isMobile || sidebarOpen) && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar2;