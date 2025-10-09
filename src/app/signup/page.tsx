"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
    <div className="!min-h-screen !w-full !flex !flex-col !text-gray-900" style={{ backgroundColor: "#fffafaff" }}>
      {/* Navigation */}
      <nav className="!w-full !py-6 !px-8 !flex !justify-between !items-center !sticky !top-0 !bg-gray-50/90 !backdrop-blur-sm !z-10">
        <div className="!font-extrabold !text-2xl !text-gray-800">
           <Link href="/" className="!cursor-pointer">
              <Image 
                src="/logo.png"
                alt="UpKraft"
                width={288} // Use 2x the display size for crisp rendering
                height={72}  // Adjust based on your logo's actual aspect ratio
                priority
                className="!object-contain !w-36 !h-auto" 
              />
            </Link>
        </div>
        <div className="!flex !space-x-4">
          <Link href="/signup">
            <button className="!px-6 !py-2 !bg-gray-900 !text-gray-50 !font-medium !rounded-lg hover:!bg-gray-800 !transition">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="!px-6 !py-2 !border !border-gray-900 !text-gray-900 !font-medium !rounded-lg hover:!bg-gray-100 !transition">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="!flex-1 !flex !flex-col !items-center !justify-center !px-8 !py-16">
        <div className="!w-full !max-w-md !bg-white !rounded-xl !shadow-sm !border !border-gray-100 !p-8">
          <h1 className="!text-3xl !font-bold !text-center !mb-8 !text-[#5204d6]">
            {loading ? "Processing..." : "Join UPKRAFT"}
          </h1>
          
          {serverError && (
            <div className="!mb-4 !p-3 !bg-red-50 !border !border-red-200 !rounded-lg">
              <p className="!text-red-600 !text-sm">{serverError}</p>
            </div>
          )}
          
          <div className="!mb-6">
            <p className="!text-gray-600 !mb-3 !text-sm !font-medium">I am a:</p>
            <div className="!flex !justify-between !gap-2">
              {["Student", "Admin", "Tutor"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleClick(role)}
                  className={`!flex-1 !px-4 !py-2 !rounded-lg !font-medium !text-sm !transition-all ${
                    category === role 
                      ? "!bg-gray-900 !text-gray-50" 
                      : "!bg-gray-50 !text-gray-700 !border !border-gray-200 hover:!bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <div className="!space-y-4 !mb-6">
            <input
              className={`!w-full !p-3 !rounded-lg !bg-gray-50 !border ${
                serverError && serverError.includes("username") ? "!border-red-500" : "!border-gray-200"
              } focus:!ring-2 focus:!ring-gray-900 focus:!outline-none !transition`}
              type="text"
              value={user.username}
              onChange={(e) => handleInputChange(e, "username")}
              placeholder="Username"
            />
            <div className="!relative">
              <input
                className={`!w-full !p-3 !rounded-lg !bg-gray-50 !border ${
                  emailError || (serverError && serverError.includes("email")) ? "!border-red-500" : "!border-gray-200"
                } focus:!ring-2 focus:!ring-gray-900 focus:!outline-none !transition`}
                type="email"
                value={user.email}
                onChange={handleEmailChange}
                placeholder="Email"
              />
              {emailError && (
                <p className="!text-red-500 !text-xs !mt-1">{emailError}</p>
              )}
            </div>
            <input
              className="!w-full !p-3 !rounded-lg !bg-gray-50 !border !border-gray-200 focus:!ring-2 focus:!ring-gray-900 focus:!outline-none !transition"
              type="password"
              value={user.password}
              onChange={(e) => handleInputChange(e, "password")}
              placeholder="Password"
            />
          </div>
          
          <button
            onClick={onSignup}
            className={`!w-full !py-3 !rounded-lg !font-medium !text-gray-50 !transition-all ${
              buttonDisabled || loading
                ? "!bg-gray-400 !cursor-not-allowed" 
                : "!bg-gray-900 hover:!bg-gray-800"
            }`}
            disabled={buttonDisabled || loading}
          >
            {loading ? "Processing..." : "Send Verification Link"}
          </button>
          
          <p className="!text-center !mt-6 !text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="!text-[#5204d6] hover:!underline !font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}