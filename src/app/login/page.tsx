"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  email: string;
  password: string;
}

interface ApiResponse {
  user: {
    category: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState<boolean>(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      console.log("called onlogin");
      
      const response = await axios.post<ApiResponse>("/Api/users/login", user);
      console.log("Login success", response.data);
      toast.success("Login successful");
      const userCategory = response.data.user.category; // Get category from response
      console.log(userCategory);
      
      // Navigate user based on category
      if (userCategory === "Student") {
        router.push("/student");
      } else if (userCategory === "Tutor") {
        router.push("/tutor");
      }
     else if (userCategory === "Admin") {
      router.push("/admin");
    } 
    } catch (error: any) {
      console.log("Login failed", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* Navigation */}
          <nav className="w-full py-2 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
            <div className="font-extrabold text-2xl text-gray-800">
              {/* <img src="logo.png" alt="" className="w-36 h-auto" /> */}
              <Link href="/" className="cursor-pointer w-36 h-auto">
              <Image 
                src="/logo.png" // Make sure your logo is in the public folder
                alt="UpKraft"
                width={36}
                height={36}
                priority
                className="object-contain w-36 h-auto" 
              />
            </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/signup">
                <button className="px-6 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition">
                  Sign Up
                </button>
              </Link>
              <Link href="/login">
                <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
                  Login
                </button>
              </Link>
            </div>
          </nav>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
     
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">{loading ? "Processing..." : "Login"}</h1>
        <p className="text-gray-500 mb-8 text-sm">Welcome back! Please log in to continue.</p>
        
        {/* Email Input */}
        <div className="mb-5">
          <label className="block mb-2 text-gray-700 text-sm font-medium">Email</label>
          <input
            className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>
        
        {/* Password Input */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 text-sm font-medium">Password</label>
          <input
            className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Enter your password"
          />
        </div>
        
        {/* Login Button */}
        <button
          onClick={onLogin}
          className={`w-full py-3 rounded-md font-medium text-white transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {/* Signup & Forgot Password Links */}
        <div className="mt-6 flex justify-between text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-orange-500 font-medium hover:text-orange-600">
              Sign Up
            </Link>
          </p>
          <Link href="/forgot-password" className="text-orange-500 font-medium hover:text-orange-600">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
    </>
  );

}