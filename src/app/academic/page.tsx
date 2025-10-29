"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Users,
  PlusCircle,
  User,
  BookMarkedIcon,
  BookCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { PiNutBold } from "react-icons/pi";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import LogoHeader from "../../assets/LogoHeader.png";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Author from "../../assets/author.png";
import SideMenuHeader from "../components/SideMenuHeader";

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
}

export default function AcademicDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const role = "academic";
  const isActive = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/Api/users/user");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/Api/users/logout", {
        method: "GET",
      });
      
      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/academic" className="ml-4 lg:ml-0">
                <Image
                  src={LogoHeader}
                  alt="UpKraft"
                  width={120}
                  height={40}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={Author}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="hidden sm:block">{userData?.username}</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/academic/profile">Profile</Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 bg-white shadow-sm`}>
          <div className="p-4">
            <nav className="space-y-2">
              <Link
                href="/academic"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive("/academic")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                href="/academic/courses"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive("/academic/courses")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BookOpen className="mr-3 h-5 w-5" />
                Courses
              </Link>
              
              <Link
                href="/academic/students"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive("/academic/students")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                Students
              </Link>
              
              <Link
                href="/academic/assignments"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive("/academic/assignments")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BookCheck className="mr-3 h-5 w-5" />
                Assignments
              </Link>
              
              <Link
                href="/academic/calendar"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive("/academic/calendar")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Calendar
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Academic Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {userData?.username}! Manage your academic activities.
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Courses</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Assignments</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Upcoming Classes</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-center py-8">
                  No recent activity to display.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

