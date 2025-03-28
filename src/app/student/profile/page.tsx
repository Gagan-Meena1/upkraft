"use client";

import React, { useState, useEffect } from 'react';
import { Pencil, Plus } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';


// Define the type for user data
interface UserData {
  _id: string;
  name: string;
  email: string;
  category?: string;
  age?: number;
  address?: string;
  contact?: string;
  courses?: string[];
  createdAt: string;
}

// Define the type for editable fields
interface EditableField {
  key: keyof UserData;
  label: string;
  type: 'text' | 'number' | 'email';
}

export default function StudentProfilePage() {
    const router = useRouter();

  // State for user data and editing
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editingField, setEditingField] = useState<keyof UserData | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    personalInfo: true,
    contactInfo: true,
    accountInfo: true  // Add this line

  });

  // Editable fields configuration
  const editableFields: EditableField[] = [
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'contact', label: 'Contact', type: 'text' },
  ];

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/Api/users/user', { withCredentials: true });
        // if (!response) {
        //   throw new Error('Failed to fetch user data');
        // }
        setUserData(response.data);
        console.log("11111111");
        
        console.log(response.data);// comsoling data
        console.log(response.data);
        console.log("222222222");
        
        
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle field editing
  const handleEditField = (field: keyof UserData) => {
    setEditingField(field);
    setEditValue(userData?.[field]?.toString() || '');
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-2xl text-gray-700">Loading profile...</p>
      </div>
    );
  }

  // Render error state
  if (error || !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-2xl text-red-600">{error || 'Unable to load profile data'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <div className="max-w-xxl mx-auto bg-white   overflow-hidden">
        {/* Profile Header - Updated with Dashboard Button */}
        <div className="bg-orange-400 text-white p-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">{userData.name}</h1>
            <p className="text-xl text-blue-100 mt-2">{userData.email}</p>
          </div>
          <button 
            onClick={() => router.push('/student')}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
        {/* Profile Content */}
        <div className="p-8 space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gray-100 rounded-xl">
            <div 
              onClick={() => toggleSection('personalInfo')} 
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              <span className="text-gray-600">
                {expandedSections.personalInfo ? '▼' : '►'}
              </span>
            </div>
            
            {expandedSections.personalInfo && (
              <div className="p-6 pt-0 space-y-4">
                {editableFields.map((field) => (
                  <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-lg font-medium text-gray-700">{field.label}</label>
                    {editingField === field.key ? (
                      <div className="col-span-2 flex space-x-2">
                        <input
                          type={field.type}
                          value={editValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button 
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingField(null)} 
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="col-span-2 flex justify-between items-center">
                        <p className="text-lg text-gray-800">
                          {userData[field.key]?.toString() || 'Not provided'}
                        </p>
                        <button 
                          onClick={() => handleEditField(field.key)} 
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {userData[field.key] ? '✏️' : '➕'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Courses Section */}
          <div className="bg-gray-100 rounded-xl">
            <div 
              onClick={() => toggleSection('courseInfo')} 
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-800">Courses</h2>
              <span className="text-gray-600">
                {expandedSections.courseInfo ? '▼' : '►'}
              </span>
            </div>
            
            {expandedSections.courseInfo && (
              <div className="p-6 pt-0">
                {userData.courses && userData.courses.length > 0 ? (
                  <ul className="space-y-2">
                    {userData.courses.map((course, index) => (
                      <li 
                        key={index} 
                        className="bg-white p-4 rounded-lg shadow-sm text-lg text-gray-800"
                      >
                        {course}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-lg">No courses enrolled</p>
                )}
              </div>
            )}
          </div>

          {/* Account Information Section */}
          <div className="bg-gray-100 rounded-xl">
            <div 
              onClick={() => toggleSection('accountInfo')} 
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-800">Account Information</h2>
              <span className="text-gray-600">
                {expandedSections.accountInfo ? '▼' : '►'}
              </span>
            </div>
            
            {expandedSections.accountInfo && (
              <div className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-lg font-medium text-gray-700">Account Created</label>
                  <p className="col-span-2 text-lg text-gray-800">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}