"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  classDetails: any[]; // ✅ Add this
  createdAt: string;
}

interface UserDataContextType {
  userData: UserData | null;
  courseDetails: any[];
    classDetails: any[];
  studentCount: number;
  loading: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courseDetails, setCourseDetails] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Api/DashboardData");
        const data = await response.json();
        
        setUserData(data.user);
        setCourseDetails(data.courseDetails || []);
        setStudentCount(data.studentCount || 0);
        setClassDetails(data.classDetails || []);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <UserDataContext.Provider value={{ userData, courseDetails, studentCount, loading ,classDetails}}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUserData must be used within UserDataProvider");
  return context;
}