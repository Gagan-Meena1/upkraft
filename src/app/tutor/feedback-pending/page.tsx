"use client"
import React, { useState, useEffect } from 'react'
import ProgressBar from "react-bootstrap/ProgressBar";
import { Button, Form } from 'react-bootstrap'
import Link from 'next/link'
import StudentProfileImg from '../../../assets/student-profile-img.png'
import './FeedbackPendingDetails.css'
import Image from 'next/image';

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
                  <Link href={`/tutor/video-recording?classId=${selectedFeedback.classes[selectedFeedback.selectedClassIndex]._id}`} className='btn-link border-box d-flex align-items-center gap-2 justify-content-center'>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3333 10.0001C13.5101 10.0001 13.6797 10.0703 13.8047 10.1953C13.9298 10.3203 14 10.4899 14 10.6667V13.3334C14 13.687 13.8595 14.0261 13.6095 14.2762C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2762C2.14048 14.0261 2 13.687 2 13.3334V10.6667C2 10.4899 2.07024 10.3203 2.19526 10.1953C2.32029 10.0703 2.48986 10.0001 2.66667 10.0001C2.84348 10.0001 3.01305 10.0703 3.13807 10.1953C3.2631 10.3203 3.33333 10.4899 3.33333 10.6667V13.3334H12.6667V10.6667C12.6667 10.4899 12.7369 10.3203 12.8619 10.1953C12.987 10.0703 13.1565 10.0001 13.3333 10.0001ZM8.58933 2.31605L11.3 5.02672C11.3637 5.08822 11.4145 5.16178 11.4494 5.24312C11.4843 5.32445 11.5027 5.41193 11.5035 5.50045C11.5043 5.58897 11.4874 5.67676 11.4539 5.75869C11.4204 5.84062 11.3709 5.91506 11.3083 5.97765C11.2457 6.04025 11.1712 6.08975 11.0893 6.12327C11.0074 6.15679 10.9196 6.17366 10.8311 6.17289C10.7425 6.17212 10.6551 6.15373 10.5737 6.11879C10.4924 6.08385 10.4188 6.03306 10.3573 5.96939L8.66667 4.28006V10.6667C8.66667 10.8435 8.59643 11.0131 8.4714 11.1381C8.34638 11.2632 8.17681 11.3334 8 11.3334C7.82319 11.3334 7.65362 11.2632 7.5286 11.1381C7.40357 11.0131 7.33333 10.8435 7.33333 10.6667V4.27939L5.64267 5.96939C5.51693 6.09083 5.34853 6.15802 5.17373 6.1565C4.99893 6.15499 4.83173 6.08487 4.70812 5.96127C4.58452 5.83766 4.5144 5.67045 4.51288 5.49566C4.51136 5.32086 4.57856 5.15246 4.7 5.02672L7.41067 2.31605C7.48805 2.23865 7.57993 2.17725 7.68105 2.13535C7.78217 2.09346 7.89055 2.0719 8 2.0719C8.10945 2.0719 8.21783 2.09346 8.31895 2.13535C8.42007 2.17725 8.51195 2.23865 8.58933 2.31605Z" fill="#6E09BD"/></svg>
                    <span>Upload Recording</span>
                  </Link>
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