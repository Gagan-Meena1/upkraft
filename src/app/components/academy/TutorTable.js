"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link';
import { Button, Dropdown, Form } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import Profile from "../../../assets/Mask-profile.png";

const TutorTable = ({ refreshKey, tutorsData, loading: externalLoading }) => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Performance");
  useEffect(() => {
  if (tutorsData && tutorsData.length >= 0) {
    setTutors(tutorsData);
    setLoading(false);
  }
}, [tutorsData]);

  // useEffect(() => {
  //   fetchTutors();
  // }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [tutors, searchTerm, subjectFilter, statusFilter, sortBy]);

  useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading]);
  const applyFilters = () => {
    let filtered = [...tutors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.skills?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter (using skills field as subject)
    // Subject/Course filter
if (subjectFilter !== "All Subjects") {
  filtered = filtered.filter(tutor =>
    tutor.tutorCourses?.some(course => 
      course.title?.toLowerCase().includes(subjectFilter.toLowerCase())
    )
  );
}

    // Status filter
    if (statusFilter !== "All Status") {
      if (statusFilter === "Active") {
        filtered = filtered.filter(tutor => tutor.isVerified);
      } else if (statusFilter === "Inactive") {
        filtered = filtered.filter(tutor => !tutor.isVerified);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Performance":
          return (b.csatScore || 0) - (a.csatScore || 0);
        case "Name (A-Z)":
          return (a.username || "").localeCompare(b.username || "");
        case "Students":
          return (b.studentCount || 0) - (a.studentCount || 0);
        case "Revenue":
          return (b.revenue || 0) - (a.revenue || 0);
        case "Join Date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredTutors(filtered);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusClass = (isVerified) => {
    return isVerified ? "text-active" : "text-muted";
  };

  const getStatusText = (isVerified) => {
    return isVerified ? "● Active" : "● Inactive";
  };

  if (loading) {
    return (
      <div className="card-box">
        <div className="assignments-list-sec">
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Top Tutors Performing</h2>
          </div>
          <div className='right-form'>
            <Form>
              <div className='right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap'>
                <div className='search-box'>
                  <Form.Group className="position-relative mb-0">
                    <Form.Label className='d-none'>search</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Search tutors by name, subject, or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="button" className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Button>
                  </Form.Group>
                </div>
                <div className='select-box'>
                  <Form.Select 
                    aria-label="Subject filter"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <option>All Subjects</option>
                    <option value="Piano">Piano</option>
                    <option value="Guitar">Guitar</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Drums">Drums</option>
                    <option value="Keyboard">Keyboard</option>
                  </Form.Select>
                </div>
                <div className='select-box'>
                  <Form.Select 
                    aria-label="Status filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </div>
                <div className='select-box'>
                  <Form.Select 
                    aria-label="Sort by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Performance">Sort by: Performance</option>
                    <option value="Name (A-Z)">Sort by: Name (A-Z)</option>
                    <option value="Students">Sort by: Students</option>
                    <option value="Revenue">Sort by: Revenue</option>
                    <option value="Join Date">Sort by: Join Date</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <div className="assignments-list-com">
          <div className="table-sec">
            <div className="table-responsive">
              {filteredTutors.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No tutors found. Click "Add Tutor" to create your first tutor.</p>
                </div>
              ) : (
                <table className="table align-middle m-0 w-1200">
                  <thead>
                    <tr>
                      <th>Tutor</th>
                      <th>Subject</th>
                      <th>Students</th>
                      <th>Classes</th>
                      <th>CSAT Score</th>
                      <th>Class Quality Score</th>
                      <th>Overall Performance Score</th>
                      <th>Feedback Pending</th>
                      <th>Revenue</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTutors.map((tutor) => (
                      <tr key={tutor._id}>
                        <td>
                          <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="img-box">
                              {tutor.profileImage ? (
                                <Image 
                                  src={tutor.profileImage} 
                                  alt={tutor.username} 
                                  width={40}
                                  height={40}
                                  className="rounded-circle"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                                  style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                  {tutor.username?.charAt(0)?.toUpperCase() || 'T'}
                                </div>
                              )}
                            </div>
                            <div className="text-box">
                              <h6>{tutor.username || "Unknown"}</h6>
                              <span>{tutor.email || "No email"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {tutor.tutorCourses && tutor.tutorCourses.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {tutor.tutorCourses.slice(0, 2).map((course, index) => (
                                <span key={course._id || index} className="text-dark">
                                  {course.title}
                                </span>
                              ))}
                              {tutor.tutorCourses.length > 2 && (
                                <span className="text-muted small">
                                  +{tutor.tutorCourses.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">No courses</span>
                          )}
                        </td>
                        <td>{tutor.studentCount || 0}</td>
                        <td>{tutor.classCount || 0}</td>
                        <td>
                          <span className="lighter-blue">
                            {tutor.csatScore ? `${tutor.csatScore}%` : "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className="lighter-blue">
                            {tutor.classQualityScore ? `${tutor.classQualityScore}/10` : "0/10"}
                          </span>
                        </td>
                        <td>
                          <span className="lighter-blue">
                            {tutor.overallPerformanceScore ? `${tutor.overallPerformanceScore}/10` : "0/10"}
                          </span>
                        </td>
                        <td>
                          <span className={tutor.pendingFeedbackCount > 0 ? "text-warning" : "text-muted"}>
                            {tutor.pendingFeedbackCount || 0}
                          </span>
                        </td>
                        <td>{formatCurrency(tutor.revenue || 0)}</td>
                        <td>
                          <span className={getStatusClass(tutor.isVerified)}>
                            {getStatusText(tutor.isVerified)}
                          </span>
                        </td>
                        <td className="text-center">
                          <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                              <Link className="link-btn" href={`/academy/tutors/edit?id=${tutor._id}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3.50195 21H21.502" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                  <path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" strokeWidth="2" strokeLinejoin="round"></path>
                                </svg>
                              </Link>
                            </li>
                            <li>
                              <Link className="link-btn" href="#" onClick={(e) => {
                                e.preventDefault();
                                if (confirm(`Are you sure you want to delete ${tutor.username}?`)) {
                                  // Handle delete action here
                                  console.log("Delete tutor:", tutor._id);
                                }
                              }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                              </Link>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {filteredTutors.length > 0 && (
            <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev />
                <Pagination.Item active>{1}</Pagination.Item>
                <Pagination.Next />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorTable;
