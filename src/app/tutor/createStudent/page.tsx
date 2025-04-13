"use client"
import { useState, FormEvent } from "react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AddStudentFormData {
  username: string;
  email: string;
  password: string;
  category: string;
}

const AddStudentPage = () => {
  const [formData, setFormData] = useState<AddStudentFormData>({
    username: "",
    email: "",
    password: "",
    category: "Student", // Default category
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Send data to API endpoint
      const response = await fetch('/Api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }
      
      // Success response
      setMessage({
        text: data.message || `Successfully added ${formData.username} as a new student`,
        type: "success",
      });
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        category: "Student",
      });
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to add student. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 px-6 py-4">
          <Link href="/tutor" className="inline-flex items-center text-gray-700 hover:text-orange-500 transition-colors  py-2 mb-4">
                <ArrowLeft className="mr-2 h-5 w-5 bg-gray-200 rounded-xl" />
          </Link>
            <h1 className="text-2xl font-bold text-white-500">Add New Student</h1>
            <p className="text-white-400 mt-1">Complete the form below to register a new student account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {message.text && (
              <div
                className={`p-4 rounded-md ${
                  message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                  placeholder="Enter student's full name"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                  placeholder="Enter student's email address"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                  placeholder="Create a password"
                  minLength={4}
                />
                <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters</p>
              </div>

              {/* Category (Disabled, always Student) */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  disabled
                  className="mt-1 block w-full rounded-md text-black border-gray-300 bg-gray-100 shadow-sm px-3 py-2 border cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Default category is Student</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding Student..." : "Add Student"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-right">
            <p className="text-sm text-gray-600">
              {/* <span className="text-orange-500 font-medium">Note:</span> Student will receive an email with login instructions */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentPage;