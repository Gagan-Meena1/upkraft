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
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-400 to-blue-500 flex flex-col items-center text-gray-900">
      {/* Welcome Section */}
      

      {/* Signup Form */}
      <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-pink-400 to-blue-500 shadow-xl rounded-t-3xl p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-6 text-white">{loading ? "Processing..." : "Signup"}</h1>
        <div className="flex justify-center gap-4 mb-6">
          {["Student", "Parent", "Tutor"].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleClick(role)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                category === role ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <input
          className="w-full max-w-md p-3 mb-4 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500"
          type="text"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          placeholder="Username"
        />
        <input
          className="w-full max-w-md p-3 mb-4 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500"
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
        />
        <input
          className="w-full max-w-md p-3 mb-6 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Password"
        />
        <button
          onClick={onSignup}
          className={`w-full max-w-md py-3 rounded-lg font-semibold text-white transition-all ${
            buttonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={buttonDisabled}
        >
          Signup
        </button>
        <p className="text-center mt-4 text-white">
          Already have an account? <Link href="/login" className="text-blue-200 hover:underline">Login</Link>
        </p>
      </div>

      {/* Why Choose UPKRAFT Section */}
      
    </div>
  );
}
