"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null); // ADD THIS
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  const fetchData = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options;
      try {
        if (!silent) {
          setLoading(true);
        }

        const response = await fetch("/Api/DashboardData", {
          cache: "no-store",
        });
        const data = await response.json();
        
        if (data.success) { // ADD THIS CHECK
          setUserData(data.user);
          setCourseDetails(data.courseDetails || []);
          setStudentCount(data.studentCount || 0);
          setClassDetails(data.classDetails || []);
          setError(null); // ADD THIS
        } else {
          setError(data.error || "Failed to fetch data"); // ADD THIS
        }
      } catch (error: any) { // CHANGE THIS
        console.error("Error fetching dashboard data:", error);
        setError(error.message); // ADD THIS
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (
      prevPathRef.current !== null &&
      pathname === "/tutor" &&
      prevPathRef.current !== "/tutor"
    ) {
      fetchData({ silent: true });
    }

    prevPathRef.current = pathname;
  }, [pathname, fetchData]);

    return (
    <UserDataContext.Provider
      value={{ 
        userData, 
        courseDetails, 
        studentCount, 
        loading, 
        classDetails,
        error, // ADD THIS
        refetch: fetchData // ADD THIS
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}


export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUserData must be used within UserDataProvider");
  return context;
}