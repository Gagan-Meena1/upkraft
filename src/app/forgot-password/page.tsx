"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

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
    <>
      {/* Navigation */}
      <nav className="w-full py-2 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <Link href="/" className="cursor-pointer">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={288}
              height={72}
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
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            {loading ? "Processing..." : "Forgot Password"}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 text-gray-700 text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md font-medium text-white transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 