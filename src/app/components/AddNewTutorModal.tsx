"use client";
import React, { useState, FormEvent } from 'react'
import { Form, Button } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import './AddAssignmentsModal.css'

interface AddNewTutorModalProps {
  onTutorAdded?: () => void;
}

const AddNewTutorModal: React.FC<AddNewTutorModalProps> = ({ onTutorAdded }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { username?: string; email?: string; password?: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/Api/academy/createTutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create tutor");
      }

      toast.success(`Tutor ${formData.username} created successfully!`);
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
      });

      // Close modal
      const modal = document.getElementById("AddTutorModal");
      if (modal) {
        const bootstrap = require('bootstrap');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      // Refresh tutor list if callback provided
      if (onTutorAdded) {
        onTutorAdded();
      }
    } catch (error: any) {
      console.error("Error creating tutor:", error);
      toast.error(error.message || "Failed to create tutor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade modal-common-sec w-800 assignment-modal-sec" id="AddTutorModal" aria-labelledby="customModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.125 1.875L1.875 18.125M1.875 1.875L18.125 18.125" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <div className='head-modal text-center'>
              <h2>Add New Tutor</h2>
              <p>Complete the form below to create a new tutor account</p>
            </div>
            <div className='form-box-modal label-strong-box'>
              <Form id="addTutorForm" onSubmit={handleSubmit}>
                <div className='row'>
                  <div className='col-md-12'>
                    <Form.Group className="mb-3" controlId="tutorName">
                      <Form.Label className='w-100 d-block'>Full Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="text" 
                        name="username"
                        placeholder="John Doe" 
                        value={formData.username}
                        onChange={handleChange}
                        isInvalid={!!errors.username}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className='col-md-12'>
                    <Form.Group className="mb-3" controlId="tutorEmail">
                      <Form.Label className='w-100 d-block'>Email address <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className='col-md-12'>
                    <Form.Group className="mb-3" controlId="tutorPassword">
                      <Form.Label className='w-100 d-block'>Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="password" 
                        name="password"
                        placeholder="Enter password" 
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters long
                      </Form.Text>
                    </Form.Group>
                  </div>
                </div>
              </Form>
            </div>
          </div>
          <div className="modal-footer">
            <Button 
              type="button" 
              variant="secondary" 
              data-bs-dismiss="modal"
              disabled={isLoading}
              className="me-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="addTutorForm"
              variant="primary" 
              disabled={isLoading}
              className="w-auto"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                "Create Tutor"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewTutorModal;

