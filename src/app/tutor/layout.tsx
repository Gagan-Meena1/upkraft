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
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar2 />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar />
          {/* Dashboard Content */}
          <main className="flex-1 h-[calc(100vh-80px)] bg-[#FAF8F6] p-6">
            {children}
          </main>
        </div>
      </div>
    </ClientLayout>
  );
}
