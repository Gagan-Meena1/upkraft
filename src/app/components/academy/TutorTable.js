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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedTutor, setSelectedTutor] = useState(null);
const [formData, setFormData] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [updateSuccess, setUpdateSuccess] = useState(false);
const [formErrors, setFormErrors] = useState({});
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

const handleEditClick = (tutor) => {
  setSelectedTutor(tutor);
  setFormData({
    username: tutor.username,
    email: tutor.email,
    contact: tutor.contact || '',
    address: tutor.address || ''
  });
  setIsEditModalOpen(true);
};

const handleModalClose = () => {
  setIsEditModalOpen(false);
  setFormErrors({});
  setUpdateSuccess(false);
  setSelectedTutor(null);
  setFormData({});
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedTutor?._id) return;
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  try {
    const submitFormData = new FormData();
    submitFormData.append('userData', JSON.stringify(formData));
    
    const response = await fetch(`/Api/userUpdate?userId=${selectedTutor._id}`, {
      method: "PUT",
      body: submitFormData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update error:', errorData);
      throw new Error(errorData.message || "Failed to update tutor");
    }
    
    const result = await response.json();
    console.log("Update success:", result);
    
    // Update the local tutor data
    setTutors(prev => 
      prev.map(t => t._id === selectedTutor._id ? { ...t, ...formData } : t)
    );
    
    setUpdateSuccess(true);
    
    setTimeout(() => {
      handleModalClose();
    }, 1500);
  } catch (err) {
    console.error("Error updating tutor:", err);
    alert(err.message || "Failed to update tutor. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
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
                      <th>Credits</th> 
                      <th>CSAT Score</th>
                      <th>Class Quality Score</th>
                      <th>Overall Performance Score</th>
                      <th>Feedback Pending</th>
                      {/* <th>Revenue</th> */}
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
      {/* ✅ CREDITS COLUMN */}
      <td>
        <span className={(tutor.credits >= 0 || tutor.teachingMode === 'Online') ? 'text-primary fw-bold' : 'text-muted'}>
          {(tutor.credits >= 0 || tutor.teachingMode === 'Online' )
            ? (tutor.credits || 0) 
            : 'N/A'
          }
        </span>
      </td>
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
      {/* <td>{formatCurrency(tutor.revenue || 0)}</td> */}
      <td>
        <span className={getStatusClass(tutor.isVerified)}>
          {getStatusText(tutor.isVerified)}
        </span>
      </td>
      <td className="text-center">
        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
          <li>
            <button 
              className="link-btn border-0 bg-transparent p-0"
              onClick={() => handleEditClick(tutor)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.50195 21H21.502" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" strokeWidth="2" strokeLinejoin="round"></path>
              </svg>
            </button>
          </li>
          <li></li>
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
      {/* Edit Tutor Modal */}
{isEditModalOpen && selectedTutor && (
  <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900 m-0">
            Edit Tutor
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
              width="24"
              height="24"
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
          <div className="d-flex flex-column gap-3">
            {/* Name Field */}
            <Form.Group>
              <Form.Label className="fw-bold text-gray-900">
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className={formErrors.username ? "border-danger" : ""}
                placeholder="Enter tutor name"
                required
              />
              {formErrors.username && (
                <Form.Text className="text-danger fw-medium">
                  {formErrors.username}
                </Form.Text>
              )}
            </Form.Group>

            {/* Email Field */}
            <Form.Group>
              <Form.Label className="fw-bold text-gray-900">
                Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className={formErrors.email ? "border-danger" : ""}
                placeholder="Enter email address"
                required
              />
              {formErrors.email && (
                <Form.Text className="text-danger fw-medium">
                  {formErrors.email}
                </Form.Text>
              )}
            </Form.Group>

            {/* Phone Field */}
            <Form.Group>
              <Form.Label className="fw-bold text-gray-900">
                Phone
              </Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact || ""}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </Form.Group>

            {/* Address Field */}
            <Form.Group>
              <Form.Label className="fw-bold text-gray-900">
                Address
              </Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
            </Form.Group>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              type="submit"
              className="w-100 py-3 px-4 border-0 rounded text-base fw-bold text-white"
              style={{ backgroundColor: '#7c3aed' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border spinner-border-sm text-white me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Updating...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>

            {/* Success Message */}
            {updateSuccess && (
              <div className="mt-3 p-3 text-center text-sm fw-medium text-success bg-success bg-opacity-10 rounded border border-success">
                Tutor updated successfully!
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TutorTable;
