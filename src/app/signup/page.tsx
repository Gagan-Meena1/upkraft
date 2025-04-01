"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
    username: "",
  });
  const [category, setCategory] = React.useState("");
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/Api/signup", {
        ...user,
        category,
      });
      console.log("Signup success", response.data);
      router.push("/login");
    } catch (error: any) {
      console.log("Signup failed", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (role: string) => {
    setCategory(role);
  };

  useEffect(() => {
    setButtonDisabled(
      !(user.email.length > 0 && user.password.length > 0 && user.username.length > 0 && category.length > 0)
    );
  }, [user, category]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <img src="logo.png" alt="" className="w-36 h-auto" />
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

      {/* Signup Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">
            {loading ? "Processing..." : "Join UPKRAFT"}
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-3 text-sm font-medium">I am a:</p>
            <div className="flex justify-between gap-2">
              {["Student", "Parent", "Tutor"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleClick(role)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    category === role 
                      ? "bg-gray-900 text-gray-50" 
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <input
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none transition"
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              placeholder="Username"
            />
            <input
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none transition"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Email"
            />
            <input
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none transition"
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              placeholder="Password"
            />
          </div>
          
          <button
            onClick={onSignup}
            className={`w-full py-3 rounded-lg font-medium text-gray-50 transition-all ${
              buttonDisabled 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gray-900 hover:bg-gray-800"
            }`}
            disabled={buttonDisabled}
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
          
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="font-bold text-xl text-gray-900 mb-6 md:mb-0">UPKRAFT</div>
          <div className="flex space-x-8 text-gray-600">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Features</a>
            <a href="#" className="hover:text-gray-900">Pricing</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
          <div className="mt-6 md:mt-0 text-gray-500">© 2025 UPKRAFT. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}