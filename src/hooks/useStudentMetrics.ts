import { useMemo } from 'react';
import { Course, StudentData } from '../types/student.types';

interface StudentMetrics {
  totalCourseFee: number;
  overallPerformanceScore: number;
  classQualityScore: number;
  pendingAssignmentScore: number;
}

export const useStudentMetrics = (
  data: StudentData,
  pendingAssignmentCount: number
): StudentMetrics => {
  return useMemo(() => {
    const courses = data.courses;

    // Calculate total course fee
    const totalCourseFee = courses.reduce((acc, course) => acc + (course.price || 0), 0);

    // Calculate overall performance score
    let totalScore = 0;
    let scoreCount = 0;

    courses.forEach((course) => {
      if (course.performanceScores?.length) {
        const studentScore = course.performanceScores.find(
          (score) =>
            (typeof score.userId === 'string' ? score.userId : score.userId._id) === data.studentId
        );

        if (studentScore?.score) {
          totalScore += studentScore.score;
          scoreCount++;
        }
      }
    });

    const overallPerformanceScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    // Calculate class quality score
    let totalQuality = 0;
    let qualityCount = 0;

    courses.forEach((course) => {
      if (course.courseQuality > 0) {
        totalQuality += course.courseQuality;
        qualityCount++;
      }
    });

    const classQualityScore = qualityCount > 0 ? totalQuality / qualityCount : 0;

    return {
      totalCourseFee,
      overallPerformanceScore: Number(overallPerformanceScore.toFixed(1)),
      classQualityScore,
      pendingAssignmentScore: pendingAssignmentCount || 0,
    };
  }, [data.courses, data.studentId, pendingAssignmentCount]);
};