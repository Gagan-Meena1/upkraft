"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import LogoHeader from '@/assets/LogoHeader copy.png';
import LoginImg from "@/assets/login_img.jpg"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/Api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link sent to your email');
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!flex !min-h-screen">
      {/* Left Side - Forgot Password Form */}
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

        {/* Form Container */}
        <div className="!flex-1 !flex !items-center !justify-center !px-8 !py-12">
          <div className="!w-full !max-w-md">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">Forgot Password</h1>
            <p className="!text-gray-500 !mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="!mb-6">
                <label className="!block !mb-2 !text-gray-700 !text-sm !font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!w-full !px-4 !py-3 !rounded-lg !bg-white !border !border-gray-300 !text-gray-900 !placeholder-gray-400 !focus:outline-none !focus:ring-2 !focus:ring-purple-500 !focus:border-transparent !transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`!w-full !py-3 !rounded-lg !font-semibold !text-white !transition-all !shadow-sm ${loading
                    ? "!bg-gray-400 !cursor-not-allowed"
                    : "!bg-[#5204d6] !hover:bg-[#6b3fe0] !hover:shadow-md"
                  }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              {/* Back to Login Link */}
              <div className="!mt-6 !text-center">
                <Link
                  href="/login"
                  className="!text-sm !text-[#5204d6] !font-semibold !hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="!hidden lg:!flex !w-1/2 !bg-gray-100 !items-center !justify-center !p-0">
        <div className="!relative !w-full !h-full">
          <Image
            src={LoginImg.src}
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