"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

console.log("[VerifyEmail Page] Component loaded");

// Create a separate component for the verification logic
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // State management for verification process
  const [error, setError] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("[VerifyEmail Page] Effect triggered with token:", token ? "Present" : "Missing");

    const verifyEmail = async () => {
      try {
        console.log("[VerifyEmail Page] Starting email verification process");
        const response = await axios.post("/Api/users/verifyemail", { token });
        
        if (response.data.success) {
          console.log("[VerifyEmail Page] Verification successful");
          setVerified(true);
          toast.success("Email verified successfully!");
        }
      } catch (error: any) {
        console.error("[VerifyEmail Page] Verification failed:", error.response?.data?.error || error.message);
        setError(error.response?.data?.error || "Verification failed");
        toast.error(error.response?.data?.error || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      console.warn("[VerifyEmail Page] No token provided in URL");
      setError("Verification token is missing");
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        {loading ? (
          <div className="py-8">
            <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
            <p className="mt-2 text-gray-500">Please wait while we verify your email address.</p>
          </div>
        ) : verified ? (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
            <p className="mt-2 text-gray-600">Your email has been successfully verified.</p>
            <Link href="/login">
              <button className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                Proceed to Login
              </button>
            </Link>
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link href="/signup">
              <button className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                Try Again
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="py-8">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="mt-2 text-gray-500">Please wait while we load the verification page.</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex flex-col text-gray-900" style={{ backgroundColor: "#fffafaff" }}>
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <Link href="/" className="cursor-pointer w-36 h-auto">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={36}
              height={36}
              priority
              className="object-contain w-36 h-auto" 
            />
          </Link>
        </div>
      </nav>

      {/* Content wrapped in Suspense */}
      <Suspense fallback={<VerifyEmailLoading />}>
        <VerifyEmailContent />
      </Suspense>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 px-8 border-t border-gray-100 mt-auto">
        <div className="text-center text-gray-500">© 2024 UpKraft. All rights reserved.</div>
      </footer>
    </div>
  );
}