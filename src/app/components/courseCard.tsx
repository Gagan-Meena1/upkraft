import React from 'react';
import { Clock, IndianRupee, Users, ArrowRight ,BarChart3,Eye} from 'lucide-react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  price: number;
  curriculum: {
    sessionNo: number;
    topic: string;
    tangibleOutcome: string;
  }[];
}

interface CourseCardProps {
  course: Course;
  userData: any;
  viewPerformanceRoutes: Record<string, string>;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, userData, viewPerformanceRoutes }) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden">
      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
          {course.category}
        </span>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors truncate !text-[20px]">
            {course.title}
          </h3>
          <p 
            className="text-gray-600 text-sm leading-relaxed truncate hover:rounded transition-all duration-200 relative z-10" 
            title={course.description}
          >
            {course.description}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-6 py-3 px-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{course.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Sessions</p>
              <p className="text-sm font-semibold text-gray-900">{course.curriculum.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
              <IndianRupee className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Price</p>
              <p className="text-sm font-semibold text-gray-900">₹{course.price.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/student/courses/courseDetails?courseId=${course._id}`}>
            <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2">
                <Eye size={18} />
                Details
                </button>
            </Link>
            <Link href={`/student/courseQuality?courseId=${course._id}`}>
              <button className="w-full bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2">
                <BarChart3 size={18} />
                Quality
            </button>
            </Link>
          </div>
           <Link
            href={`${viewPerformanceRoutes[course.category as keyof typeof viewPerformanceRoutes] || "/student/performance/viewPerformance"}?courseId=${course._id}&studentId=${userData._id}`}
            className="group/btn"
          >
            <button className="w-full flex items-center justify-between px-4 py-3 mb-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
              <span className="font-medium">View Performance</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0   transition-all duration-300 pointer-events-none rounded-2xl" />
    </div>
  );
};

export default CourseCard;