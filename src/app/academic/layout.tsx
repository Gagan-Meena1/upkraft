"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  isVerified: boolean;
}

export default function AcademicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/Api/users/user");
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Check if user is verified
          if (!user.isVerified) {
            toast.error("Your account is not verified yet. Please wait for admin approval.");
            router.push("/login");
            return;
          }
          
          // Check if user category is Academic
          if (user.category !== "Academic") {
            toast.error("Access denied. This area is for Academic users only.");
            router.push("/login");
            return;
          }
          
          setUserData(user);
        } else {
          toast.error("Please login to access this area.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication failed. Please login again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return <>{children}</>;
}

