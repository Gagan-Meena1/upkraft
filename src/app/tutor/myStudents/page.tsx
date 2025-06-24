"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { ChevronLeft } from "lucide-react";

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
}

interface ApiResponse {
  message: string;
  filteredUsers: Student[];
}

export default function MyStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingStudents, setDeletingStudents] = useState<Set<string>>(new Set());

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/Api/myStudents");
      
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data && data.filteredUsers) {
        setStudents(data.filteredUsers);
      } else {
        console.error("filteredUsers not found in API response:", data);
        setError("Invalid response format from server");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingStudents(prev => new Set(prev).add(studentId));
      
      const response = await fetch(`/Api/myStudents?studentId=${studentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete student");
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the student from the local state
        setStudents(prev => prev.filter(student => student._id !== studentId));
        alert(data.message || "Student removed successfully");
      } else {
        throw new Error(data.message || "Failed to delete student");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setDeletingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tutor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">My Students</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Students</h1>
          <Link href="/tutor/createStudent">
            <button className="px-6 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition flex items-center hover:cursor-grab">
              <span className="mr-2"></span> Add Student
            </button>
          </Link>
          <Link href="/tutor">
            <button className="px-6 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition flex items-center hover:cursor-grab">
              <span className="mr-2">←</span> Back to Tutor Dashboard
            </button>
          </Link>
           
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-red-800">Failed to Load Students</h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchStudents();
                }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Students Yet</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    You haven't added any students to your list. Start by adding your first student to begin managing your classes.
                  </p>
                  <Link href="/tutor/createStudent">
                    <button className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Your First Student
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-800">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-800">Email</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-800">Contact</th>
                      <th className="px-6 py-4 text-centre font-semibold text-gray-800">Add To</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr 
                        key={student._id} 
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900 font-medium">{student.username}</td>
                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-gray-600">{student.contact}</td>
                         <td className="px-6 py-4 text-right ">
                        <Link 
                        href={`/tutor/addToCourseTutor?studentId=${student._id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                        Assign Course
                        </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <Link 
                              href={`/tutor/studentDetails?studentId=${student._id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View Student Details
                            </Link>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              disabled={deletingStudents.has(student._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                deletingStudents.has(student._id)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                              }`}
                              title="Delete Student"
                            >
                              {deletingStudents.has(student._id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                              ) : (
                                <MdDelete className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

   
    </div>
  );
}