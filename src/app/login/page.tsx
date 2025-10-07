"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdError } from "react-icons/md";


interface User {
  email: string;
  password: string;
  isVerified?: boolean; // Optional, based on your requirements
}

interface ApiResponse {
  message?: string;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    category: string;
    isVerified: boolean;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [notApproved, setNotApproved] = useState<boolean>(false); // Add this state


 const onLogin = async () => {
  try {
    setLoading(true);
    setNotApproved(false); // Reset the state
    console.log("called onlogin");
    
    const response = await axios.post<ApiResponse>("/Api/users/login", user);
    console.log("Login response", response.data);
    
    // If we get an error in the response, show it and return early
    if ('error' in response.data) {
      toast.error(response.data.error || 'Login failed');
      return;
    }

    // Make sure we have the success case data
    if (!response.data.user?.category || !response.data.token) {
      toast.error("Invalid response from server");
      return;
    }

    const userCategory = response.data.user.category;
    const isVerified = response.data.user.isVerified;
    
    console.log("User category and verification:", userCategory, isVerified);
    
    // Check verification status first
    if ((userCategory === "Tutor" || userCategory === "Admin" || userCategory === "Student") && !isVerified) {
      setNotApproved(true); // Show permanent message
      toast.error("Admin has not approved your request yet");
      return; // Don't proceed with navigation
    }
    
    // Navigate user based on category (only for verified users)
    toast.success("Login successful");
    if (userCategory === "Student") {
      router.push("/student");
    } else if (userCategory === "Tutor") {
      router.push("/tutor");
    } else if (userCategory === "Admin") {
      router.push("/admin");
    }
    
  } catch (error: any) {
    console.log("Login failed", error.response?.data?.error || error.message);
    // If we have a specific error message from the API, use it
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error("Login failed. Please check your credentials.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    {/* Navigation */}
          <nav className="!w-full !py-2 !px-8 !flex !justify-between !items-center !sticky !top-0 !bg-gray-50/90 !backdrop-blur-sm !z-10">
            <div className="!font-extrabold !text-2xl !text-gray-800">
              {/* <img src="logo.png" alt="" className="w-36 h-auto" /> */}
               <Link href="/" className="cursor-pointer">
              <Image 
                src="/logo.png"
                alt="UpKraft"
                width={288}
                height={72}
                priority
                className="!object-contain !w-36 !h-auto" 
              />
            </Link>
            </div>
            <div className="!flex !space-x-4">
              <Link href="/signup">
                <button className="!px-6 !py-2 !bg-gray-900 !text-gray-50 !font-medium !rounded-lg !hover:bg-gray-800 !transition">
                  Sign Up
                </button>
              </Link>
              <Link href="/login">
                <button className="!px-6 !py-2 !border !border-gray-900 !text-gray-900 !font-medium !rounded-lg !hover:bg-gray-100 !transition">
                  Login
                </button>
              </Link>
            </div>
          </nav>
    <div className="!flex !items-center !justify-center !min-h-screen !bg-gray-100">
     
      <div className="!bg-white !p-8 !rounded-lg !shadow-lg !w-full !max-w-md">
        <h1 className="!text-3xl !font-bold !text-orange-500 !mb-2">{loading ? "Processing..." : "Login"}</h1>
        <p className="!text-gray-500 !mb-8 !text-sm">Welcome back! Please log in to continue.</p>
        
          {/*  APPROVED MESSAGE HERE  */}
  {notApproved && (
    <div className="!mb-6 !p-4 !bg-red-50 !border !border-red-200 !rounded-lg">
      <div className="!flex !items-center">
        <div className="!flex-shrink-0">
          <MdError className="!h-5 !w-5 !text-red-400" />
        </div>
        <div className="!ml-3">
          <p className="!text-sm !font-medium !text-red-800">
            Admin has not approved your request yet
          </p>
          <p className="!text-xs !text-red-600 !mt-1">
            Please wait for admin approval before accessing your account.
          </p>
        </div>
      </div>
    </div>
  )}
  
        {/* Email Input */}
        <div className="!mb-2">
          <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Email</label>
          <input
            className="!w-full !p-3 !rounded-md !bg-gray-50 !border !border-gray-200 !text-gray-800 !focus:ring-2 !focus:ring-orange-400 !focus:border-transparent !transition-all"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>
        
        {/* Password Input */}
        <div className="!mb-6">
          <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Password</label>
          <input
            className="!w-full !p-3 !rounded-md !bg-gray-50 !border !border-gray-200 !text-gray-800 !focus:ring-2 !focus:ring-orange-400 !focus:border-transparent !transition-all"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Enter your password"
          />
        </div>
        
        {/* Login Button */}
        <button
          onClick={onLogin}
          className={`!w-full !py-3 !rounded-md !font-medium !text-white !transition-all ${
            loading ? "!bg-gray-400 !cursor-not-allowed" : "!bg-orange-500 !hover:bg-orange-600"
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {/* Signup & Forgot Password Links */}
        <div className="!mt-6 !flex !justify-between !text-sm">
          <p className="!text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="!text-orange-500 !font-medium !hover:text-orange-600">
              Sign Up
            </Link>
          </p>
          <Link href="/forgot-password" className="!text-orange-500 !font-medium !hover:text-orange-600">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
    </>
  );

}