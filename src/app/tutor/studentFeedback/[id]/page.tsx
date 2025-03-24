// src/app/tutor/studentFeedback/[id]/page.tsx
"use client"

import React, { useState } from 'react';
import { ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface FeedbackCategory {
  name: string;
  value: number;
  description: string;
}

export default function StudentFeedback() {
  const params = useParams();
  const id = params.id;

  // Sample class data (you would fetch this based on the ID)
  const [classData, setClassData] = useState({
    id: id,
    title: "Advanced Music Theory",
    time: "10:00 AM - 11:30 AM",
    students: [],
    room: "Room 102"
  });

  // Sample student data (you would fetch this based on the class ID)
  const [students, setStudents] = useState([
    { id: 1, name: "Alex Johnson", photoUrl: "/placeholder-student.jpg" },
    { id: 2, name: "Jamie Smith", photoUrl: "/placeholder-student.jpg" },
    { id: 3, name: "Taylor Wilson", photoUrl: "/placeholder-student.jpg" }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [feedbackCategories, setFeedbackCategories] = useState<FeedbackCategory[]>([
    { name: "Attendance", value: 3, description: "Regularity and punctuality in attending classes" },
    { name: "Rhythm", value: 3, description: "Ability to maintain timing and follow musical rhythm" },
    { name: "Theoretical Understanding", value: 3, description: "Comprehension of musical concepts and theory" },
    { name: "Performance/Demonstration", value: 3, description: "Quality of musical performances" },
    { name: "Ear Training", value: 3, description: "Ability to recognize notes, intervals, and chords by ear" },
    { name: "Assignment", value: 3, description: "Completion and quality of assigned tasks" },
    { name: "Technique", value: 3, description: "Technical proficiency with instrument or voice" }
  ]);

  const handleSliderChange = (index: number, newValue: number) => {
    const updatedCategories = [...feedbackCategories];
    updatedCategories[index].value = newValue;
    setFeedbackCategories(updatedCategories);
  };

  const handleSaveFeedback = () => {
    if (!selectedStudent) {
      alert("Please select a student first");
      return;
    }

    // Here you would save the feedback to your database
    console.log("Saving feedback for student ID:", selectedStudent);
    console.log("Feedback categories:", feedbackCategories);
    console.log("Additional notes:", notes);

    // Show success message
    alert("Feedback saved successfully!");
    
    // Reset form or redirect as needed
    setNotes("");
    setSelectedStudent(null);
    // Reset sliders to default value
    setFeedbackCategories(prevCategories => 
      prevCategories.map(category => ({ ...category, value: 3 }))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-200 to-pink-600 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <Link href="/tutor">
              <button className="bg-blue-600 p-2 rounded-full">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-pink-200">Student Feedback</h1>
              <p className="text-blue-100">{classData.title} • {classData.time}</p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student selection panel */}
          <div className="bg-gradient-to-r from-blue-500 to-pink-400 rounded-xl p-6 shadow-lg backdrop-blur-sm bg-opacity-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-400 p-2 rounded-md">
                <Users size={24} className="text-blue-50" />
              </div>
              <h2 className="text-xl font-bold text-pink-200">Select Student</h2>
            </div>

            <div className="space-y-3 mt-4">
              {students.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedStudent === student.id 
                      ? 'bg-gradient-to-r from-pink-600 to-blue-600 shadow-md' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    {/* Placeholder for student photo */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-300 to-pink-300 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{student.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-pink-200">{student.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-500 to-pink-400 rounded-xl p-6 shadow-lg backdrop-blur-sm bg-opacity-80 mb-6">
              <h2 className="text-2xl font-bold text-pink-200 mb-6">Performance Assessment</h2>
              
              {selectedStudent ? (
                <div className="space-y-6">
                  {feedbackCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-100">{category.name}</h3>
                          <p className="text-sm text-pink-100">{category.description}</p>
                        </div>
                        <span className="text-2xl font-bold text-pink-200">{category.value}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={category.value}
                        onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-xs text-blue-200">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-blue-100 mb-2">Additional Notes</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-lg bg-blue-600 text-pink-100 placeholder-blue-300 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Add any specific observations, recommendations, or notes about the student's progress..."
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleSaveFeedback}
                    className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-gray-100 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-lg hover:from-pink-400 hover:to-blue-400"
                  >
                    <Save size={20} />
                    Save Feedback
                  </button>
                </div>
              ) : (
                <div className="bg-blue-600 rounded-lg p-8 text-center">
                  <p className="text-pink-200 text-lg">Please select a student to provide feedback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}