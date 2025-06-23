"use client"
import { useState, FormEvent } from "react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AddStudentFormData {
  username: string;
  email: string;
  password: string;
  contact: string;
  category: string;
}

const AddStudentPage = () => {
  const [formData, setFormData] = useState<AddStudentFormData>({
    username: "",
    email: "",
    password: "",
    contact: "",
    category: "Student",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

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
    setIsSubmitSuccessful(false);
    console.log("[CreateStudent] Form submission started.", { formData });

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
      console.log("[CreateStudent] Received response from /Api/signup.", { responseData: data });

      // If API returns success: false, display the error message from API
      if (!data.success) {
        setMessage({
          text: data.error || "Registration failed. Please try again.",
          type: "error"
        });
        console.error("[CreateStudent] API returned an error.", { error: data.error, formData });
        return;
      }
      
      // If we get here, API returned success: true
      setMessage({
        text: data.message || `Successfully added ${formData.username} as a new student`,
        type: "success",
      });
      console.log(`[CreateStudent] Successfully created new student: ${formData.username}`);
      
      setIsSubmitSuccessful(true);
      
      // Reset form only on success
      setFormData({
        username: "",
        email: "",
        password: "",
        contact: "",
        category: "Student",
      });
    } catch (error: any) {
      // Handle network or JSON parsing errors
      setMessage({
        text: "Connection error. Please try again.",
        type: "error",
      });
      console.error("[CreateStudent] An exception occurred during form submission.", { error, formData });
      setIsSubmitSuccessful(false);
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
            <Link href="/tutor/myStudents" className="inline-flex items-center text-white hover:text-gray-200 transition-colors py-2 mb-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Add New Student</h1>
            <p className="text-white mt-1">Complete the form below to register a new student account</p>
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

              {/* Contact Number Input */}
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                  placeholder="Enter student's contact number"
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
                  minLength={6}
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

          {/* Footer - Only show when submission was successful */}
          {isSubmitSuccessful && (
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">
                    Student added successfully!
                  </span>
                </p>
                
                <Link
                  href="/tutor/myStudents"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentPage;