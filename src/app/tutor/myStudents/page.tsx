"use client";
import React, { useEffect, useState } from "react";
import { Star, Info, Trash2, Plus } from "lucide-react";
import StudentProfile from "./StudentProfile";
import AddStudentModal from "./AddStudentModal";
import Performance from "./Performance";
import { StarRating } from "./components/StarRating";

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
}

const MyStudents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isShowPerformance, setIsShowPerformance] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingStudents, setDeletingStudents] = useState<Set<string>>(
    new Set()
  );

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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingStudents((prev) => new Set(prev).add(studentId));

      const response = await fetch(`/Api/myStudents?studentId=${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      const data = await response.json();

      if (data.success) {
        // Remove the student from the local state
        setStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );
        alert(data.message || "Student removed successfully");
      } else {
        throw new Error(data.message || "Failed to delete student");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setDeletingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const handleAddStudent = (newStudentData: {
    name: string;
    email: string;
    contact: string;
    location: string;
    avatar: string;
  }) => {
    const newStudent: Student = {
      _id: Math.random().toString(36).substring(2, 15), // Generate a random ID for demo purposes
      username: newStudentData.name,
      email: newStudentData.email,
      contact: newStudentData.contact,
      // Add any other fields you need
    };

    setStudents((prev) => [...prev, newStudent]);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (isShowPerformance) {
    return <Performance />;
  }
  // If a student is selected, show the profile page
  if (selectedStudent) {
    return (
      <StudentProfile
        onBack={handleBackToList}
        setShowPerformance={setIsShowPerformance}
      />
    );
  }

  return (
    <div className="h-full bg-white  shadow-xl rounded-lg flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4 md:p-6">
        <h1 className="text-xl font-semibold text-[#212121]">My Students</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6E09BD] hover:bg-purple-700 text-white px-4 py-2 rounded-sm flex items-center space-x-2 transition-colors duration-200 shadow-sm"
        >
          <span>Add Student</span>
          <Plus size={16} />
        </button>
      </div>

      {/* Students Table */}

      <div className="flex-1 overflow-y-auto w-full">
        <div className="overflow-x-auto overflow-y-auto h-full w-full">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10 p-6">
              <tr>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Location
                </th>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Session Score
                </th>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Assignment Pending
                </th>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Rating
                </th>
                <th className="text-left py-4 px-6 text-[16px] font-semibold text-[#212121]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-gray-100 divide-y-2 p-6">
              {students.map((student, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
                        }
                        alt={student.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                      />
                      <span className=" text-black text-[16px]">
                        {student.username}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] text-[16px]">
                      {/* {student.location} */}
                      China
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] font-semibold text-lg">
                      5.6
                      <span className="text-[#212121] text-[16px] font-normal">
                        /10
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] font-semibold text-lg">
                      7
                      <span className="text-[#212121] text-[16px] font-normal">
                        /10
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StarRating rating={4} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        aria-label="View Student"
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-[#1E88E5] hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete Student"
                        onClick={() => handleDeleteStudent(student._id)}
                        className="p-2 text-[#E53935] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
};

export default MyStudents;
