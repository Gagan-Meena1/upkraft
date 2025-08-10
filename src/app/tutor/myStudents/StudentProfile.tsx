import React from "react";
import { ArrowLeft, ArrowUpRight, ExternalLink, Play } from "lucide-react";

interface StudentProfileProps {
  student: {
    id: number;
    name: string;
    location: string;
    sessionScore: number;
    assignmentPending: number;
    rating: number;
    avatar: string;
  };
  onBack: () => void;
  setShowPerformance: (show: boolean) => void;
}

const CircularProgress: React.FC<{
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  sublabel: string;
  avatar?: string;
  studentName?: string;
}> = ({
  value,
  max,
  size,
  strokeWidth,
  color,
  label,
  sublabel,
  avatar,
  studentName,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {avatar && studentName && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={avatar}
              alt={studentName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          </div>
        )}
      </div>
      <div className="text-center mt-3">
        <div className="text-2xl font-bold text-gray-900">
          {value}
          <span className="text-lg text-gray-500">/{max}</span>
        </div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  );
};

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onBack,
  setShowPerformance,
}) => {
  const score = 5.6;
  const percentage = (score / 10) * 100;

  const radius = 60;
  const fullCircumference = 2 * Math.PI * radius;
  const arcCircumference = (270 / 360) * fullCircumference; // 270° arc
  const offset = arcCircumference - (percentage / 100) * arcCircumference;
  const perfomanceCircumference = (180 / 360) * fullCircumference;
  // Arc center
  const cx = 80;
  const cy = 80;

  // Start angle in degrees BEFORE rotation
  const startAngle = -135; // 270° arc starting at left-top
  const endAngle = startAngle + (percentage / 100) * 270;

  // Convert to radians
  const angleRad = (endAngle * Math.PI) / 180;

  // Dot position
  const dotX = cx + radius * Math.cos(angleRad);
  const dotY = cy + radius * Math.sin(angleRad);
  return (
    <div className="h-full  flex flex-col overflow-y-auto">
      <div className="flex flex-col gap-8 ">
        {/* Profile Card */}
        <div className="grid grid-cols-8 gap-8">
          <div className="border border-blue-400 rounded-lg p-6 flex flex-col items-center text-center col-span-2">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#F5F5F5] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Eunice Robel"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#212121]">
              Eunice Robel
            </h2>
            <p className="text-[#505050] text-lg">Egypt</p>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 col-span-3">
            <h3 className="text-lg font-bold text-black mb-4">
              Personal Details
            </h3>
            <hr className="my-2 border-gray-200" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Email :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  eunicerrobel@gmail.com
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Contact :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  698.661.1830
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Age :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  22
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">DOB :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  1 January 2022
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Gender :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  Female
                </span>
              </div>
            </div>
          </div>

          {/* Fee Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 col-span-3">
            <h3 className="text-lg font-bold text-black mb-4">Fee Status</h3>
            <hr className="my-2 border-gray-200" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Course :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  Piano Classes & Guitar Classes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Course Fee :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  Rs. 80,000
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">
                  Amount Paid :
                </span>
                <span className="text-[#212121] font-medium text-[16px]">
                  NA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Status :</span>
                <span className="text-[#E53935] font-medium text-[16px]">
                  Not Paid
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#505050] text-[16px]">Paid Via :</span>
                <span className="text-[#212121] font-medium text-[16px]">
                  NA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*  Details */}
        <div className="lg:col-span-3  bg-white p-8 rounded-xl shadow-sm">
          {/* Courses Enrolled */}
          <div className="">
            <h3 className="text-xl font-semibold text-[#212121] ">
              Courses Enrolled
            </h3>
            <hr className="my-6 border-gray-200" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-purple-600 mb-2">
                    Piano Classes
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Learn the basics of piano playing with fun, interactive
                    lessons designed for beginners.
                  </p>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                    <div>
                      Sessions :{" "}
                      <span className="font-medium text-gray-900">12</span>
                    </div>
                    <div>
                      Duration :{" "}
                      <span className="font-medium text-gray-900">2 Month</span>
                    </div>
                    <div>
                      Fee :{" "}
                      <span className="font-medium text-gray-900">
                        Rs 40,000
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowPerformance(true);
                      onBack();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <span>View Performance</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-gray-600 mb-4">
                  Overall Course Performance
                </h4>
                <div className="relative w-48 h-48">
                  <svg
                    className="w-full h-full rotate-[-45deg]"
                    viewBox="0 0 160 160"
                  >
                    {/* Track */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${perfomanceCircumference} ${fullCircumference}`}
                      strokeLinecap="round"
                      transform={`rotate(${startAngle} ${cx} ${cy})`}
                    />
                    {/* Progress */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      stroke="#FFC357"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${arcCircumference} ${fullCircumference}`}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      transform={`rotate(${startAngle} ${cx} ${cy})`}
                    />
                  </svg>

                  <div className="absolute top-[30%] right-[35%]  justify-center flex flex-col gap-2 items-center">
                    <div>
                      <span className="text-2xl font-semibold text-purple-600">
                        {score}
                      </span>
                      <span className="text-gray-500 text-lg">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200" />
          {/* Performance Metrics */}
          <div className="flex justify-around gap-6">
            {/* Class Quality Score */}
            <div className=" flex flex-col items-center">
              <h3 className="text-[16px] font-semibold text-[#212121] mb-4">
                Class Quality Score
              </h3>

              <div className="relative w-64 h-64">
                <svg
                  className="w-full h-full rotate-[-90deg]"
                  viewBox="0 0 160 160"
                >
                  {/* Track */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${arcCircumference} ${fullCircumference}`}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle} ${cx} ${cy})`}
                  />
                  {/* Progress */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#7C3AED"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${arcCircumference} ${fullCircumference}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle} ${cx} ${cy})`}
                  />
                  {/* Yellow end dot */}
                  <circle cx={dotX} cy={dotY} r="7" fill="gold" />
                </svg>

                {/* Avatar in center */}
                <div className="absolute top-[35%] left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-[55%] left-[40%]  justify-center flex flex-col gap-2 items-center">
                  <div>
                    <span className="text-2xl font-semibold text-purple-600">
                      {score}
                    </span>
                    <span className="text-gray-500 text-lg">/10</span>
                  </div>
                  <p className="text-gray-500 text-sm">Excellent</p>
                </div>
              </div>

              <button className="flex items-center space-x-1 text-[#6E09BD] border border-purple-600 px-4 py-2 rounded-sm text-sm font-medium hover:bg-purple-50 transition">
                <span>View Details</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className=" flex flex-col items-center ">
              <h3 className="text-[16px] font-semibold text-[#212121] mb-4">
                Assignments
              </h3>

              <div className="relative w-64 h-64">
                <svg
                  className="w-full h-full rotate-[-90deg]"
                  viewBox="0 0 160 160"
                >
                  {/* Track */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${arcCircumference} ${fullCircumference}`}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle} ${cx} ${cy})`}
                  />
                  {/* Progress */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#7C3AED"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${arcCircumference} ${fullCircumference}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle} ${cx} ${cy})`}
                  />
                  {/* Yellow end dot */}
                  <circle cx={dotX} cy={dotY} r="7" fill="gold" />
                </svg>

                {/* Avatar in center */}
                <div className="absolute top-[35%] left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-[55%] left-[40%]  justify-center flex flex-col gap-2 items-center">
                  <div>
                    <span className="text-2xl font-semibold text-purple-600">
                      {score}
                    </span>
                    <span className="text-gray-500 text-lg">/10</span>
                  </div>
                  <p className="text-gray-500 text-sm">Excellent</p>
                </div>
              </div>

              <button className="flex items-center space-x-1 text-[#6E09BD] border border-purple-600 px-4 py-2 rounded-sm text-sm font-medium hover:bg-purple-50 transition">
                <span>View Details</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
            {/* Latest Class Highlight */}
            <div className=" h-full flex flex-col items-center justify-between gap-8">
              <h3 className="text-[16px] font-semibold text-[#212121]">
                Latest Class Highlight
              </h3>
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Piano lesson"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => alert("Play Video")}
                    aria-label="Play Video"
                    className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
                  >
                    <Play size={20} className="text-gray-700 ml-1" />
                  </button>
                </div>
              </div>
              <button className="flex items-center space-x-1 text-[#6E09BD] border border-purple-600 px-4 py-2 rounded-sm text-sm font-medium hover:bg-purple-50 transition">
                <span>View More</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
