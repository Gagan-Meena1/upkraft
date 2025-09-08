"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Student {
  _id: string;
  username: string;
  email: string;
  contact: string;
}

export default function StudentFeedbackPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get the query parameters from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        const courseId = urlParams.get('courseId');
        setCourseId(courseId);
        
        // Make sure both parameters exist
        if (!classId || !courseId) {
          console.error("Missing required parameters");
          return;
        }
        const response = await axios.get(`/Api/courseStudent?classId=${classId}&courseId=${courseId}`);
        setStudents(response.data.filteredUsers || []);
      } catch (error:any) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/tutor/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Student Feedback</h1>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 w-full max-w-full mx-auto px-8 py-12">
        
      <div className="flex items-center mb-2">
    <Link 
      href={`/tutor/courses/${courseId}`} 
      className="flex items-center justify-center bg-gray-300 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors mr-4 w-10 h-10 rounded-full"
    >
      <ChevronLeft size={28} className="text-gray-700" />
    </Link>
    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
  </div>        <p className="text-gray-600 mb-8">Provide feedback for your students by clicking on the feedback button.</p>
        
        {loading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 py-3 px-6 font-medium text-gray-700">
              <div>Student</div>
              <div>Email</div>
              <div>Contact</div>
              <div className="text-right">Action</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {students.map((student) => (
                <div key={student._id} className="grid grid-cols-4 py-4 px-6 items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {student.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 font-medium">{student.username}</span>
                  </div>
                  <div className="text-gray-600">{student.email}</div>
                  <div className="text-gray-600">{student.contact}</div>
                  <div className="text-right">
                    <Link 
                      href={`/tutor/singleStudentFeedbackByCourse?studentId=${student._id}&courseId=${new URLSearchParams(window.location.search).get('courseId')}&classId=${new URLSearchParams(window.location.search).get('classId')}`}
                      className="px-4 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition inline-block"
                    >
                      Provide Feedback
                    </Link>
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No students found for this class and course.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}