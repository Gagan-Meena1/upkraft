"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image'
import Profile from "../../../assets/Mask-profile.png";

// interface PerformingTutorsProps {
//   tutorsData: any[];
//   tutorClassCounts: Record<string, number>;
//   isTutorsLoading: boolean;
//   tutorsError: string | null;
// }

const PerformingTutors= ({ 
  tutorsData, 
  tutorClassCounts,
  isTutorsLoading, 
  tutorsError 
}) => {
  const [sortedTutors, setSortedTutors] = useState([]);

  // Sort tutors by CSAT score when data changes
  useEffect(() => {
    if (tutorsData && tutorsData.length > 0) {
      const sorted = [...tutorsData].sort((a, b) => {
        return (b.csatScore || 0) - (a.csatScore || 0);
      });
      setSortedTutors(sorted);
    } else {
      setSortedTutors([]);
    }
  }, [tutorsData]);

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatCSAT = (csatScore) => {
    if (!csatScore || csatScore === 0) return "0%";
    return `${Math.round(csatScore)}%`;
  };

  const getCSATClass = (csatScore) => {
    if (!csatScore || csatScore === 0) return "lighter-red";
    if (csatScore >= 90) return "lighter-blue";
    if (csatScore >= 80) return "lighter-blue";
    return "lighter-red";
  };

  const loading = isTutorsLoading;
  const error = tutorsError;

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Top Performing Tutors</h2>
          </div>
        </div>
        <div className="assignments-list-com">
          <div className="table-sec ">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1200">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Students </th>
                    <th>Classes (This Month)</th>
                    <th>CSAT Score</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading tutors...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-danger">
                        {error}
                      </td>
                    </tr>
                  ) : sortedTutors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No tutors found
                      </td>
                    </tr>
                  ) : (
                    sortedTutors.map((tutor) => {
                      // Get primary skill/subject from tutor courses or skills
                      const primarySkill = tutor.tutorCourses && tutor.tutorCourses.length > 0
                        ? tutor.tutorCourses[0]?.category || tutor.tutorCourses[0]?.title || "N/A"
                        : tutor.skills || "N/A";

                      // Get classes this month from passed data, fallback to classCount
                      const classesThisMonth = tutorClassCounts[tutor._id] !== undefined
                        ? tutorClassCounts[tutor._id]
                        : tutor.classCount || 0;

                      return (
                        <tr key={tutor._id}>
                          <td>
                            <div className="student-img-name d-flex align-items-center gap-2">
                              <div className="img-box">
                                <Image 
                                  src={tutor.profileImage || Profile} 
                                  alt={tutor.username || "Tutor"} 
                                  width={40}
                                  height={40}
                                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                              </div>
                              <div className="text-box">
                                <h6>{tutor.username || "N/A"}</h6>
                                <span>{primarySkill}</span>
                              </div>
                            </div>
                          </td>
                          <td>{tutor.studentCount || 0}</td>
                          <td>{classesThisMonth}</td>
                          <td>
                            <span className={getCSATClass(tutor.csatScore)}>
                              {formatCSAT(tutor.csatScore)}
                            </span>
                          </td>
                          <td>{formatCurrency(tutor.revenue)}</td>
                          <td>
                            <span className={tutor.isVerified ? "text-active" : "text-muted"}>
                              ● {tutor.isVerified ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformingTutors;