"use client"
import React, { useState, useEffect } from 'react'
import ProgressBar from "react-bootstrap/ProgressBar";
import { Button, Form } from 'react-bootstrap'
import Link from 'next/link'
import StudentProfileImg from '../../../assets/student-profile-img.png'
import './FeedbackPendingDetails.css'
import Image from 'next/image';
import { useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';

interface Student {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
}

interface Class {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  feedbackId?: string;
  course: string;
}

interface Course {
  _id: string;
  title: string;
  class: string[];
}

interface PendingFeedback {
  student: Student;
  classes: Class[];
  selectedClassIndex: number;
}

const FeedbackPendingDetails = () => {
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<PendingFeedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});  // ADD THIS
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({}); 
  const [feedbackData, setFeedbackData] = useState({
    rhythm: 5,
    theoretical: 5,
    understanding: 5,
    performance: 5,
    earTraining: 5,
    assignment: 5,
    technique: 5,
    feedback: ''
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchPendingFeedbacks = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get the tutor data
        const userResponse = await fetch('/Api/users/user');
        const userData = await userResponse.json();
        
        if (!userData.user || !userData.courseDetails) {
          throw new Error('Failed to load user data');
        }
        
        // Step 2: Get all classes for this tutor's courses
        const courseDetails = userData.courseDetails || [];
        const classDetails = userData.classDetails || [];
        
        // Step 3: Get all students for this tutor
        const studentsResponse = await fetch('/Api/myStudents');
        const studentsData = await studentsResponse.json();
        
        if (!studentsData.filteredUsers) {
          throw new Error('Failed to load students data');
        }
        
        const students = studentsData.filteredUsers;
        
        // Step 4: Get all existing feedback
        const feedbackPromises = courseDetails.map(async (course: Course) => {
          try {
            const response = await fetch(`/Api/studentFeedbackForTutor?courseId=${course._id}`);
            if (response.ok) {
              const data = await response.json();
              return { courseId: course._id, feedbacks: data.data || [] };
            }
            return { courseId: course._id, feedbacks: [] };
          } catch (e) {
            console.error(`Error fetching feedback for course ${course._id}:`, e);
            return { courseId: course._id, feedbacks: [] };
          }
        });
        
        const feedbackResults = await Promise.all(feedbackPromises);
        
        // Create a map of classes with feedback
        const classesWithFeedback = new Map();
        feedbackResults.forEach(result => {
          result.feedbacks.forEach((feedback: any) => {
            // Create a unique key combining classId and studentId
            const key = `${feedback.classId}-${feedback.userId}`;
            classesWithFeedback.set(key, true);
          });
        });
        
        // Find all students that need feedback
        const pendingFeedbacks: PendingFeedback[] = [];
        students.forEach((student: Student) => {
          // Find classes for this student that need feedback
          const studentClasses = classDetails.filter((cls: Class) => {
            // Check if feedback exists for this class and student
            const key = `${cls._id}-${student._id}`;
            return !classesWithFeedback.has(key);
          });
          
          if (studentClasses.length > 0) {
            pendingFeedbacks.push({
              student,
              classes: studentClasses,
              selectedClassIndex: 0
            });
          }
        });
        
        setPendingFeedbacks(pendingFeedbacks);
        if (pendingFeedbacks.length > 0) {
          setSelectedFeedback(pendingFeedbacks[0]);
        }
        
      } catch (err) {
        console.error('Error fetching pending feedbacks:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingFeedbacks();
  }, []);
  
  const handleSelectStudent = (feedback: PendingFeedback) => {
    setSelectedFeedback(feedback);
    // Reset feedback data when switching students
    setFeedbackData({
      rhythm: 5,
      theoretical: 5,
      understanding: 5,
      performance: 5,
      earTraining: 5,
      assignment: 5,
      technique: 5,
      feedback: ''
    });
  };
  
  const handleSelectClass = (feedbackIndex: number, classIndex: number) => {
    const updatedFeedbacks = [...pendingFeedbacks];
    updatedFeedbacks[feedbackIndex].selectedClassIndex = classIndex;
    setPendingFeedbacks(updatedFeedbacks);
    setSelectedFeedback(updatedFeedbacks[feedbackIndex]);
    // Reset feedback data when switching classes
    setFeedbackData({
      rhythm: 5,
      theoretical: 5,
      understanding: 5,
      performance: 5,
      earTraining: 5,
      assignment: 5,
      technique: 5,
      feedback: ''
    });
  };
  
  const handleSliderChange = (field: string, value: number) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (value: string) => {
    setFeedbackData(prev => ({ ...prev, feedback: value }));
  };
  
  const handleSubmit = async () => {
    if (!selectedFeedback) return;
    
    setIsSubmitting(true);
    const student = selectedFeedback.student;
    const classData = selectedFeedback.classes[selectedFeedback.selectedClassIndex];
    
    try {
      // Get course ID from class
      const courseId = classData.course;
      const classId = classData._id;
      const studentId = student._id;
      
      const response = await fetch(
        `/Api/studentFeedback?studentId=${studentId}&courseId=${courseId}&classId=${classId}`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...feedbackData,
            studentId,
            courseId,
            classId
          })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        // Remove the submitted feedback from the list
        let updatedFeedbacks = [...pendingFeedbacks];
        
        // Find the current feedback index
        const currentFeedbackIndex = updatedFeedbacks.findIndex(
          f => f.student._id === studentId
        );
        
        if (currentFeedbackIndex !== -1) {
          const currentFeedback = updatedFeedbacks[currentFeedbackIndex];
          
          // Remove the submitted class from the classes array
          const remainingClasses = currentFeedback.classes.filter(c => c._id !== classId);
          
          if (remainingClasses.length > 0) {
            // If there are more classes for this student, update the feedback
            updatedFeedbacks[currentFeedbackIndex] = {
              ...currentFeedback,
              classes: remainingClasses,
              selectedClassIndex: 0
            };
          } else {
            // If no more classes, remove this student from pending feedbacks
            updatedFeedbacks.splice(currentFeedbackIndex, 1);
          }
        }
        
        setPendingFeedbacks(updatedFeedbacks);
        
        // Select the next feedback or reset
        if (updatedFeedbacks.length > 0) {
          // Try to select the same index, or the previous one if we're at the end
          const nextIndex = Math.min(currentFeedbackIndex, updatedFeedbacks.length - 1);
          setSelectedFeedback(updatedFeedbacks[nextIndex]);
        } else {
          setSelectedFeedback(null);
        }
        
        // Reset feedback form
        setFeedbackData({
          rhythm: 5,
          theoretical: 5,
          understanding: 5,
          performance: 5,
          earTraining: 5,
          assignment: 5,
          technique: 5,
          feedback: ''
        });
        
        alert('Feedback submitted successfully!');
      } else {
        alert(result.message || 'Failed to submit feedback');
      }
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className='feedback-pending-details-sec'>
        <div className='feed-back-heading'>
          <h2>Feedback Pending</h2>
        </div>
        <div className='text-center py-5'>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle file upload
const handleFileChange = async (classId: string, event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) {
    return;
  }

  const file = event.target.files[0];
  console.log("File selected:", { name: file.name, size: file.size, type: file.type });
  const maxSize = 800 * 1024 * 1024; // 800MB
  if (file.size > maxSize) {
    toast.error('File size must be less than 800MB');
    return;
  }

  setUploadLoading((prev) => ({ ...prev, [classId]: true }));
  console.log(`[${classId}] Starting upload process...`);

  try {
    // 1. Get presigned URL
    console.log(`[${classId}] Requesting presigned URL...`);
    const presignedUrlResponse = await axios.post('/Api/upload/presigned-url', {
      fileName: file.name,
      fileType: file.type,
      classId: classId,
    });

    const { publicUrl } = presignedUrlResponse.data;
    console.log(`[${classId}] Public URL: ${publicUrl}`);

    // 2. Upload file directly to S3
    console.log(`[${classId}] Starting direct upload to S3...`);
    await axios.put(presignedUrlResponse.data.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        }
      },
    });

    toast.success('Recording uploaded successfully!');
    console.log(`[${classId}] Direct upload to S3 completed.`);

    // 3. save the public URL in mongoDB
    console.log(`[${classId}] Notifying mongoDB to update class with public URL: ${publicUrl}`);
    await axios.post('/Api/classes/update', { classId, recordingUrl: publicUrl });
    
    console.log(`[${classId}] recordingUrl updated in mongoDB.`);

    // 4. Trigger background processing
    toast('Video evaluation and performance video generation have started.');

    // Trigger evaluation process (fire-and-forget)
    axios.post(`/Api/proxy/evaluate-video?item_id=${classId}`)
      .catch((evalError) => {
        console.error(`[${classId}] Failed to start evaluation:`, evalError.message);
      });
    
    // Trigger highlight generation process (fire-and-forget)
    axios.post(`/Api/proxy/generate-highlights?item_id=${classId}`)
      .catch((highlightError) => {
        console.error(`[${classId}] Failed to start highlight generation:`, highlightError.message);
      });

  } catch (err) {
    const error = err as AxiosError<{ error: string }>;
    console.error(`[${classId}] Upload process failed:`, error.message);
    toast.error(error.response?.data?.error || 'Failed to upload recording.');
  } finally {
    setUploadLoading((prev) => ({ ...prev, [classId]: false }));
    console.log(`[${classId}] Upload process finished.`);
    const inputRef = fileInputRefs.current[classId];
    if (inputRef) {
      inputRef.value = '';
    }
  }
};

const triggerFileInput = (classId: string) => {
  const inputRef = fileInputRefs.current[classId];
  if (inputRef) inputRef.click();
};

const getButtonText = (classId: string, isUploading: boolean) => {
  if (isUploading) return 'Uploading...';
  // You can add logic here to check if recording exists
  return 'Upload Recording';
};
  
  if (error) {
    return (
      <div className='feedback-pending-details-sec'>
        <div className='feed-back-heading'>
          <h2>Feedback Pending</h2>
        </div>
        <div className='alert alert-danger mt-4'>
          Error: {error}
        </div>
      </div>
    );
  }
  
  if (pendingFeedbacks.length === 0) {
    return (
      <div className='feedback-pending-details-sec'>
        <div className='feed-back-heading'>
          <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
            <div className='left-head'>
              <h2 className='m-0'>Feedback Pending</h2>
            </div>
            <div className='right-form'>
              <Link href="/tutor" className='link-text'>Back to Dashboard</Link>
            </div>
          </div>
        </div>
        <div className='alert alert-success mt-4 text-center'>
          <h4>🎉 All Caught Up!</h4>
          <p>No pending feedbacks at this time. Great job staying on top of your student evaluations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='feedback-pending-details-sec'>
      <div className='feed-back-heading'>
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-md-3 flex-xl-nowrap flex-wrap">
            <div className='left-head'>
                <h2 className='m-0'>Feedback Pending ({pendingFeedbacks.length} students)</h2>
            </div>
            <div className='right-form'>
               <Link href="/tutor" className='link-text'>Back to Dashboard</Link>
            </div>
        </div>
        <hr className='hr-light'/>
      </div>
      <div className='feedback-pending-box d-flex flex-wrap'>
        <div className='feedback-left-box'>
          <div className='feedback-box-scroll'>
            {pendingFeedbacks.map((feedback, index) => (
              <div 
                key={`${feedback.student._id}-${index}`} 
                className={`card-feedback ${selectedFeedback?.student._id === feedback.student._id ? 'active' : ''}`}
                onClick={() => handleSelectStudent(feedback)}
              >
                <div className='feedback-img-text'>
                  <ul className='list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                    <li className='d-flex align-items-center gap-2'>
                      {feedback.student.profileImage ? (
                        <Image 
                          src={feedback.student.profileImage} 
                          alt={feedback.student.username} 
                          width={40} 
                          height={40}
                          className="rounded-circle"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="student-initials" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#ff8c00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {feedback.student.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h3>{feedback.student.username}</h3>
                    </li>
                    <li>
                      <span className='pending'>
                        {feedback.classes.length} {feedback.classes.length === 1 ? 'class' : 'classes'}
                      </span>
                    </li>
                  </ul>
                </div>
                <ul className='chat-list-box list-unstyled p-0 m-0'>
                  {feedback.classes.map((cls, classIndex) => (
                    <li 
                      key={cls._id} 
                      className={`card-chat ${feedback.selectedClassIndex === classIndex && selectedFeedback?.student._id === feedback.student._id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClass(index, classIndex);
                      }}
                    >
                      {cls.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {selectedFeedback && (
          <div className='feedback-right-box'>
            <div className='feedback-box'>
              <div className='head-feedback d-flex align-items-center gap-2 justify-content-between flex-md-nowrap flex-wrap'>
                <div className='text-head-feedback'>
                  <h2>Student Performance Evaluation</h2>
                  <p>
                    <strong>{selectedFeedback.student.username}</strong> - {selectedFeedback.classes[selectedFeedback.selectedClassIndex].title}
                  </p>
                </div>
                <div className='btn-right'>
                  <div className='btn-right d-flex gap-2'>
  {/* Hidden file input */}
  <input
    type="file"
    accept="video/*"
    className="d-none"
    ref={el => { 
      if (selectedFeedback) {
        fileInputRefs.current[selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id] = el; 
      }
    }}
    onChange={(e) => {
      if (selectedFeedback) {
        handleFileChange(selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id, e);
      }
    }}
  />
  
<button 
    onClick={() => {
      if (selectedFeedback) {
        triggerFileInput(selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id);
      }
    }}
    disabled={selectedFeedback ? uploadLoading[selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id] : false}
    style={{ 
      backgroundColor: selectedFeedback && uploadLoading[selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id] ? '#a855f7' : '#9333ea',
      color: '#ffffff',
      border: 'none',
      boxShadow: selectedFeedback && !uploadLoading[selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id] 
        ? '0 0 12px rgba(147, 51, 234, 0.4)' 
        : 'none',
      transition: 'all 0.3s ease'
    }}
    className='btn-link d-flex align-items-center gap-2 justify-content-center px-3 py-2 rounded'
  >
    <Upload size={16} />
    <span>
      {selectedFeedback && getButtonText(
        selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id,
        uploadLoading[selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id] || false
      )}
    </span>
  </button>
</div>
                </div>
              </div>
              <div className='bottom-feedback-box row'>
                <div className='col-xxl-6 mb-0'>
                  <div className='progressbar-line-sec'>
                    {/* Rhythm */}
                    <div className="card-box mb-3">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Rhythm</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.rhythm}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.rhythm}
                          onChange={(e) => handleSliderChange('rhythm', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.rhythm * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.rhythm * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>

                    {/* Understanding */}
                    <div className="card-box mb-3">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Understanding of Topic</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.understanding}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.understanding}
                          onChange={(e) => handleSliderChange('understanding', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.understanding * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.understanding * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>

                    {/* Ear Training */}
                    <div className="card-box mb-3">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Ear Training</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.earTraining}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.earTraining}
                          onChange={(e) => handleSliderChange('earTraining', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.earTraining * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.earTraining * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>

                    {/* Technique */}
                    <div className="card-box mb-0">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Technique</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.technique}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.technique}
                          onChange={(e) => handleSliderChange('technique', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.technique * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.technique * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-xxl-6 mb-4'>
                  <div className='progressbar-line-sec'>
                    {/* Theoretical Understanding */}
                    <div className="card-box mb-3">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Theoretical Understanding</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.theoretical}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.theoretical}
                          onChange={(e) => handleSliderChange('theoretical', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.theoretical * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.theoretical * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="card-box mb-3">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Performance</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.performance}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.performance}
                          onChange={(e) => handleSliderChange('performance', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.performance * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.performance * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>

                    {/* Assignment */}
                    <div className="card-box mb-0">
                      <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                        <h6 className="mb-0">Assignment</h6>
                        <div className="right-text-box red-text">
                          <span className='main-text'>{feedbackData.assignment}</span>
                          <span className="text-muted">/10</span>
                        </div>
                      </div>
                      <div className="progress-slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feedbackData.assignment}
                          onChange={(e) => handleSliderChange('assignment', parseInt(e.target.value))}
                          className="form-range mb-2"
                        />
                        {/* <ProgressBar now={feedbackData.assignment * 10} style={{ height: "8px", backgroundColor: "#eee" }}>
                          <div style={{ width: `${feedbackData.assignment * 10}%`, height: "100%", backgroundColor: "#7b2ff7", borderRadius: "6px" }}></div>
                        </ProgressBar> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bottom-recording-box'>
                  <p><strong>Personal Feedback & Area for Improvement</strong></p>
                  <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                      <Form.Control 
                        as="textarea" 
                        rows={5} 
                        placeholder='Provide detailed feedback and suggestions for improvement...'
                        value={feedbackData.feedback}
                        onChange={(e) => handleTextChange(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                  <div className='d-flex align-items-end justify-content-end mt-4'>
                    <Button 
                      type='button' 
                      className='btn btn-primary'
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Evaluation'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPendingDetails;