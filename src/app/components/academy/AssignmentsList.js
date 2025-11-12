"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Button, Dropdown, Form, ProgressBar } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [tutorFilter, setTutorFilter] = useState("All Tutors");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/assignment');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const data = await response.json();
        
        if (data.success) {
          setAssignments(data.data.assignments || []);
        } else {
          throw new Error(data.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Get unique tutors and courses for filters
  const uniqueTutors = [...new Set(assignments.map(a => a.tutor?.username).filter(Boolean))];
  const uniqueCourses = [...new Set(assignments.map(a => a.course?.title).filter(Boolean))];

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.tutor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "All Status" ? true :
      statusFilter === "Pending" ? !assignment.status :
      statusFilter === "Completed" ? assignment.status :
      statusFilter === "Overdue" ? new Date(assignment.deadline) < new Date() && !assignment.status :
      true;
    
    const matchesTutor = 
      tutorFilter === "All Tutors" ? true :
      assignment.tutor?.username === tutorFilter;
    
    const matchesCourse = 
      courseFilter === "All Courses" ? true :
      assignment.course?.title === courseFilter;
    
    return matchesSearch && matchesStatus && matchesTutor && matchesCourse;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isOverdue = deadline < now && !assignment.status;
    
    if (isOverdue) {
      return <span className="status-badge status-overdue">Overdue</span>;
    } else if (assignment.status) {
      return <span className="status-badge status-completed">Completed</span>;
    } else {
      return <span className="status-badge status-pending">Pending</span>;
    }
  };

  const getStatusClass = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isOverdue = deadline < now && !assignment.status;
    
    if (isOverdue) {
      return "status-overdue";
    } else if (assignment.status) {
      return "status-completed";
    } else {
      return "status-pending";
    }
  };

  if (isLoading) {
    return (
      <div className="card-box">
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-box">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec justify-content-end d-flex align-items-center mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="right-form">
            <Form>
              <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
                <div className="search-box">
                  <Form.Group className="position-relative mb-0">
                    <Form.Label className="d-none">search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingRight: '40px' }}
                    />
                    <Button
                      type="button"
                      className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute"
                      style={{ 
                        right: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                      disabled
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
                        <path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Button>
                  </Form.Group>
                </div>
                <div className="select-box">
                  <Form.Select 
                    aria-label="Status filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select 
                    aria-label="Tutor filter"
                    value={tutorFilter}
                    onChange={(e) => setTutorFilter(e.target.value)}
                  >
                    <option>All Tutors</option>
                    {uniqueTutors.map(tutor => (
                      <option key={tutor} value={tutor}>{tutor}</option>
                    ))}
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select 
                    aria-label="Course filter"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option>All Courses</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </div>

        <div className="assignments-list-com">
          <div className="table-sec">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1300">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Tutor</th>
                    <th>Course</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Submissions</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center p-5">
                        <p className="mb-0">No assignments found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssignments.map((assignment) => {
                      const isOverdue = new Date(assignment.deadline) < new Date() && !assignment.status;
                      const totalStudents = assignment.totalAssignedStudents || 0;
                      const completedCount = assignment.status ? totalStudents : 0; // This would need to come from API
                      
                      return (
                        <tr key={assignment._id}>
                          <td>
                            <div className="student-img-name d-flex align-items-center gap-2">
                              <div className="img-icons-box">
                                {assignment.course?.category === 'Piano' ? '🎹' : 
                                 assignment.course?.category === 'Guitar' ? '🎸' : 
                                 assignment.course?.category === 'Vocals' ? '🎤' : '📝'}
                              </div>
                              <div className="text-box">
                                <h6>{assignment.title || 'Untitled Assignment'}</h6>
                                <span>{assignment.course?.title || 'No Course'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="student-img-name d-flex align-items-center gap-2">
                              <div className="text-box">
                                <h6>{assignment.tutor?.username || 'N/A'}</h6>
                                <span>{assignment.tutor?.email || ''}</span>
                              </div>
                            </div>
                          </td>
                          <td>{assignment.course?.title || 'N/A'}</td>
                          <td>{totalStudents} {totalStudents === 1 ? 'student' : 'students'}</td>
                          <td>
                            <div className="time-badge">
                              <span className="d-block">{isOverdue ? '⚠️' : '📅'}</span>
                              <div className="text-box">
                                <span>{formatDate(assignment.deadline)}</span>
                                {isOverdue && <span className="d-block">(Overdue)</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="progress-indicator">
                              <div className={`progress-ring ${completedCount === totalStudents && totalStudents > 0 ? 'progress-complete' : completedCount > 0 ? 'progress-partial' : ''}`}>
                                {completedCount}/{totalStudents}
                              </div>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(assignment)}
                          </td>
                          <td>---</td>
                          <td className="text-center">
                            <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                              <li>
                                <Link className="text-btn-blue" href={`/academy/assignments/${assignment._id}`}>
                                  View
                                </Link>
                              </li>
                              <li>
                                <Link className="text-btn-blue" href={`/academy/assignments/${assignment._id}`}>
                                  {assignment.status ? 'Report' : 'Grade'}
                                </Link>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                />
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <Pagination.Item 
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <Pagination.Ellipsis key={page} />;
                  }
                  return null;
                })}
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsList;
