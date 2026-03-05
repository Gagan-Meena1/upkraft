"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import LogoHeader from "@/assets/LogoHeader copy.png";
import SignupImg from "@/assets/signup-img.jpg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export interface SignupRole {
  value: string;
  label: string;
}

interface UserData {
  email: string;
  password: string;
  username: string;
}

interface SignupFormProps {
  roles: SignupRole[];
  title?: string;
  logoHref?: string;
  loginHref?: string;
}

export default function SignupForm({
  roles,
  title = "Sign up",
  logoHref = "/",
  loginHref = "/login",
}: SignupFormProps) {
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
  const [showPassword, setShowPassword] = useState(false);

  const onSignup = async (): Promise<void> => {
    setServerError("");
    try {
      setLoading(true);
      await axios.post("/Api/signup", {
        email: user.email.toLowerCase(),
        username: user.username,
        category: category,
        password: user.password,
      });

      const magicLinkResponse = await axios.post("/Api/signup/send-magic-link", {
        email: user.email.toLowerCase(),
        username: user.username,
        category: category,
      });

      if (magicLinkResponse.data.success) {
        toast.success("Verification link sent! Please check your email.");
        setServerError("");
        return;
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        setServerError(errorMessage);
        toast.error(errorMessage);
      } else {
        const fallback = error.message || "Failed to send verification email.";
        setServerError(fallback);
        toast.error(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (roleValue: string): void => {
    setCategory(roleValue);
    setEmailError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUser({ ...user, email: e.target.value });
    setEmailError("");
    if (serverError) setServerError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserData
  ): void => {
    setUser({ ...user, [field]: e.target.value });
    if (serverError) setServerError("");
  };

  useEffect(() => {
    const isValid =
      user.email.length > 0 &&
      user.password.length > 0 &&
      user.username.length > 0 &&
      category.length > 0;
    setButtonDisabled(!isValid);
  }, [user, category]);

  return (
    <div className="!flex !min-h-screen">
      <div className="!w-full lg:!w-1/2 !flex !flex-col !bg-white">
        <div className="!p-8">
          <Link href={logoHref} className="!inline-block">
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

        <div className="!flex-1 !flex !items-center !justify-center !px-8 !py-12">
          <div className="!w-full !max-w-md">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-8">
              {title}
            </h1>

            {serverError && (
              <div className="!mb-4 !p-3 !bg-red-50 !border !border-red-200 !rounded-lg">
                <p className="!text-red-600 !text-sm">{serverError}</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="!mb-6">
              <div className="!flex !flex-wrap !gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleClick(role.value)}
                    className={`!flex-1 !min-w-0 !px-4 !py-2.5 !rounded-lg !font-medium !text-sm !transition-all ${
                      category === role.value
                        ? "!bg-[#5204d6] !text-white !shadow-sm"
                        : "!bg-gray-100 !text-gray-700 !border !border-gray-200 hover:!bg-gray-200"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="!mb-5">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">
                Username
              </label>
              <input
                className={`!w-full !px-4 !py-3 !rounded-lg !bg-white !border ${
                  serverError && serverError.includes("username")
                    ? "!border-red-500"
                    : "!border-gray-300"
                } !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all`}
                type="text"
                value={user.username}
                onChange={(e) => handleInputChange(e, "username")}
                placeholder="Username"
              />
            </div>

            <div className="!mb-5">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">
                Email address
              </label>
              <input
                className={`!w-full !px-4 !py-3 !rounded-lg !bg-white !border ${
                  emailError || (serverError && serverError.includes("email"))
                    ? "!border-red-500"
                    : "!border-gray-300"
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

            <div className="!mb-6">
              <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">
                Password
              </label>
              <div className="!relative">
                <input
                  className="!w-full !px-4 !py-3 !rounded-lg !bg-white !border !border-gray-300 !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={(e) => handleInputChange(e, "password")}
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

            <button
              onClick={onSignup}
              className={`!w-full !py-3 !rounded-lg !font-semibold !text-white !transition-all !shadow-sm ${
                buttonDisabled || loading
                  ? "!bg-gray-400 !cursor-not-allowed"
                  : "!bg-[#5204d6] !hover:bg-[#6b3fe0] !hover:shadow-md"
              }`}
              disabled={buttonDisabled || loading}
            >
              {loading ? "Processing..." : "Send a Verification Link"}
            </button>

            <div className="!mt-6 !text-center">
              <p className="!text-sm !text-gray-600">
                Already have an account?{" "}
                <Link
                  href={loginHref}
                  className="!text-[#5204d6] !font-semibold !hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

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
