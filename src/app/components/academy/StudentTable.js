"use client";
import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Button, Form, ProgressBar } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import Profile from "../../../assets/Mask-profile.png";

const StudentTable = ({ students, pagination, onPageChange }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return { text: 'lighter-blue', bar: 'progress-green' };
    if (progress >= 50) return { text: 'lighter-orange', bar: 'progress-orange' };
    return { text: 'lighter-red', bar: 'progress-red' };
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'lighter-blue';
      case 'trial': return 'lighter-red';
      case 'paused': return 'lighter-orange';
      default: return 'lighter-gray';
    }
  };

  const renderPaginationItems = () => {
    if (!pagination) return null;

    const items = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        {1}
      </Pagination.Item>
    );

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={currentPage === i}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec justify-content-end d-flex align-items-center mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className='right-form'>
            <Form>
              <div className='right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap'>
                <div className='search-box'>
                  <Form.Group className="position-relative mb-0">
                    <Form.Label className='d-none'>search</Form.Label>
                    <Form.Control type="text" placeholder="Search students by name or email..." />
                    <Button type="" className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Button>
                  </Form.Group>
                </div>
                <div className='select-box'>
                  <Form.Select aria-label="Default select example">
                    <option>All Status</option>
                    <option value="1">Active</option>
                    <option value="2">Trial</option>
                    <option value="3">Paused</option>
                    <option value="4">Churned</option>
                  </Form.Select>
                </div>
                <div className='select-box'>
                  <Form.Select aria-label="Default select example">
                    <option>Sort by: Recent</option>
                    <option value="1">Sort by: Name (A-Z)</option>
                    <option value="2">Sort by: Progress</option>
                    <option value="3">Sort by: At-Risk</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </div>

        <div className="assignments-list-com">
          <div className="table-sec ">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1200">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Tutor</th>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>Attendance</th>
                    <th>Last Class</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const progressColors = getProgressColor(student.progress);
                      return (
                        <tr key={student._id}>
                          <td>
                            <div className="student-img-name d-flex align-items-center gap-2">
                              <div className="img-box">
                                <Image 
                                  src={student.profileImage || Profile} 
                                  alt={student.username}
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="text-box">
                                <h6>{student.username}</h6>
                                <span>{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{student.tutor}</td>
                          <td>{student.course}</td>
                          <td>
                            <div className="text-box-progress d-flex align-items-center gap-2">
                              <span className={progressColors.text}>
                                {student.progress}%
                              </span>
                              <div className="left-box">
                                <span className="d-block">0/0 lessons</span>
                                <ProgressBar 
                                  variant="" 
                                  className={progressColors.bar} 
                                  now={student.progress} 
                                />
                              </div>
                            </div>
                          </td>
                          <td>{student.attendance}%</td>
                          <td>{formatDate(student.lastClass)}</td>
                          <td>
                            <span className={getStatusColor(student.status)}>
                              {student.status}
                            </span>
                          </td>
                          <td className="text-center">
                            <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                              <li>
                                <Link className="link-btn" href={`/academy/students/${student._id}`}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.50195 21H21.502" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" strokeWidth="2" strokeLinejoin="round"/>
                                  </svg>
                                </Link>
                              </li>
                              <li>
                                <button 
                                  className="link-btn border-0 bg-transparent"
                                  onClick={() => {
                                    if (confirm(`Delete student ${student.username}?`)) {
                                      // Add delete functionality
                                    }
                                  }}
                                >
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
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

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => pagination.hasPrevPage && onPageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                />
                {renderPaginationItems()}
                <Pagination.Next 
                  onClick={() => pagination.hasNextPage && onPageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTable;