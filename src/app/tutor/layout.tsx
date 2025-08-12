// app/tutor/layout.tsx
import React from "react";
import ClientLayout from "../components/ClientLayout";
import Sidebar2 from "./Sidebar2";
import Navbar from "./Navbar";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar - Fixed */}
        <Sidebar2 />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Navbar - Fixed at top */}
          <Navbar />
          
          {/* Dashboard Content - Scrollable */}
          <main className="flex-1 bg-[#FAF8F6] p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ClientLayout>
  );
}