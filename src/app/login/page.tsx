"use client";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdError } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import LogoHeader from '@/assets/LogoHeader copy.png';
import LoginImg from "@/assets/login_img.jpg"


interface User {
  email: string;
  password: string;
  isVerified?: boolean;
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
  const [notApproved, setNotApproved] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);


  const onLogin = async () => {
    try {
      setLoading(true);
      setNotApproved(false);
      console.log("called onlogin");

      const response = await axios.post<ApiResponse>("/Api/users/login", user);
      console.log("Login response", response.data);

      if ('error' in response.data) {
        toast.error(response.data.error || 'Login failed');
        return;
      }

      if (!response.data.user?.category || !response.data.token) {
        toast.error("Invalid response from server");
        return;
      }

      const userCategory = response.data.user.category;
      const isVerified = response.data.user.isVerified;

      // normalize category 
      const normalizedCategory = userCategory.replace(/\s+/g, "").toLowerCase();

      console.log("User category and verification:", userCategory, isVerified);

      // approval check
      const needsApproval = [
        "tutor",
        "admin",
        "student",
        "academic",
        "teamlead",
        "relationshipmanager",
      ].includes(normalizedCategory);

      if (needsApproval && !isVerified) {
        setNotApproved(true);
        toast.error("Admin has not approved your request yet");
        return;
      }

      toast.success("Login successful");

      // routing based on normalized category
      if (normalizedCategory === "student") {
        router.push("/student");
      } else if (normalizedCategory === "tutor") {
        router.push("/tutor");
      } else if (normalizedCategory === "admin") {
        router.push("/admin");
      } else if (normalizedCategory === "academic") {
        router.push("/academy");
      } else if (normalizedCategory === "teamlead") {
        router.push("/teamlead/tutors");
      } else if (normalizedCategory === "relationshipmanager") {
        router.push("/relationshipmanager");
      }
    } catch (error: any) {
      console.log("Login failed", error.response?.data?.error || error.message);
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
    <div className="!flex !min-h-screen">
      {/* Left Side - Login Form */}
      <div className="!w-full lg:!w-1/2 !flex !flex-col !bg-white">
        {/* Logo */}
        <div className="!p-8">
          <Link href="/" className="!inline-block">
            <Image
              src={LogoHeader}
              alt="UpKraft"
              width={120}
              height={40}
              priority
              className="!object-contain"
            />
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="!flex-1 !flex !items-center !justify-center !px-8 !py-12">
          <div className="!w-full !max-w-md">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">Login</h1>
            <p className="!text-gray-500 !mb-8">Welcome back! Please log in to continue.</p>

            {/* Not Approved Message */}
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
            <div className="!mb-5">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Email address</label>
              <input
                className="!w-full !px-4 !py-3 !rounded-lg !bg-white !border !border-gray-300 !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="!mb-3">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">
                Password
              </label>
              <div className="!relative">
                <input
                  className="!w-full !px-4 !py-3 !rounded-lg !bg-white !border !border-gray-300 !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="••••••••"
                />
                <span className="!absolute !inset-y-0 !right-0 !flex !items-center !pr-3">
                  {showPassword ? (
                    <AiOutlineEye
                      className="!w-5 !h-5 !text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="!w-5 !h-5 !text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </span>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="!flex !items-center !justify-between !mb-6">
              <label className="!flex !items-center !cursor-pointer">
                <input type="checkbox" className="!w-4 !h-4 !text-purple-600 !border-gray-300 !rounded !focus:ring-purple-500" />
                <span className="!ml-2 !text-sm !text-gray-600">Remember Password</span>
              </label>
              <Link href="/forgot-password" className="!text-sm !text-[#5204d6] !font-medium !hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              onClick={onLogin}
              className={`!w-full !py-3 !rounded-lg !font-semibold !text-white !transition-all !shadow-sm ${loading
                  ? "!bg-gray-400 !cursor-not-allowed"
                  : "!bg-[#5204d6] !hover:bg-[#6b3fe0] !hover:shadow-md"
                }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Sign Up Link */}
            <div className="!mt-6 !text-center">
              <p className="!text-sm !text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="!text-[#5204d6] !font-semibold !hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="!hidden lg:!flex !w-1/2 !bg-gray-100 !items-center !justify-center !p-0">
        <div className="!relative !w-full !h-full">
          <Image
            src={LoginImg.src}
            alt="Login Illustration"
            fill
            className="!object-cover !w-full !h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}