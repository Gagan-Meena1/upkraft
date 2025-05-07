"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import DashboardLayout from '@/app/components/DashboardLayout';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserData {
  _id?: string;
  username?: string;
  email?: string;
  category?: string;
  age?: number;
  address?: string;
  contact?: string;
  courses?: string[];
  isVerified?: boolean;
  isAdmin?: boolean;
  classes?: any[];
  createdAt?: string;
  updatedAt?: string;
}


const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/users/user");
        
        if (response.data && response.data.user) {
          setUserData(response.data.user);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-2xl font-light text-gray-800">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <DashboardLayout userData={userData || undefined} userType="admin">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold">Welcome, {userData?.username || 'Student'}!</h2>
      </div>

  
    </DashboardLayout>
  );
};

export default StudentDashboard;