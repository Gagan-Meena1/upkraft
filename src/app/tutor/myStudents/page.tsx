"use client";
import React from "react";
import { Star, Info, Trash2, Plus } from "lucide-react";
import StudentProfile from "./StudentProfile";
import AddStudentModal from "./AddStudentModal";
import Performance from "./Performance";
import { StarRating } from "./components/StarRating";

interface Student {
  id: number;
  name: string;
  location: string;
  sessionScore: number;
  assignmentPending: number;
  rating: number;
  avatar: string;
}

const students: Student[] = [
  {
    id: 1,
    name: "Eunice Robel",
    location: "China",
    sessionScore: 5.6,
    assignmentPending: 6,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 2,
    name: "Arnold Hayes",
    location: "Turkey",
    sessionScore: 5.6,
    assignmentPending: 4,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 3,
    name: "Cesar Hill",
    location: "Japan",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 4,
    name: "Valerie Quitzon",
    location: "South Africa",
    sessionScore: 5.6,
    assignmentPending: 2,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 5,
    name: "Shelley Lakin",
    location: "Kenya",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 6,
    name: "Doris Walsh I",
    location: "Barbados",
    sessionScore: 5.6,
    assignmentPending: 4,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 7,
    name: "Philip Jerde",
    location: "Egypt",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 8,
    name: "Ollie Heaney",
    location: "France",
    sessionScore: 5.6,
    assignmentPending: 2,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 9,
    name: "Tara Ratke",
    location: "Belgium",
    sessionScore: 5.6,
    assignmentPending: 1,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 10,
    name: "Shaun Block",
    location: "Qatar",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 11,
    name: "Elsie Bradtke",
    location: "India",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 12,
    name: "Leigh Terry",
    location: "Bahrain",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];

const MyStudents: React.FC = () => {
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(
    null
  );
  const [isShowPerformance, setIsShowPerformance] = React.useState(false);

  const handleAddStudent = (newStudentData: {
    name: string;
    email: string;
    contact: string;
    location: string;
    avatar: string;
  }) => {
    const newStudent: Student = {
      id: students.length + 1,
      name: newStudentData.name,
      location: newStudentData.location,
      sessionScore: 0,
      assignmentPending: 0,
      rating: 0,
      avatar: newStudentData.avatar,
    };

    setStudents((prev) => [...prev, newStudent]);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };
  if (isShowPerformance) {
    return <Performance />;
  }
  // If a student is selected, show the profile page
  if (selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
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
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                      />
                      <span className=" text-black text-[16px]">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] text-[16px]">
                      {student.location}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] font-semibold text-lg">
                      {student.sessionScore}
                      <span className="text-[#212121] text-[16px] font-normal">
                        /10
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#212121] font-semibold text-lg">
                      {student.assignmentPending}
                      <span className="text-[#212121] text-[16px] font-normal">
                        /10
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StarRating rating={student.rating} />
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
                        onClick={() =>
                          setStudents((prev) =>
                            prev.filter((s) => s.id !== student.id)
                          )
                        }
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

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Eunice Robel",
    location: "China",
    sessionScore: 5.6,
    assignmentPending: 6,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 2,
    name: "Arnold Hayes",
    location: "Turkey",
    sessionScore: 5.6,
    assignmentPending: 4,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 3,
    name: "Cesar Hill",
    location: "Japan",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 4,
    name: "Valerie Quitzon",
    location: "South Africa",
    sessionScore: 5.6,
    assignmentPending: 2,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 5,
    name: "Shelley Lakin",
    location: "Kenya",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 6,
    name: "Doris Walsh I",
    location: "Barbados",
    sessionScore: 5.6,
    assignmentPending: 4,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 7,
    name: "Philip Jerde",
    location: "Egypt",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 8,
    name: "Ollie Heaney",
    location: "France",
    sessionScore: 5.6,
    assignmentPending: 2,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 9,
    name: "Tara Ratke",
    location: "Belgium",
    sessionScore: 5.6,
    assignmentPending: 1,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 10,
    name: "Shaun Block",
    location: "Qatar",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 11,
    name: "Elsie Bradtke",
    location: "India",
    sessionScore: 5.6,
    assignmentPending: 3,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 12,
    name: "Leigh Terry",
    location: "Bahrain",
    sessionScore: 5.6,
    assignmentPending: 5,
    rating: 2,
    avatar:
      "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];
export default MyStudents;
