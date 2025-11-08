"use client"
import { useState, FormEvent, useEffect } from "react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface AddStudentFormData {
  username: string;
  email: string;
  password: string;
  contact: string;
  category: string;
    addedBy: string; 

}

const AddStudentPage = () => {
  const [formData, setFormData] = useState<AddStudentFormData>({
    username: "",
    email: "",
    password: "",
    contact: "",
    category: "Student",
      addedBy: "self", 

  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [existingStudent, setExistingStudent] = useState<{ exists: boolean; username?: string }>({ exists: false });
    const [academyId, setAcademyId] = useState<string | null>(null);

   useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAcademyId(params.get('academyId'));
  }, []);

  // Check if student exists when email changes
  useEffect(() => {
    const checkExistingStudent = async () => {
      if (!formData.email || !formData.email.includes('@')) return;

      try {
        // Check if student exists using myStudents API
        const response = await fetch(`/Api/myStudents?email=${encodeURIComponent(formData.email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        console.log("[CreateStudent] Checking existing student:", data);

        if (data.user) {
          setExistingStudent({ exists: true });
          // Pre-fill the form with existing student data
          setFormData(prev => ({
            ...prev,
            username: data.user.username || "",
            contact: data.user.contact || "",
            password: "" // Clear password as it's not needed for existing students
          }));
          
          if (data.user.isAlreadyAdded) {
            setMessage({
              text: "This student is already in your students list.",
              type: "error"
            });
          } else {
            setMessage({
              text: "Student already exists. They will be added to your students list.",
              type: "info"
            });
          }
        } else {
          setExistingStudent({ exists: false });
          setMessage({ text: "", type: "" });
        }
      } catch (error) {
        console.error("[CreateStudent] Error checking existing student:", error);
      }
    };

    const debounceTimer = setTimeout(checkExistingStudent, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      // Reset form except for the new email
      setFormData(prev => ({
        username: "",
        email: value,
        password: "",
        contact: "",
        category: "Student",
       addedBy: "self", // Change from prev.addedBy to "self"

      }));
      setExistingStudent({ exists: false });
      setMessage({ text: "", type: "" });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    setIsSubmitSuccessful(false);
    console.log("[CreateStudent] Form submission started.", { formData, existingStudent });

    try {
      let endpoint = existingStudent.exists ? '/Api/myStudents' : '/Api/signup';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emailType: existingStudent.exists ? 'STUDENT_INVITATION_EXISTING' : 'STUDENT_INVITATION'
        }),
      });

      const data = await response.json();
      console.log("[CreateStudent] API Response:", { endpoint, data });

      if (!data.success) {
        setMessage({
          text: data.error || "Failed to add student. Please try again.",
          type: "error"
        });
        return;
      }

      setMessage({
        text: existingStudent.exists 
          ? `${formData.username} has been added to your students list.`
          : `Successfully added ${formData.username} as a new student. An invitation email has been sent.`,
        type: "success",
      });
      
      setIsSubmitSuccessful(true);
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        contact: "",
        category: "Student",
     addedBy: "self", // Change from "" to "self"

      });
      setExistingStudent({ exists: false });
    } catch (error: any) {
      setMessage({
        text: "Connection error. Please try again.",
        type: "error",
      });
      console.error("[CreateStudent] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-purple-700 px-6 py-4">
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
                  message.type === "success" ? "bg-green-50 text-green-800" : 
                  message.type === "error" ? "bg-red-50 text-red-800" :
                  "bg-blue-50 text-blue-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              {/* Email Input - Always enabled */}
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

              {/* Added By Radio Buttons - Only show if academyId is present
{academyId && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Added By
    </label>
    <div className="flex space-x-6">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="addedBy"
          value="self"
          checked={formData.addedBy === "self"}
          onChange={handleChange}
          className="h-4 w-4 text-purple-700 focus:ring-purple-500 border-gray-300"
        />
        <span className="ml-2 text-gray-700">Self</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="addedBy"
          value="academy"
          checked={formData.addedBy === "academy"}
          onChange={handleChange}
          className="h-4 w-4 text-purple-700 focus:ring-purple-500 border-gray-300"
        />
        <span className="ml-2 text-gray-700">Academy</span>
      </label>
    </div>
  </div>
)} */}
{/* <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Added By
  </label>
  <div className="flex space-x-6">
    <label className="inline-flex items-center">
      <input
        type="radio"
        name="addedBy"
        value="self"
        checked={formData.addedBy === "self"}
        onChange={handleChange}
        className="h-4 w-4 text-purple-700 focus:ring-purple-500 border-gray-300"
      />
      <span className="ml-2 text-gray-700">Self</span>
    </label>
    <label className={`inline-flex items-center ${!academyId ? 'cursor-not-allowed opacity-50' : ''}`}>
      <input
        type="radio"
        name="addedBy"
        value="academy"
        checked={formData.addedBy === "academy"}
        onChange={handleChange}
        disabled={!academyId}
        className={`h-4 w-4 text-purple-700 focus:ring-purple-500 border-gray-300 ${!academyId ? 'cursor-not-allowed' : ''}`}
      />
      <span className={`ml-2 ${!academyId ? 'text-gray-400' : 'text-gray-700'}`}>Academy</span>
    </label>
  </div>
</div> */}

              {/* Full Name Input - Disabled if student exists */}
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
                  disabled={existingStudent.exists}
                  className={`mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border ${
                    existingStudent.exists ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter student's full name"
                />
              </div>

              {/* Contact Number Input - Disabled if student exists */}
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
                  disabled={existingStudent.exists}
                  className={`mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border ${
                    existingStudent.exists ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter student's contact number"
                />
              </div>

              {/* Password Input - Only shown for new students */}
              {!existingStudent.exists && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required={!existingStudent.exists}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-3 py-2 border"
                    placeholder="Create a password"
                    minLength={6}
                  />
                  <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters</p>
                </div>
              )}

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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : existingStudent.exists ? "Add to My Students" : "Add New Student"}
              </button>
            </div>
          </form>

          {/* Footer - Only show when submission was successful */}
          {isSubmitSuccessful && (
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">
                    {existingStudent.exists ? "Student added to your list!" : "Student added successfully!"}
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