"use client"
import { useState, useEffect } from "react";
import { MdDelete, MdMenu, MdClose } from "react-icons/md";
import { ChevronLeft, Plus, ArrowLeft, User, Mail, Phone, BookOpen } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
      {/* Mobile Navigation Header */}
      <div className="bg-white border-b border-gray-200 w-full sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 truncate">
                My Students
              </h1>
            </div>
            
            {/* Right side - Mobile menu button (hidden on desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              {mobileMenuOpen ? (
                <MdClose className="h-6 w-6 text-gray-600" />
              ) : (
                <MdMenu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {/* Desktop action buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden border-t border-gray-200 bg-white transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-4 space-y-3">
            <button className="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section - Hidden on mobile (info is in nav) */}
        <div className="hidden sm:flex justify-between items-center mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              My Students
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage and track your students
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="w-full flex justify-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md w-full text-center">
              <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-base sm:text-lg font-medium text-red-800">Failed to Load Students</h3>
              <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchStudents();
                }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Main Content */
          <div className="bg-white shadow-sm sm:shadow-md rounded-lg sm:rounded-xl overflow-hidden border border-gray-100">
            {students.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="text-center max-w-sm">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">No Students Yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    You haven't added any students to your list. Start by adding your first student.
                  </p>
                  <button className="mt-6 w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Student
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800">Name</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800">Email</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800">Contact</th>
                        <th className="px-6 py-4 text-center font-semibold text-gray-800">Assign Course</th>
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
                          <td className="px-6 py-4 text-center">
                            <button className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                              Assign Course
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                                View Details
                              </button>
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

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden">
                  <div className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <div key={student._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                        <div className="space-y-3">
                          {/* Student Info */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                  {student.username}
                                </h3>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{student.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span>{student.contact}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              disabled={deletingStudents.has(student._id)}
                              className={`p-2 rounded-lg transition-colors ml-3 ${
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

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Assign Course
                            </button>
                            <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}