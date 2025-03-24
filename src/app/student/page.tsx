"use client";
import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, TrendingUp, MessageSquare, DollarSign, Video, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";

interface User {
  username: string;
  id: string;
  category: string;
  email: string;
}

interface StudentData {
  student: {
    name: string;
    email: string;
  };
  tutor: {
    id: string;
    name: string;
    expertise: string;
    rating: number;
    totalClasses: number;
  };
  course: {
    id: string;
    name: string;
    progress: number;
    totalModules: number;
    completedModules: number;
  };
  performance: {
    averageScore: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    lastAssessment: string;
  };
  classQuality: {
    avgRating: number;
    lastClassRating: number;
    internetQuality: string;
    audioVisualQuality: string;
  };
  feedback: Array<{
    date: string;
    message: string;
  }>;
  payments: {
    totalPaid: string;
    nextPayment: string;
    paymentPlan: string;
    outstanding: string;
  };
  upcomingClasses: Array<{
    date: string;
    time: string;
    topic: string;
  }>;
}

// Add field mappings for navigation
const cardFieldMappings: Record<string, string> = {
  'Student Profile': 'profile',
  'Tutor Profile': 'tutor',
  'Course Information': 'course',
  'Performance': 'performance',
  'Class Quality': 'class-quality',
  'Feedback': 'feedback',
  'Payment Summary': 'payments',
  'My Classes': 'classes'
};

interface CardProps {
  title: string;
  icon: React.ReactNode;
  fieldName: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<CardProps> = ({ title, icon, fieldName, children, className = "" }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/student/${fieldName}`);
  };

  return (
    <div 
      className={`bg-gray-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-black">{title}</h3>
      </div>
      <div className="space-y-2 text-gray-800">
        {children}
      </div>
    </div>
  );
};

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  title, 
  icon, 
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-300 pb-3">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {icon}
          <h3 className="text-md font-medium text-black">{title}</h3>
        </div>
        <div className="text-black">
          {isExpanded ? "-" : "+"}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2 pl-6 space-y-1 text-gray-700 text-sm">
          {children}
        </div>
      )}
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<{
    _id?: string;
    name?: string;
    email?: string;
    category?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // This is default data to use while real data is loading or if there's an error
  const defaultStudentData: StudentData = {
    student: {
      name: userData?.name || "Unknown Student",
      email: userData?.email || "Unknown Email",
    },
    tutor: {
      id: 'TU54321',
      name: 'Dr. Sarah Williams',
      expertise: 'Computer Science',
      rating: 4.8,
      totalClasses: 24
    },
    course: {
      id: 'CS101',
      name: 'Introduction to Programming',
      progress: 65,
      totalModules: 12,
      completedModules: 8
    },
    performance: {
      averageScore: 87,
      assignmentsCompleted: 15,
      totalAssignments: 18,
      lastAssessment: '92%'
    },
    classQuality: {
      avgRating: 4.5,
      lastClassRating: 5,
      internetQuality: 'Good',
      audioVisualQuality: 'Excellent'
    },
    feedback: [
      { date: '15 Mar 2024', message: 'Great progress on the last assignment!' },
      { date: '02 Mar 2024', message: 'Need to focus more on algorithms' }
    ],
    payments: {
      totalPaid: '$1200',
      nextPayment: '15 Apr 2024',
      paymentPlan: 'Monthly',
      outstanding: '$0'
    },
    upcomingClasses: [
      { date: '25 Mar 2024', time: '10:00 AM', topic: 'Advanced Functions' },
      { date: '28 Mar 2024', time: '10:00 AM', topic: 'Object Oriented Programming' }
    ]
  };

  // Use the userData to update the student info in defaultStudentData
  const studentData: StudentData = {
    ...defaultStudentData,
    student: {
      name: userData?.name || "Unknown Student",
      email: userData?.email || "Unknown Email",
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/users/user");
        console.log("User data received:", response.data);
        setUserData(response.data);
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-200 to-white">
        <div className="text-2xl text-black">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-200 to-white">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-100">
      {/* Header */}
      <header className="bg-gray-100  p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-black"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-black">UPKRAFT</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">{studentData.student.name}</div>
              <div className="text-sm text-gray-500">{studentData.student.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
              <User size={20} className="text-black" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <aside className={`
          ${sidebarOpen ? 'block' : 'hidden'} 
          md:block 
          w-full md:w-64 lg:w-72 
          bg-gray-100 border-r border-gray-200 shadow-md 
          p-3 md:min-h-screen 
          fixed md:sticky top-0 z-10 md:z-0
          overflow-y-auto
          transition-all duration-300
        `}>
          <div className="mt-16 md:mt-4 space-y-3">
            {/* Student Profile */}
            <SidebarItem 
              title="Student Profile" 
              icon={<User size={18} className="text-black mr-2" />}
            >
              <p><span className="font-medium">Name:</span> {studentData.student.name}</p>
              <p><span className="font-medium">Email:</span> {studentData.student.email}</p>
            </SidebarItem>

            {/* Tutor Profile */}
            <SidebarItem 
              title="Tutor Profile" 
              icon={<User size={18} className="text-black mr-2" />}
            >
              <p><span className="font-medium">Name:</span> {studentData.tutor.name}</p>
              <p><span className="font-medium">Expertise:</span> {studentData.tutor.expertise}</p>
              <p><span className="font-medium">Rating:</span> {studentData.tutor.rating}/5</p>
              <p><span className="font-medium">Classes:</span> {studentData.tutor.totalClasses}</p>
            </SidebarItem>

            {/* Performance */}
            <SidebarItem 
              title="Performance" 
              icon={<TrendingUp size={18} className="text-black mr-2" />}
            >
              <p><span className="font-medium">Average:</span> {studentData.performance.averageScore}%</p>
              <p><span className="font-medium">Assignments:</span> {studentData.performance.assignmentsCompleted}/{studentData.performance.totalAssignments}</p>
              <p><span className="font-medium">Last Score:</span> {studentData.performance.lastAssessment}</p>
            </SidebarItem>

            {/* Class Quality */}
            <SidebarItem 
              title="Class Quality" 
              icon={<Video size={18} className="text-black mr-2" />}
            >
              <p><span className="font-medium">Avg Rating:</span> {studentData.classQuality.avgRating}/5</p>
              <p><span className="font-medium">Last Class:</span> {studentData.classQuality.lastClassRating}/5</p>
              <p><span className="font-medium">Internet:</span> {studentData.classQuality.internetQuality}</p>
              <p><span className="font-medium">A/V:</span> {studentData.classQuality.audioVisualQuality}</p>
            </SidebarItem>

            {/* Payment Summary */}
            <SidebarItem 
              title="Payment Summary" 
              icon={<DollarSign size={18} className="text-black mr-2" />}
            >
              <p><span className="font-medium">Total:</span> {studentData.payments.totalPaid}</p>
              <p><span className="font-medium">Next:</span> {studentData.payments.nextPayment}</p>
              <p><span className="font-medium">Plan:</span> {studentData.payments.paymentPlan}</p>
              <p><span className="font-medium">Outstanding:</span> {studentData.payments.outstanding}</p>
            </SidebarItem>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Welcome Banner */}
          <div className="relative py-10 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-6xl md:text-8xl font-bold text-sky-200 opacity-20">UPKRAFT</h1>
            </div>
            <div className="relative container mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-black">
                Welcome to Upkraft, {studentData.student.name}!
              </h2>
            </div>
          </div>

          {/* Spacer to bring cards down */}
          <div className="h-16"></div>

          {/* Middle Content - Featured Cards */}
          <div className="container mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Course Information */}
              <DashboardCard 
                title="Course Information" 
                icon={<BookOpen size={24} className="text-black mr-2" />}
                fieldName={cardFieldMappings["Course Information"]}
                className="lg:col-span-1"
              >
                <p><span className="font-medium">Course:</span> {studentData.course.name}</p>
                <p><span className="font-medium">Progress:</span> {studentData.course.progress}%</p>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                  <div 
                    className="bg-orange-800 h-2 rounded-full" 
                    style={{ width: `${studentData.course.progress}%` }}
                  ></div>
                </div>
                <p className="mt-2"><span className="font-medium">Modules:</span> {studentData.course.completedModules}/{studentData.course.totalModules}</p>
              </DashboardCard>

              {/* My Classes */}
              <DashboardCard 
                title="My Classes" 
                icon={<Calendar size={24} className="text-black mr-2" />}
                fieldName={cardFieldMappings["My Classes"]}
                className="lg:col-span-1"
              >
                <div className="space-y-4">
                  {studentData.upcomingClasses.map((cls, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded mr-3 text-center">
                        <div className="text-xs font-semibold">{cls.date.split(' ')[0]}</div>
                        <div className="text-sm">{cls.date.split(' ')[1]}</div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{cls.topic}</p>
                        <p className="text-sm text-gray-600">{cls.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              {/* Feedback */}
              <DashboardCard 
                title="Feedback" 
                icon={<MessageSquare size={24} className="text-black mr-2" />}
                fieldName={cardFieldMappings["Feedback"]}
                className="lg:col-span-1"
              >
                <div className="space-y-4">
                  {studentData.feedback.map((item, index) => (
                    <div key={index} className="border-l-4 border-orange-800 pl-3 py-1">
                      <p className="text-sm text-gray-500">{item.date}</p>
                      <p className="text-gray-800">{item.message}</p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; 2025 UPKRAFT. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;