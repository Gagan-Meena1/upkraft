"use client";
import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Button, Form, ProgressBar } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import Profile from "../../../assets/Mask-profile.png";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const StudentTable = ({ students, pagination, onPageChange }) => {
  console.log("StudentTable students:", students);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);
const [formData, setFormData] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [updateSuccess, setUpdateSuccess] = useState(false);
const [formErrors, setFormErrors] = useState({});
const [isAssignCreditsModalOpen, setIsAssignCreditsModalOpen] = useState(false);
const [selectedStudentForCredits, setSelectedStudentForCredits] = useState(null);
const router = useRouter();
const [creditsInput, setCreditsInput] = useState(''); // Add this new state
const [isSubmittingCredits, setIsSubmittingCredits] = useState(false); 

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleProfileClick = (student) => {
  // Only show popup for online students
  if (student.teachingMode?.toLowerCase() === 'online') {
    setSelectedStudentForCredits(student);
    setIsAssignCreditsModalOpen(true);
  }
};

const handleAssignCredits = async () => {
  if (!selectedStudentForCredits || !creditsInput) {
    alert('Please enter credits amount');
    return;
  }

  const credits = parseInt(creditsInput);
  if (isNaN(credits)) {
    alert('Please enter a valid number');
    return;
  }

  setIsSubmittingCredits(true);

  try {
    const response = await fetch('/Api/academy/creditsPerCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: selectedStudentForCredits._id,
        credits: credits
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign credits');
    }

    const result = await response.json();
    alert('Credits assigned successfully!');
    
    // Close modal and reset
    handleCloseCreditsModal();
    setCreditsInput('');
    
    // Optionally reload to reflect changes
    window.location.reload();

  } catch (error) {
    console.error('Error assigning credits:', error);
    alert(error.message || 'Failed to assign credits. Please try again.');
  } finally {
    setIsSubmittingCredits(false);
  }
};
const handleCloseCreditsModal = () => {
  setIsAssignCreditsModalOpen(false);
  setSelectedStudentForCredits(null);
   setCreditsInput(''); // Reset credits input
  setIsSubmittingCredits(false); 
};

  const calculateAttendancePercentage = (attendance) => {
  if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
    return 0;
  }

  const presentCount = attendance.filter(
    (record) => record.status === 'present'
  ).length;
  
  const absentCount = attendance.filter(
    (record) => record.status === 'absent'
  ).length;

  const totalRelevant = presentCount + absentCount;

  if (totalRelevant === 0) {
    return 0;
  }

  return Math.round((presentCount / totalRelevant) * 100);
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

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  
  if (formErrors[name]) {
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }
};

const validateForm = () => {
  const errors = {};
  
  if (!formData.username?.trim()) {
    errors.username = "Name is required";
  }
  
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleEditClick = (student) => {
  setSelectedStudent(student);
  setFormData({
    username: student.username,
    email: student.email,
    contact: student.contact || '',
    address: student.address || ''
  });
  setIsEditModalOpen(true);
};

const handleModalClose = () => {
  setIsEditModalOpen(false);
  setFormErrors({});
  setUpdateSuccess(false);
  setSelectedStudent(null);
  setFormData({});
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedStudent?._id) return;
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  try {
    // Create FormData to match the API's expected format
    const submitFormData = new FormData();
    
    // Add user data as JSON string (matching the API expectation)
    submitFormData.append('userData', JSON.stringify(formData));
    
    const response = await fetch(`/Api/userUpdate?userId=${selectedStudent._id}`, {
      method: "PUT",
      body: submitFormData, // Send FormData instead of JSON
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update error:', errorData);
      throw new Error(errorData.message || "Failed to update student");
    }
    
    const result = await response.json();
    console.log("Update success:", result);
    
    // Update the local student data to reflect changes
    if (students && Array.isArray(students)) {
      const updatedStudents = students.map(s => 
        s._id === selectedStudent._id 
          ? { ...s, ...formData }
          : s
      );
      // If you have a way to update the parent component's state, call it here
      // For example: onStudentUpdate && onStudentUpdate(updatedStudents);
    }
    
    setUpdateSuccess(true);
    
    setTimeout(() => {
      handleModalClose();
      // Optionally reload the page to reflect changes
      window.location.reload();
    }, 1500);
  } catch (err) {
    console.error("Error updating student:", err);
    alert(err.message || "Failed to update student. Please try again.");
  } finally {
    setIsSubmitting(false);
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
                    <th>Credits</th>
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
                      const progressColors = getProgressColor(student.credits);
                      return (
                        <tr key={student._id}>
                          <td>
  <div 
    className={`student-img-name d-flex align-items-center gap-2 ${
      student.teachingMode?.toLowerCase() === 'online' ? 'cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors' : ''
    }`}
    onClick={() => handleProfileClick(student)}
    style={{ cursor: student.teachingMode?.toLowerCase() === 'online' ? 'pointer' : 'default' }}
  >
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
    <span className="text-purple-700 font-semibold">
      {student.teachingMode?.toLowerCase() === 'online' 
        ? (student.credits || 0) 
        : 'N/A'}
    </span>
  </div>
</td>
{/* // Update the Attendance link in StudentTable component: */}
<td>
  <Link 
    href={`/academy/attendanceView?userId=${student._id}`}
    className="btn btn-sm border-black d-inline-flex align-items-center gap-1 hover-btn hover-bg-black"
  >
    {calculateAttendancePercentage(student.attendance)}%
  </Link>
</td>
<td>{formatDate(student.lastClass)}</td>                    
                          <td>
                            <span className={getStatusColor(student.status)}>
                              {student.status}
                            </span>
                          </td>
                          <td className="text-center">
                            <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                              <li>
                                <button 
  className="link-btn border-0 bg-transparent"
  onClick={() => handleEditClick(student)}
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.50195 21H21.502" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
</button>
                              </li>
                              <li>
                                {/* <button 
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
                                </button> */}
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
      {/* Edit Student Modal */}
{isEditModalOpen && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Edit Student
          </h3>
          <Button
            onClick={handleModalClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-transparent p-0 border-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <Form.Group>
              <Form.Label className="block text-sm font-bold text-gray-900 mb-2">
                Name <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className={`block w-full px-4 py-3 border rounded-lg ${
                  formErrors.username
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter student name"
                required
              />
              {formErrors.username && (
                <Form.Text className="text-red-600 font-medium">
                  {formErrors.username}
                </Form.Text>
              )}
            </Form.Group>

            {/* Email Field */}
            <Form.Group>
              <Form.Label className="block text-sm font-bold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className={`block w-full px-4 py-3 border rounded-lg ${
                  formErrors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter email address"
                required
              />
              {formErrors.email && (
                <Form.Text className="text-red-600 font-medium">
                  {formErrors.email}
                </Form.Text>
              )}
            </Form.Group>

            {/* Phone Field */}
            <Form.Group>
              <Form.Label className="block text-sm font-bold text-gray-900 mb-2">
                Phone
              </Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact || ""}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter phone number"
              />
            </Form.Group>

            {/* Address Field */}
            <Form.Group>
              <Form.Label className="block text-sm font-bold text-gray-900 mb-2">
                Address
              </Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter address"
              />
            </Form.Group>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full py-3 px-6 border-0 rounded-lg text-base font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>

            {/* Success Message */}
            {updateSuccess && (
              <div className="mt-4 p-3 text-center text-sm font-medium text-green-800 bg-green-100 rounded-lg border border-green-200">
                Student updated successfully!
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  </div>
)}

{/* Assign Credits Modal */}
{isAssignCreditsModalOpen && selectedStudentForCredits && (
  <div 
    className="modal-overlay" 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}
  >
    <div 
      className="modal-content-custom" 
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%'
      }}
    >
      <h3 style={{ marginBottom: '20px' }}>Assign Credits Per Class</h3>
      
      {/* Student Info */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image
          src={selectedStudentForCredits.profileImage || Profile}
          alt={selectedStudentForCredits.username}
          width={50}
          height={50}
          style={{ borderRadius: '50%' }}
        />
        <div>
          <div style={{ fontWeight: '600' }}>{selectedStudentForCredits.username}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>{selectedStudentForCredits.email}</div>
        </div>
      </div>

      {/* Current Credits Display */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>Current Credits</div>
        <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
          {selectedStudentForCredits.credits || 0}
        </div>
      </div>

      {/* Credits Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Credits to Assign *
        </label>
        <input
          type="number"
          min="1"
          value={creditsInput}
          onChange={(e) => setCreditsInput(e.target.value)}
          placeholder="Enter number of credits"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }}
          disabled={isSubmittingCredits}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button 
          variant="secondary" 
          onClick={handleCloseCreditsModal}
          disabled={isSubmittingCredits}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAssignCredits}
          disabled={isSubmittingCredits || !creditsInput}
        >
          {isSubmittingCredits ? 'Assigning...' : 'Assign Credits'}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default StudentTable;