"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Home, User, BookOpen, Calendar, TrendingUp, MessageSquare, IndianRupee, Video, Menu, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import DashboardLayout from '@/app/components/DashboardLayout'; // Adjust the path as needed

// interface SidebarItemProps {
//   title: string;
//   icon: React.ReactNode;
//   route: string;
//   collapsed: boolean;
// }

interface Tutor {
  _id: string;
  username: string;
  email: string;
  contact: string;
  expertise?: string[];
  rating?: number;
  bio?: string;
}

// const SidebarItem: React.FC<SidebarItemProps> = ({ 
//   title, 
//   icon, 
//   route,
//   collapsed
// }) => {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push(`/student/${route}`);
//   };

//   return (
//     <div 
//       className={`cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-lg my-1 ${collapsed ? 'py-3 px-3' : 'py-2 px-4'}`}
//       onClick={handleClick}
//     >
//       <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
//         <div className={`${collapsed ? 'text-gray-700' : 'text-gray-700'}`}>
//           {icon}
//         </div>
//         {!collapsed && <h3 className="text-md font-medium text-gray-700 ml-3 whitespace-nowrap">{title}</h3>}
//       </div>
//     </div>
//   );
// };

export default function TutorsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [userData, setUserData] = useState<any | null>(null);

  // Define sidebar items array
  // const sidebarItems = [
  //   { title: "Home", icon: <Home size={20} className="text-gray-700" />, route: "/" },
  //   { title: "Student Profile", icon: <User size={20} className="text-gray-700" />, route: "profile" },
  //   { title: "Tutors Profile", icon: <Users size={20} className="text-gray-700" />, route: "tutors" },
  //   { title: "Performance", icon: <TrendingUp size={20} className="text-gray-700" />, route: "performance" },
  //   { title: "Class Quality", icon: <Video size={20} className="text-gray-700" />, route: "class-quality" },
  //   { title: "Payment Summary", icon: <IndianRupee size={20} className="text-gray-700" />, route: "payments" },
  //   { title: "My Classes", icon: <Calendar size={20} className="text-gray-700" />, route: "classes" },
  //   { title: "Feedback", icon: <MessageSquare size={20} className="text-gray-700" />, route: "feedback" }
  // ];

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/Api/student/tutors');
        if (response.data.success) {
          setTutors(response.data.tutors);
          console.log("response.data.tutors : ",response.data.tutors);
          
        } else {
          setError('Failed to fetch tutors');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/Api/users/user");
        if (response.data && response.data.user) {
          setUserData(response.data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    
    fetchTutors();
    fetchUserData();
  }, []);

  // const handleProfileClick = () => {
  //   router.push('/student/profile');
  // };

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  // const toggleSidebarCollapse = () => {
  //   setSidebarCollapsed(!sidebarCollapsed);
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-2xl font-light text-gray-800">Loading tutors...</div>
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
const tutorContent=(
  <>
      {/* Main Content */}
          {/* Page Header */}
          <div>
          <Link
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        href="/student"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>
          <div className="bg-gradient-to-r from-purple-700 to-purple-800 !text-white rounded-xl shadow-md p-6 mb-6">
            
          <h2 className="text-2xl font-bold !text-[20px] text-white">Tutors Directory</h2>
          <p className="mt-1 opacity-90 !text-[16px]">Browse our expert tutors to find the perfect match for your learning needs</p>
        </div>
        

          
        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <User size={24} className="text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 !text-[24px]">{tutor.username}</h3>
                  <p className="text-sm text-gray-600">Tutor</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">Email:</span>
                  <span className="text-sm text-gray-500 word-brk">{tutor.email}</span>
                </div>
                <div className="flex">
                  <span className="text-sm text-gray-500 w-20">Contact:</span>
                  <span className="text-sm text-gray-500">{tutor.contact || 'Not available'}</span>
                </div>
              </div>
              
              <Link href={`/student/tutorProfile?tutorId=${tutor._id}`}>
                  <button className="w-full bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors">
                    View Profile
                  </button>
                </Link>
            </div>
          ))}

          {tutors.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">No tutors found</div>
            </div>
          )}
          </div>
        </div></>
)
return (
  <DashboardLayout userData={userData} userType="student">
    <div className="p-0 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {tutorContent}
      </div>
    </div>
  </DashboardLayout>
);
}