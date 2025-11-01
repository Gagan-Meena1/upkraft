"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import LogoHeader from '@/assets/LogoHeader copy.png';
import SignupImg from "@/assets/signup-img.jpg"

// Define interface for user data
interface UserData {
  email: string;
  password: string;
  username: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({
    email: "",
    password: "",
    username: "",
  });
  const [category, setCategory] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [serverError, setServerError] = useState<string>("");

  const onSignup = async (): Promise<void> => {
    // Clear any previous server errors
    setServerError("");

    try {
      setLoading(true);
      //  saving the user data to the database
      const userData = await axios.post("/Api/signup", {
        email: user.email.toLowerCase(),
        username: user.username,
        category: category,
        password: user.password
      });
      console.log("[Signup Page] Sending verification link to:", user.email.toLowerCase());

      // First, send the magic link
      const magicLinkResponse = await axios.post("/Api/signup/send-magic-link", {
        email: user.email.toLowerCase(),
        username: user.username,
        category: category
      });

      if (magicLinkResponse.data.success) {
        console.log("[Signup Page] Verification link sent successfully");
        toast.success("Verification link sent! Please check your email.");
        // Show a success message in the UI
        setServerError(""); // Clear any existing errors
        return;
      }

    } catch (error: any) {
      console.error("[Signup Page] Magic link sending failed:", error);

      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error || "Failed to send verification email.";
        setServerError(errorMessage);
        toast.error(errorMessage);
      } else {
        setServerError(error.message || "An error occurred while sending verification email");
        toast.error(error.message || "Failed to send verification email");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (role: string): void => {
    setCategory(role);
    // Clear email error when changing roles
    setEmailError("");
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newEmail = e.target.value;
    setUser({ ...user, email: newEmail });

    setEmailError("");

    // Clear server error when user makes changes
    if (serverError) setServerError("");
  };

  // Clear server error when any user data changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData): void => {
    setUser({ ...user, [field]: e.target.value });
    if (serverError) setServerError("");
  };

  useEffect(() => {
    const isValid = user.email.length > 0 &&
      user.password.length > 0 &&
      user.username.length > 0 &&
      category.length > 0;

    setButtonDisabled(!isValid);
  }, [user, category]);

  return (
    <div className="!flex !min-h-screen">
      {/* Left Side - Signup Form */}
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

        {/* Signup Form Container */}
        <div className="!flex-1 !flex !items-center !justify-center !px-8 !py-12">
          <div className="!w-full !max-w-md">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-8">Sign up</h1>

            {serverError && (
              <div className="!mb-4 !p-3 !bg-red-50 !border !border-red-200 !rounded-lg">
                <p className="!text-red-600 !text-sm">{serverError}</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="!mb-6">
              <div className="!flex !gap-3">
                {["Student", "Admin", "Tutor", "Academic"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleClick(role)}
                    className={`!flex-1 !px-4 !py-2.5 !rounded-lg !font-medium !text-sm !transition-all ${category === role
                      ? "!bg-[#5204d6] !text-white !shadow-sm"
                      : "!bg-gray-100 !text-gray-700 !border !border-gray-200 hover:!bg-gray-200"
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Username Input */}
            <div className="!mb-5">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Username</label>
              <input
                className={`!w-full !px-4 !py-3 !rounded-lg !bg-white !border ${serverError && serverError.includes("username") ? "!border-red-500" : "!border-gray-300"
                  } !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all`}
                type="text"
                value={user.username}
                onChange={(e) => handleInputChange(e, "username")}
                placeholder="Username"
              />
            </div>

            {/* Email Input */}
            <div className="!mb-5">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Email address</label>
              <input
                className={`!w-full !px-4 !py-3 !rounded-lg !bg-white !border ${emailError || (serverError && serverError.includes("email")) ? "!border-red-500" : "!border-gray-300"
                  } !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all`}
                type="email"
                value={user.email}
                onChange={handleEmailChange}
                placeholder="name@example.com"
              />
              {emailError && (
                <p className="!text-red-500 !text-xs !mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="!mb-6">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">Password</label>
              <input
                className="!w-full !px-4 !py-3 !rounded-lg !bg-white !border !border-gray-300 !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all"
                type="password"
                value={user.password}
                onChange={(e) => handleInputChange(e, "password")}
                placeholder="••••••••"
              />
            </div>

            {/* Signup Button */}
            <button
              onClick={onSignup}
              className={`!w-full !py-3 !rounded-lg !font-semibold !text-white !transition-all !shadow-sm ${buttonDisabled || loading
                ? "!bg-gray-400 !cursor-not-allowed"
                : "!bg-[#5204d6] !hover:bg-[#6b3fe0] !hover:shadow-md"
                }`}
              disabled={buttonDisabled || loading}
            >
              {loading ? "Processing..." : "Send a Verification Link"}
            </button>

            {/* Login Link */}
            <div className="!mt-6 !text-center">
              <p className="!text-sm !text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="!text-[#5204d6] !font-semibold !hover:underline">
                  Login
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
            src={SignupImg.src}
            alt="SignUp Illustration"
            fill
            className="!object-cover !w-full !h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}