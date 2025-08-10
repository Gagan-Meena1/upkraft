"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
interface Student {
  id: string;
  name: string;
  avatar: string;
  status: "Pending" | "Completed";
  lessons: string[];
}

interface EvaluationData {
  rhythm: number;
  theoreticalKnowledge: number;
  understandingOfTopic: number;
  performance: number;
  earTraining: number;
  assignment: number;
  technique: number;
  personalFeedback: string;
}
export default function Feedback() {
  const [selectedStudent, setSelectedStudent] = useState<string>("2");
  const [evaluations, setEvaluations] = useState<
    Record<string, EvaluationData>
  >({});

  const students: Student[] = [
    {
      id: "1",
      name: "Stewart Deckow",
      avatar: "/api/placeholder/32/32",
      status: "Pending",
      lessons: ["Introduction to Piano", "Finger Warmups"],
    },
    {
      id: "2",
      name: "Laurie Lynch",
      avatar: "/api/placeholder/32/32",
      status: "Pending",
      lessons: ["Simple Chords", "Rhythm Basics"],
    },
    {
      id: "3",
      name: "Hubert Keeling",
      avatar: "/api/placeholder/32/32",
      status: "Pending",
      lessons: ["Introduction to Piano", "Simple Chords"],
    },
    {
      id: "4",
      name: "Claire Schmeier",
      avatar: "/api/placeholder/32/32",
      status: "Pending",
      lessons: ["Finger Warmups"],
    },
  ];

  const currentStudent = students.find((s) => s.id === selectedStudent);
  const currentEvaluation = evaluations[selectedStudent] || {
    rhythm: 5,
    theoreticalKnowledge: 5,
    understandingOfTopic: 5,
    performance: 5,
    earTraining: 5,
    assignment: 5,
    technique: 5,
    personalFeedback: "",
  };

  const updateEvaluation = (
    field: keyof EvaluationData,
    value: number | string
  ) => {
    setEvaluations((prev) => ({
      ...prev,
      [selectedStudent]: {
        ...currentEvaluation,
        [field]: value,
      },
    }));
  };

  const RatingSlider = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[16px] font-medium text-black">{label}</span>
        <span className="text-[16px] font-medium text-[#E53935]">
          {value}/10
        </span>
      </div>
      <div className="relative">
        <input
          aria-label="range"
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #4201EB 0%, #7109B9 ${
              value * 10
            }%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`,
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffc357;
            cursor: pointer;
            /* border: 2px solid white; */
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffc357;
            cursor: pointer;
            /* border: 2px solid white; */
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  );

  const handleSubmitEvaluation = () => {
    // Handle evaluation submission
    alert(`Evaluation submitted for ${currentStudent?.name}`);
  };

  return (
    <div className="h-full bg-white flex rounded-lg flex-col ">
      <div className=" bg-white  p-6 border-b border-gray-200  flex w-full justify-between items-center">
        {/* Header */}
        <h1 className="text-xl font-semibold text-[#212121]">
          Feedback Pending
        </h1>
        <Link
          href={`/tutor`}
          className="text-[#1E88E5] text-lg font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="flex-1 flex h-full overflow-hidden">
        {/* Student List */}
        <div className="w-80 overflow-y-auto h-full bg-[#EEEEE] flex flex-col gap-6 p-6 border-r border-gray-200 custom-scrollbar">
          {students.map((student) => (
            <div
              key={student.id}
              className={` cursor-pointer transition-colors `}
              onClick={() => setSelectedStudent(student.id)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#212121] text-lg">
                    {student.name}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  {student.status}
                </span>
              </div>
              <div className="space-y-1 flex gap-2 flex-col ml-4">
                {student.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="text-[16px] text-[#212121] p-2 rounded-sm  hover:bg-[#F1ECF7]"
                  >
                    {lesson}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {students.map((student) => (
            <div
              key={student.id}
              className={` cursor-pointer transition-colors `}
              onClick={() => setSelectedStudent(student.id)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#212121] text-lg">
                    {student.name}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  {student.status}
                </span>
              </div>
              <div className="space-y-1 flex gap-2 flex-col ml-4">
                {student.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="text-[16px] text-[#212121] p-2  hover:bg-[#F1ECF7]"
                  >
                    {lesson}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Content Header */}
          <div className="bg-white p-6 flex gap-3 flex-col justify-between items-start">
            <h2 className="text-xl font-semibold text-[#212121]">
              Student Performance Evaluation
            </h2>
            <p className="text-[#505050] text-sm">
              Provide feedback on student's performance
            </p>
          </div>

          {/* Evaluation Form */}
          <div className="flex-1 px-6 w-full">
            <div className=" bg-white p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-6">
                {/* Left Column */}
                <div>
                  <RatingSlider
                    label="Rhythm"
                    value={currentEvaluation.rhythm}
                    onChange={(value) => updateEvaluation("rhythm", value)}
                  />
                  <RatingSlider
                    label="Understanding of Topic"
                    value={currentEvaluation.understandingOfTopic}
                    onChange={(value) =>
                      updateEvaluation("understandingOfTopic", value)
                    }
                  />
                  <RatingSlider
                    label="Ear Training"
                    value={currentEvaluation.earTraining}
                    onChange={(value) => updateEvaluation("earTraining", value)}
                  />
                  <RatingSlider
                    label="Technique"
                    value={currentEvaluation.technique}
                    onChange={(value) => updateEvaluation("technique", value)}
                  />
                </div>

                {/* Right Column */}
                <div>
                  <RatingSlider
                    label="Theoretical Knowledge"
                    value={currentEvaluation.theoreticalKnowledge}
                    onChange={(value) =>
                      updateEvaluation("theoreticalKnowledge", value)
                    }
                  />
                  <RatingSlider
                    label="Performance"
                    value={currentEvaluation.performance}
                    onChange={(value) => updateEvaluation("performance", value)}
                  />
                  <RatingSlider
                    label="Assignment"
                    value={currentEvaluation.assignment}
                    onChange={(value) => updateEvaluation("assignment", value)}
                  />
                </div>
              </div>

              {/* Personal Feedback */}
              <div className="mb-4">
                <h3 className="text-[16px] font-semibold text-[#212121] mb-4">
                  Personal Feedback & Area for Improvement
                </h3>
                <textarea
                  className="w-full h-32 px-4 text-[#505050] text-sm py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Provide detailed feedback and suggestions for improvement..."
                  value={currentEvaluation.personalFeedback}
                  onChange={(e) =>
                    updateEvaluation("personalFeedback", e.target.value)
                  }
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitEvaluation}
                  className="px-8 py-3 bg-[#6E09BD] cursor-pointer hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
