"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image'
import Profile from "../../../assets/Mask-profile.png";

const PerformingTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/Api/academy/tutors", {
          method: "GET",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch tutors");
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.tutors)) {
          // Sort by CSAT score (performance) in descending order
          const sortedTutors = [...data.tutors].sort((a, b) => {
            return (b.csatScore || 0) - (a.csatScore || 0);
          });
          setTutors(sortedTutors);
        } else {
          setTutors([]);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        setError("Failed to load tutors");
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

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

  // Calculate classes this month for tutors
  const [classesCounts, setClassesCounts] = useState({});

  useEffect(() => {
    const fetchClassesCounts = async () => {
      if (tutors.length === 0 || loading) return;
      
      const countsMap = {};
      
      const classesPromises = tutors.map(async (tutor) => {
        try {
          const classResponse = await fetch(`/Api/getClasses?tutorId=${tutor._id}`, {
            method: "GET",
            credentials: "include",
          });
          if (classResponse.ok) {
            const classData = await classResponse.json();
            if (classData?.success && Array.isArray(classData.classes)) {
              const now = new Date();
              const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
              
              const classesThisMonth = classData.classes.filter((cls) => {
                if (!cls.startTime) return false;
                const startTime = new Date(cls.startTime);
                return startTime >= thisMonthStart && startTime <= thisMonthEnd;
              }).length;
              
              countsMap[tutor._id] = classesThisMonth;
              return;
            }
          }
        } catch (error) {
          console.error(`Error fetching classes for tutor ${tutor._id}:`, error);
        }
        // Fallback to classCount if we can't fetch classes
        countsMap[tutor._id] = tutor.classCount || 0;
      });

      await Promise.all(classesPromises);
      setClassesCounts(countsMap);
    };

    // Only fetch when loading is complete and we have tutors
    if (!loading && tutors.length > 0 && Object.keys(classesCounts).length === 0) {
      fetchClassesCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only run when loading state changes

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
                  ) : tutors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No tutors found
                      </td>
                    </tr>
                  ) : (
                    tutors.map((tutor) => {
                      // Get primary skill/subject from tutor courses or skills
                      const primarySkill = tutor.tutorCourses && tutor.tutorCourses.length > 0
                        ? tutor.tutorCourses[0]?.category || tutor.tutorCourses[0]?.title || "N/A"
                        : tutor.skills || "N/A";

                      // Get classes this month from the counts map, fallback to classCount
                      const classesThisMonth = classesCounts[tutor._id] !== undefined
                        ? classesCounts[tutor._id]
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
