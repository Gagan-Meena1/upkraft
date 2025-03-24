"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
    } catch (error: any) {
      console.log("Login failed", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 to-blue-400">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{loading ? "Processing..." : "Login"}</h1>
        <p className="text-gray-600 mb-6">Welcome back! Please log in to continue.</p>

        {/* Email Input */}
        <div className="mb-4 text-left">
          <label className="block mb-1 text-gray-700 font-medium">Email</label>
          <input
            className="w-full p-3 rounded-lg bg-white border border-gray-300 text-black focus:ring-2 focus:ring-pink-500"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 text-left">
          <label className="block mb-1 text-gray-700 font-medium">Password</label>
          <input
            className="w-full p-3 rounded-lg bg-white border border-gray-300 text-black focus:ring-2 focus:ring-pink-500"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Enter your password"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup & Forgot Password Links */}
        <div className="mt-4">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-pink-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            <Link href="/forgot-password" className="text-pink-700 font-semibold hover:underline">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}