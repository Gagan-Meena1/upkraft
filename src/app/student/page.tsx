"use client";
import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, TrendingUp, MessageSquare, DollarSign, Video, Menu, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";

// ... (previous interfaces remain the same)

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  route: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  title, 
  icon, 
  route
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/student/${route}`);
  };

  return (
    <div 
      className="border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={handleClick}
    >
      <div className="flex items-center py-2 px-4">
        {icon}
        <h3 className="text-md font-medium text-black ml-2">{title}</h3>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<{
    _id?: string;
    name?: string;
    email?: string;
    category?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upcoming classes data
  const upcomingClasses = [
    { 
      id: '1',
      date: '25 Mar', 
      time: '10:00 AM', 
      topic: 'Advanced Programming', 
      duration: '1.5h',
      instructor: 'Dr. Smith'
    },
    { 
      id: '2',
      date: '27 Mar', 
      time: '02:00 PM', 
      topic: 'Database Design', 
      duration: '2h',
      instructor: 'Prof. Johnson'
    },
    { 
      id: '3',
      date: '29 Mar', 
      time: '11:00 AM', 
      topic: 'Web Development', 
      duration: '1h',
      instructor: 'Ms. Williams'
    }
  ];

  const handleProfileClick = () => {
    router.push('/student/profile');
  };

  const handleViewAllClasses = () => {
    router.push('/student/classes');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/users/user");
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
    <div className="min-h-screen  bg-gradient-to-br from-gray-100 to-gray-100">
      {/* Header */}
      <header className="bg-gray-100 ">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-black"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-black p-4">UPKRAFT</h1>
          </div>
          
          {/* Profile Section */}
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
          >
            <div className="text-right mr-3">
              <div className="font-medium text-black">{userData?.name}</div>
              <div className="text-sm text-gray-600">{userData?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
              <User size={20} className="text-black" />
            </div>
          </div>
        </div>
      </header>
      

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'block' : 'hidden'} 
          md:block 
          w-full md:w-64 lg:w-64 
          bg-gray-100 border-r border-gray-100  
          p-3 md:min-h-screen 
          fixed md:sticky top-0 z-10 md:z-0
          overflow-y-auto
          transition-all duration-300
        `}>
          <div className="mt-16 md:mt-4 space-y-3">
            <SidebarItem 
              title="Student Profile" 
              icon={<User size={18} className="text-black" />}
              route="profile"
            />
            <SidebarItem 
              title="Tutor Profile" 
              icon={<User size={18} className="text-black" />}
              route="tutors"
            />
            <SidebarItem 
              title="Performance" 
              icon={<TrendingUp size={18} className="text-black" />}
              route="performance"
            />
            <SidebarItem 
              title="Class Quality" 
              icon={<Video size={18} className="text-black" />}
              route="class-quality"
            />
            <SidebarItem 
              title="Payment Summary" 
              icon={<DollarSign size={18} className="text-black" />}
              route="payments"
            />
            <SidebarItem 
              title="My Classes" 
              icon={<Calendar size={18} className="text-black" />}
              route="classes"
            />
            <SidebarItem 
              title="Feedback" 
              icon={<MessageSquare size={18} className="text-black" />}
              route="feedback"
            />
          </div>
        </aside>

        {/* Main Content */}
        {/* Main Content */}
<main className="flex-1 p-4 flex flex-col  items-center ">
  {/* Welcome Message */}
  {/* <h2 className="text-4xl font-bold text-black mb-30 text-center">
    Welcome To UPKRAFT, {userData?.name || 'Student'}!
  </h2> */}

  <div className="w-full h-full max-w-xxl">
    <div className="bg-white  h-full rounded-lg p-6">
      <div className="flex justify-between  mb-4">
        <h2 className="text-xl font-bold text-black">Upcoming Classes</h2>
        <button 
          onClick={handleViewAllClasses}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Scrollable Classes Container */}
      <div className="overflow-y-auto h-full space-y-4">
        {upcomingClasses.map((cls) => (
          <div 
            key={cls.id}
            className="bg-gray-100 rounded-lg p-4 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-semibold text-black">{cls.topic}</h3>
                <p className="text-sm text-gray-600">{cls.instructor}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{cls.date}</p>
                <p className="text-sm text-gray-500">{cls.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</main>
      </div>
    </div>
  );
};

export default StudentDashboard;