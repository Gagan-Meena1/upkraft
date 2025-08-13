// app/tutor/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import ClientLayout from "../components/ClientLayout";
import Sidebar2 from "./Sidebar2";
import Navbar from "./Navbar";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile and manage sidebar state
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

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar - Fixed Position */}
        <Sidebar2 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main Content Container */}
        <div 
          className={`
            transition-all duration-300
            ${isMobile 
              ? 'ml-0' 
              : sidebarOpen 
                ? 'ml-64' 
                : 'ml-16'
            }
          `}
        >
          {/* Navbar - Fixed at top with dynamic positioning */}
          <Navbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
          />

          {/* Main Content - Scrollable with top margin for fixed navbar */}
          <main className="pt-20 bg-[#FAF8F6] p-6 min-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ClientLayout>
  );
}