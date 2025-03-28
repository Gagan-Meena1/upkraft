"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Book, CreditCard, FileText, ChevronDown, ChevronUp } from 'lucide-react';

// Course interface for type safety
interface Course {
  id: string;
  name: string;
  instructor: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  paymentPackages: {
    duration: number;
    price: number;
    discount: number;
  }[];
  curriculum: string[];
  tags: string[];
}

// Example courses data
const exampleCourses: Course[] = [
  {
    id: '1',
    name: 'Web Development Bootcamp',
    instructor: 'Michael Chen',
    description: 'Comprehensive web development course covering front-end and back-end technologies with hands-on projects.',
    duration: 6,
    difficulty: 'Intermediate',
    paymentPackages: [
      { duration: 1, price: 199, discount: 0 },
      { duration: 3, price: 499, discount: 15 },
      { duration: 6, price: 899, discount: 25 },
      { duration: 12, price: 1499, discount: 35 }
    ],
    curriculum: [
      'HTML & CSS Fundamentals',
      'JavaScript Advanced Concepts',
      'React.js Development',
      'Node.js & Express Backend',
      'Database Integration',
      'Deployment & DevOps'
    ],
    tags: ['Web Development', 'Full Stack', 'Programming']
  },
  {
    id: '2',
    name: 'Data Science Masterclass',
    instructor: 'Dr. Sarah Johnson',
    description: 'Intensive data science program covering statistical analysis, machine learning, and data visualization.',
    duration: 6,
    difficulty: 'Advanced',
    paymentPackages: [
      { duration: 1, price: 249, discount: 0 },
      { duration: 3, price: 649, discount: 15 },
      { duration: 6, price: 1199, discount: 25 },
      { duration: 12, price: 1999, discount: 35 }
    ],
    curriculum: [
      'Python for Data Science',
      'Statistical Analysis',
      'Machine Learning Algorithms',
      'Deep Learning Basics',
      'Data Visualization',
      'Capstone Project'
    ],
    tags: ['Data Science', 'Machine Learning', 'Python']
  },
  {
    id: '3',
    name: 'Digital Marketing Strategy',
    instructor: 'Emma Rodriguez',
    description: 'Comprehensive digital marketing course covering all aspects of online marketing and brand strategy.',
    duration: 4,
    difficulty: 'Intermediate',
    paymentPackages: [
      { duration: 1, price: 149, discount: 0 },
      { duration: 3, price: 399, discount: 15 },
      { duration: 6, price: 699, discount: 25 },
      { duration: 12, price: 1199, discount: 35 }
    ],
    curriculum: [
      'Social Media Marketing',
      'SEO Fundamentals',
      'Content Marketing',
      'Google Ads',
      'Analytics & Reporting',
      'Personal Branding'
    ],
    tags: ['Marketing', 'Digital Strategy', 'Social Media']
  }
];

export default function CoursesDashboard() {
  const router = useRouter();
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const toggleCourseDetails = (courseId: string) => {
    setExpandedCourseId(prevId => prevId === courseId ? null : courseId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-100 p-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-orange-500">Our Courses</h1>
        <button 
          onClick={() => router.push('/student')}
          className="hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exampleCourses.map((course) => (
          <div 
            key={course.id} 
            className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105"
          >
            {/* Course Card Header */}
            <div 
              onClick={() => toggleCourseDetails(course.id)}
              className="p-6 bg-gray-500 text-white flex justify-between items-center cursor-pointer hover:bg-orange-500 transition-colors"
            >
              <div>
                <h2 className="text-2xl font-bold">{course.name}</h2>
                <p className="text-white">{course.instructor}</p>
              </div>
              {expandedCourseId === course.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Expandable Course Details */}
            {expandedCourseId === course.id && (
              <div className="p-6 space-y-4 bg-blue-50">
                {/* Course Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="text-blue-500" size={20} />
                    <span>{course.duration} Months Duration</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Book className="text-blue-500" size={20} />
                    <span>{course.difficulty} Level</span>
                  </div>
                </div>

                {/* Course Description */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Course Description</h3>
                  <p className="text-gray-600">{course.description}</p>
                </div>

                {/* Payment Packages */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Payment Packages</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {course.paymentPackages.map((pkg) => (
                      <div 
                        key={pkg.duration} 
                        className="bg-white p-4 rounded-lg shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <CreditCard className="text-blue-500" size={20} />
                          <span className="font-bold text-blue-700">
                            {pkg.duration} Month{pkg.duration > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-gray-600">
                            <span className="line-through text-gray-400">
                              ${pkg.price * (1 + pkg.discount / 100)}
                            </span>{' '}
                            <span className="font-bold text-green-600">
                              ${pkg.price} ({pkg.discount}% OFF)
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Curriculum</h3>
                  <ul className="space-y-2">
                    {course.curriculum.map((item, index) => (
                      <li 
                        key={index} 
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <FileText className="text-blue-500" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {course.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}