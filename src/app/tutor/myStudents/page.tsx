"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdDelete } from "react-icons/md";

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
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
        {/* <img src="/logo.png" alt="UPKRAFT" className="w-36 h-auto" /> */}
          <Link href="/tutor" className="cursor-pointer">
                                  <Image 
                                    src="/logo.png"
                                    alt="UpKraft"
                                    width={288} // Use 2x the display size for crisp rendering
                                    height={72}  // Adjust based on your logo's actual aspect ratio
                                    priority
                                    className="object-contain w-36 h-auto" 
                                  />
                                </Link>
        </div>
      </nav>

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
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 underline text-red-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            {students.length === 0 ? (
              <div className="p-12 text-center text-gray-600">
                <p>No students found. Add students to see them listed here.</p>
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

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-12 px-8 mt-auto border-t border-gray-100">
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