"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Briefcase, GraduationCap, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// Tutor interface for type safety
interface Tutor {
  id: string;
  name: string;
  category: string;
  experience: number;
  age: number;
  city: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  qualification: string;
  subjects: string[];
  hourlyRate: number;
}

// Example tutors data (will be replaced with API data later)
const exampleTutors: Tutor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    category: 'Mathematics',
    experience: 8,
    age: 35,
    city: 'New York',
    mode: 'Online',
    qualification: 'PhD in Mathematics',
    subjects: ['Algebra', 'Calculus', 'Statistics'],
    hourlyRate: 50
  },
  {
    id: '2',
    name: 'Michael Chen',
    category: 'Computer Science',
    experience: 6,
    age: 29,
    city: 'San Francisco',
    mode: 'Hybrid',
    qualification: 'Master in Computer Science',
    subjects: ['Programming', 'Web Development', 'Machine Learning'],
    hourlyRate: 65
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    category: 'Languages',
    experience: 10,
    age: 42,
    city: 'Chicago',
    mode: 'Offline',
    qualification: 'MA in Linguistics',
    subjects: ['English', 'Spanish', 'Translation Studies'],
    hourlyRate: 45
  }
];

export default function TutorsDashboard() {
  const router = useRouter();
  
  // State to track which specific tutor is expanded
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);

  const toggleTutorDetails = (tutorId: string) => {
    // If the clicked tutor is already expanded, collapse it
    // Otherwise, expand the clicked tutor
    setExpandedTutorId(prevId => prevId === tutorId ? null : tutorId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 p-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-orange-500">Our Tutors</h1>
        <button 
          onClick={() => router.push('/student')}
          className="hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exampleTutors.map((tutor) => (
          <div 
            key={tutor.id} 
            className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105"
          >
            {/* Tutor Card Header */}
            <div 
              onClick={() => toggleTutorDetails(tutor.id)}
              className="p-6 bg-gray-500 text-white flex justify-between items-center cursor-pointer hover:bg-orange-500 transition-colors"
            >
              <div>
                <h2 className="text-2xl font-bold">{tutor.name}</h2>
                <p className="text-white">{tutor.category}</p>
              </div>
              {expandedTutorId === tutor.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Expandable Tutor Details */}
            {expandedTutorId === tutor.id && (
              <div className="p-6 space-y-4 bg-blue-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="text-blue-500" size={20} />
                    <span>{tutor.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="text-blue-500" size={20} />
                    <span>{tutor.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <GraduationCap className="text-blue-500" size={20} />
                    <span>{tutor.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="text-blue-500" size={20} />
                    <span>{tutor.mode} Classes</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject) => (
                      <span 
                        key={subject} 
                        className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-blue-700">
                    ${tutor.hourlyRate}/hour
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}