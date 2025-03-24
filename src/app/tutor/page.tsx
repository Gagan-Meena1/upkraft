// components/Dashboard.jsx
"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Clock, Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [showAllClasses, setShowAllClasses] = useState(false);
  
  // Sample data for demonstration
  const username = "Sarah Johnson";
  const hoursCount = 187;
  const todayClasses = [
    { id: 1, title: "Advanced Mathematics", time: "10:00 AM - 11:30 AM", students: 24, room: "Room 102" },
    { id: 2, title: "Physics Fundamentals", time: "1:00 PM - 2:30 PM", students: 18, room: "Lab A" },
    { id: 3, title: "Computer Science", time: "3:00 PM - 4:30 PM", students: 22, room: "Tech Hub" },
  ];
  
  const pastClasses = [
    { id: 4, title: "Chemistry Lab", time: "March 11, 2025 (2:00 PM - 3:30 PM)", students: 15, room: "Lab B" },
    { id: 5, title: "English Literature", time: "March 10, 2025 (11:00 AM - 12:30 PM)", students: 28, room: "Room 205" },
    { id: 6, title: "World History", time: "March 9, 2025 (9:00 AM - 10:30 AM)", students: 26, room: "Room 304" },
    { id: 7, title: "Biology", time: "March 8, 2025 (1:00 PM - 2:30 PM)", students: 20, room: "Lab C" },
    { id: 8, title: "Art Workshop", time: "March 7, 2025 (3:00 PM - 5:00 PM)", students: 16, room: "Art Studio" },
  ];
  
  const displayClasses = showAllClasses ? [...todayClasses, ...pastClasses] : todayClasses;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-200 to-pink-600 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pink-200">Teacher Dashboard</h1>
            <p className="text-blue-100">Welcome back, {username}</p>
          </div>
          <Link href="/tutor/classes">
            <button className="bg-gradient-to-r from-pink-500 to-blue-500 text-gray-100 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-lg hover:from-pink-400 hover:to-blue-400">
              <Plus size={20} />
              Add New Session
            </button>
          </Link>
        </header>
        
        {/* Stats section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-300 to-blue-500 rounded-xl p-6 shadow-lg backdrop-blur-sm bg-opacity-80">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-red-700 rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-pink-400 p-2 rounded-md">
                    <Clock size={24} className="text-blue-50" />
                  </div>
                  <span className="text-blue-50 font-medium">Total Hours Taught</span>
                </div>
                <div className="text-4xl font-bold text-pink-200">{hoursCount}</div>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-red-700 rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-400 p-2 rounded-md">
                    <Users size={24} className="text-pink-50" />
                  </div>
                  <span className="text-pink-50 font-medium">Today's Classes</span>
                </div>
                <div className="text-4xl font-bold text-blue-200">{todayClasses.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Classes section */}
        <div className="bg-gradient-to-r from-blue-500 to-pink-400 rounded-xl p-6 shadow-lg mb-6 backdrop-blur-sm bg-opacity-80">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-pink-200">Classes</h2>
            <button 
              onClick={() => setShowAllClasses(!showAllClasses)}
              className="flex items-center gap-1 text-blue-200 hover:text-blue-100"
            >
              {showAllClasses ? 'Show Less' : 'View All'}
              {showAllClasses ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          <div className="space-y-4">
            {displayClasses.map((cls) => (
              <div key={cls.id} className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 hover:from-blue-500 hover:to-purple-500 transition-colors shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-pink-200">{cls.title}</h3>
                    <p className="text-blue-200">{cls.time}</p>
                    <div className="mt-2 flex gap-4">
                      <span className="text-pink-100 text-sm">{cls.students} Students</span>
                      <span className="text-blue-100 text-sm">{cls.room}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/tutor/studentFeedback/${cls.id}`}>
                      <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 p-2 rounded-md shadow-sm flex items-center gap-2 text-white whitespace-nowrap px-4">
                        <FileText size={18} className="text-pink-100" />
                        <span>Student Feedback</span>
                      </button>
                    </Link>
                    <button className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-500 hover:to-blue-500 p-2 rounded-md shadow-sm">
                      <Plus size={18} className="text-pink-100" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Session CTA (Highlighted as requested) */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-50 mb-2">Ready to add a new session?</h2>
              <p className="text-pink-100">Schedule your next class and manage your teaching hours efficiently.</p>
            </div>
            <Link href="/tutor/classes">
              <button className="bg-gradient-to-r from-pink-500 to-blue-500 text-gray-100 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-lg hover:from-pink-400 hover:to-blue-400">
                <Plus size={20} />
                Add New Session
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}