import React, { useEffect, useState } from "react";
import {
  Clock,
  IndianRupee,
  Users,
  ArrowRight,
  BarChart3,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Pagination from "react-bootstrap/Pagination";
import "./MyCourse.css";
import { Button } from "react-bootstrap";
import Student01 from "@/assets/student-01.png";
import Image from "next/image";
import "./MyCourse.css";

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
  tutorName?: string;
  instructor?: string; // Add this if not present
}

interface CourseCardProps {
  course: Course;
  userData: any;
  viewPerformanceRoutes: Record<string, string>;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  userData,
  viewPerformanceRoutes,
}) => {
  const [tutorData, setTutorData] = useState(course.tutorName || "");

  useEffect(() => {
    async function fetchTutorName() {
      const instructorId = course.instructor || (course as any).instructorId;
      if (!course.tutorName && instructorId) {
        try {
          const res = await fetch(
            `/Api/tutorInfoForStudent?tutorId=${instructorId}`
          );
          const data = await res.json();
          setTutorData(data?.tutor);
        } catch {
          setTutorData("N/A");
        }
      } else if (!course.tutorName) {
        setTutorData("N/A");
      }
    }
    fetchTutorName();
  }, [course.tutorName, course.instructor, (course as any).instructorId]);

  return (
    <div className="assignments-list-com">
      <div className="assignments-list-box !mb-3 !pb-3">
        <div className="w-100">
          <h3 className="!text-[18px] !mb-3">{course.title}</h3>
        </div>
        <div className="assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between">
          <div className="left-assignment  d-flex align-items-center gap-xl-4 gap-2 flex-wrap">
            <ul className="d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0">
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Started From :</span>
                <span className="student-txt">
                  <strong>25 July</strong>
                </span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Duration :</span>
                <span className="student-txt">
                  <strong>{course.duration}</strong>
                </span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Fees :</span>
                <span className="student-txt">
                  <strong>Rs {course.price}</strong>
                </span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <span className="student-text">Sessions :</span>
                <span className="student-txt ">
                  <strong>{course.curriculum.length} Sessions</strong>
                </span>
              </li>
            </ul>
            <div className="student-img-name d-flex align-items-center gap-2">
              <p>Tutor : </p>
              <Image
                width={24}
                height={24}
                src={tutorData?.profileImage || Student01}
                alt=""
              />
              <span className="name">{tutorData?.username || "N/A"}</span>
            </div>
          </div>
          <div className="right-assignment my-course-student-right mt-xxl-0 mt-3">
            <div className="student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2">
              <ul className="d-flex !align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0">
                <li>
                  <Link
                    href={`/student/courses/courseDetails?courseId=${course._id}`}
                  >
                    <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 !px-4 !py-3 !rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye size={18} />
                      Details
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href={`/student/courseQuality?courseId=${course._id}`}>
                    <button className="w-full bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 !px-4 !py-3 !rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <BarChart3 size={18} />
                      Quality
                    </button>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${
                      viewPerformanceRoutes[
                        course.category as keyof typeof viewPerformanceRoutes
                      ] || "/student/performance/viewPerformance"
                    }?courseId=${course._id}&studentId=${userData._id}`}
                    className="group/btn"
                  >
                    <button className="w-full flex items-center justify-between !px-4 !py-3 !bg-purple-700 !hover:bg-purple-600 text-white !rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                      <span className="font-medium">View Performance</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
