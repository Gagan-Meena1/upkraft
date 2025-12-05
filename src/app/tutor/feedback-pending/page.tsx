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
  courseCategory?: string; // added
  feedbackModelRequired?: string; // added (from API)
}

interface Course {
  _id: string;
  title: string;
  class: string[];
}

// Category → fields (keys must match model/API field names)
const CATEGORY_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  Music: [
    { key: "rhythm", label: "Rhythm" },
    { key: "theoreticalUnderstanding", label: "Theoretical Understanding" },
    { key: "performance", label: "Performance" },
    { key: "earTraining", label: "Ear Training" },
    { key: "assignment", label: "Assignment" },
    { key: "technique", label: "Technique" },
  ],
  Dance: [
    { key: "technique", label: "Technique" },
    { key: "musicality", label: "Musicality" },
    { key: "retention", label: "Retention" },
    { key: "performance", label: "Performance" },
    { key: "effort", label: "Effort" },
  ],
  Drawing: [
    { key: "observationalSkills", label: "Observational Skills" },
    { key: "lineQuality", label: "Line Quality" },
    { key: "proportionPerspective", label: "Proportion & Perspective" },
    { key: "valueShading", label: "Value & Shading" },
    { key: "compositionCreativity", label: "Composition & Creativity" },
  ],
  Vocal: [
    { key: "vocalTechniqueAndControl", label: "Vocal Technique & Control" },
    { key: "toneQualityAndRange", label: "Tone Quality & Range" },
    { key: "rhythmTimingAndMusicality", label: "Rhythm, Timing & Musicality" },
    { key: "dictionAndArticulation", label: "Diction & Articulation" },
    { key: "expressionAndPerformance", label: "Expression & Performance" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
  Drums: [
    { key: "techniqueAndFundamentals", label: "Technique & Fundamentals" },
    { key: "timingAndTempo", label: "Timing & Tempo" },
    { key: "coordinationAndIndependence", label: "Coordination & Independence" },
    { key: "dynamicsAndMusicality", label: "Dynamics & Musicality" },
    { key: "patternKnowledgeAndReading", label: "Pattern Knowledge & Reading" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
  Violin: [
    { key: "postureAndInstrumentHold", label: "Posture & Instrument Hold" },
    { key: "bowingTechnique", label: "Bowing Technique" },
    { key: "intonationAndPitchAccuracy", label: "Intonation & Pitch Accuracy" },
    { key: "toneQualityAndSoundProduction", label: "Tone Quality & Sound Production" },
    { key: "rhythmMusicalityAndExpression", label: "Rhythm, Musicality & Expression" },
    { key: "progressAndPracticeHabits", label: "Progress & Practice Habits" },
  ],
};

// Default values (1-10 scale) for a category
const buildDefaults = (category?: string) => {
  const fields = CATEGORY_FIELDS[category || "Music"] || CATEGORY_FIELDS["Music"];
  const values: Record<string, number | string> = { personalFeedback: "" };
  fields.forEach(f => (values[f.key] = 5));
  return values;
};

// Choose submit API by category/model
const getSubmitEndpoint = (category?: string, feedbackModelRequired?: string) => {
  switch (feedbackModelRequired) {
    case "feedbackDance":
      return "/Api/studentFeedback/dance";
    case "feedbackDrawing":
      return "/Api/studentFeedback/drawing";
    // Fallbacks by known categories
    default: {
      switch (category) {
        case "Dance":
          return "/Api/studentFeedback/dance";
        case "Drawing":
          return "/Api/studentFeedback/drawing";
        case "Vocal":
          return "/Api/studentFeedback/vocal";
        case "Drums":
          return "/Api/studentFeedback/drums";
        case "Violin":
          return "/Api/studentFeedback/violin";
        default:
          return "/Api/studentFeedback"; // Music
      }
    }
  }
};

const FeedbackPendingDetails = () => {
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<PendingFeedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});  // ADD THIS
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({}); 
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [showAbsentConfirm, setShowAbsentConfirm] = useState(false);

  // Replace fixed shape with dynamic map per category
  const [feedbackData, setFeedbackData] = useState<Record<string, number | string>>(buildDefaults("Music"));

  // Derived category helpers for header badge and dynamic fields
  const currentCategory =
    selectedFeedback?.classes[selectedFeedback.selectedClassIndex]?.courseCategory || "Music";
  const currentFields = CATEGORY_FIELDS[currentCategory] || CATEGORY_FIELDS["Music"];
  const splitIndex = Math.ceil(currentFields.length / 2);

  // Fetch data on component mount
  useEffect(() => {
    const fetchPendingFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Api/pendingFeedback');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load pending feedbacks');
        }

        const pendingFeedbacks: PendingFeedback[] = [];
        const studentMap = new Map<string, { student: Student, classes: Class[] }>();

        data.missingFeedbackClasses.forEach((item: any) => {
          const studentId = item.studentId;

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              student: {
                _id: item.studentId,
                username: item.studentName,
                email: '',
                profileImage: item.profileImage || undefined,
              },
              classes: []
            });
          }

          studentMap.get(studentId)!.classes.push({
            _id: item.classId,
            title: item.className,
            description: '',
            startTime: item.classDate || '',
            endTime: '',
            course: item.courseId,
            courseCategory: item.courseCategory, // keep category
            feedbackModelRequired: item.feedbackModelRequired, // keep model
          });
        });

        studentMap.forEach((value) => {
          pendingFeedbacks.push({
            student: value.student,
            classes: value.classes,
            selectedClassIndex: 0
          });
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
  
  // Re-init sliders when selection changes (student or class)
  useEffect(() => {
    if (!selectedFeedback) return;
    const currentClass = selectedFeedback.classes[selectedFeedback.selectedClassIndex];
    const category = currentClass?.courseCategory || "Music";
    setFeedbackData(buildDefaults(category));
    setAttendanceStatus('present');
  }, [selectedFeedback]);

  const handleSelectStudent = (feedback: PendingFeedback) => {
    setSelectedFeedback(feedback);
  };

  const handleSelectClass = (feedbackIndex: number, classIndex: number) => {
    const updatedFeedbacks = [...pendingFeedbacks];
    updatedFeedbacks[feedbackIndex].selectedClassIndex = classIndex;
    setPendingFeedbacks(updatedFeedbacks);
    setSelectedFeedback(updatedFeedbacks[feedbackIndex]);
  };

  const handleSliderChange = (key: string, value: number) => {
    setFeedbackData(prev => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (value: string) => {
    setFeedbackData(prev => ({ ...prev, personalFeedback: value }));
  };
  
  const handleSubmit = async () => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    const student = selectedFeedback.student;
    const classData = selectedFeedback.classes[selectedFeedback.selectedClassIndex];

    try {
      const courseId = classData.course;
      const classId = classData._id;
      const studentId = student._id;
      const category = classData.courseCategory || "Music";
      const endpoint = getSubmitEndpoint(category, classData.feedbackModelRequired);

      // Build payload from current category fields
      const fields = CATEGORY_FIELDS[category] || CATEGORY_FIELDS["Music"];
      const payload: any = {
        attendanceStatus,
        studentId,
        courseId,
        classId,
        personalFeedback: String(feedbackData.personalFeedback || ""),
      };
      fields.forEach(f => {
        const v = feedbackData[f.key];
        // Coerce number fields to string/number (API can accept either as models use String)
        payload[f.key] = typeof v === "number" ? v : Number(v) || 5;
      });

      const response = await fetch(
        `${endpoint}?studentId=${studentId}&courseId=${courseId}&classId=${classId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Remove the submitted class from the list
        let updatedFeedbacks = [...pendingFeedbacks];
        const currentFeedbackIndex = updatedFeedbacks.findIndex(
          f => f.student._id === studentId
        );

        if (currentFeedbackIndex !== -1) {
          const currentFeedback = updatedFeedbacks[currentFeedbackIndex];
          const remainingClasses = currentFeedback.classes.filter(c => c._id !== classId);

          if (remainingClasses.length > 0) {
            updatedFeedbacks[currentFeedbackIndex] = {
              ...currentFeedback,
              classes: remainingClasses,
              selectedClassIndex: 0
            };
          } else {
            updatedFeedbacks.splice(currentFeedbackIndex, 1);
          }
        }

        setPendingFeedbacks(updatedFeedbacks);

        if (updatedFeedbacks.length > 0) {
          const nextIndex = Math.min(
            Math.max(0, updatedFeedbacks.findIndex(f => f.student._id === studentId)),
            updatedFeedbacks.length - 1
          );
          setSelectedFeedback(updatedFeedbacks[nextIndex] || updatedFeedbacks[0]);
        } else {
          setSelectedFeedback(null);
        }

        setAttendanceStatus('present');
        // Reset form to defaults for next selected item (use effect will also reset)
        const nextCat =
          updatedFeedbacks.length && updatedFeedbacks[0].classes.length
            ? updatedFeedbacks[0].classes[0].courseCategory
            : "Music";
        setFeedbackData(buildDefaults(nextCat));

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

  const handleMarkAbsent = async () => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    const student = selectedFeedback.student;
    const classData = selectedFeedback.classes[selectedFeedback.selectedClassIndex];

    try {
      const studentId = student._id;
      const classId = classData._id;

      const response = await fetch(
        `/Api/attendance?studentId=${studentId}&classId=${classId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'absent',
            studentId,
            classId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        // same remove-logic...
        let updatedFeedbacks = [...pendingFeedbacks];
        const currentFeedbackIndex = updatedFeedbacks.findIndex(
          f => f.student._id === studentId
        );
        if (currentFeedbackIndex !== -1) {
          const currentFeedback = updatedFeedbacks[currentFeedbackIndex];
          const remainingClasses = currentFeedback.classes.filter(c => c._id !== classId);

          if (remainingClasses.length > 0) {
            updatedFeedbacks[currentFeedbackIndex] = {
              ...currentFeedback,
              classes: remainingClasses,
              selectedClassIndex: 0
            };
          } else {
            updatedFeedbacks.splice(currentFeedbackIndex, 1);
          }
        }

        setPendingFeedbacks(updatedFeedbacks);

        if (updatedFeedbacks.length > 0) {
          const nextIndex = Math.min(currentFeedbackIndex, updatedFeedbacks.length - 1);
          setSelectedFeedback(updatedFeedbacks[nextIndex]);
        } else {
          setSelectedFeedback(null);
        }

        setAttendanceStatus('present');
        setShowAbsentConfirm(false);
        const nextCat =
          updatedFeedbacks.length && updatedFeedbacks[0].classes.length
            ? updatedFeedbacks[0].classes[0].courseCategory
            : "Music";
        setFeedbackData(buildDefaults(nextCat));

        alert('Student marked as absent successfully!');
      } else {
        alert(result.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowAbsentConfirm(false);
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
                          backgroundColor: 'purple',
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
      <span className="ms-2 badge bg-secondary">{currentCategory}</span>
    </p>
  </div>
  <div className='btn-right d-flex gap-2 align-items-center flex-wrap'>
    {/* Attendance Dropdown */}
    <div className="dropdown">
      <button
        className="btn dropdown-toggle"
        type="button"
        id="attendanceDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          backgroundColor: attendanceStatus === 'present' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          border: 'none',
          minWidth: '120px'
        }}
      >
        {attendanceStatus === 'present' ? '✓ Present' : '✗ Absent'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="attendanceDropdown">
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setAttendanceStatus('present');
              setShowAbsentConfirm(false);
            }}
          >
            ✓ Present
          </a>
        </li>
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowAbsentConfirm(true);
            }}
          >
            ✗ Absent
          </a>
        </li>
      </ul>
    </div>

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
              <div className='bottom-feedback-box row'>
                <div className='col-xxl-6 mb-0'>
                  <div className='progressbar-line-sec'>
                    {currentFields.slice(0, splitIndex).map(field => (
                      <div className="card-box mb-3" key={field.key}>
                        <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                          <h6 className="mb-0">{field.label}</h6>
                          <div className="right-text-box red-text">
                            <span className='main-text'>{Number(feedbackData[field.key] ?? 5)}</span>
                            <span className="text-muted">/10</span>
                          </div>
                        </div>
                        <div className="progress-slider-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={Number(feedbackData[field.key] ?? 5)}
                            onChange={(e) => handleSliderChange(field.key, parseInt(e.target.value))}
                            className="form-range mb-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='col-xxl-6 mb-4'>
                  <div className='progressbar-line-sec'>
                    {currentFields.slice(splitIndex).map(field => (
                      <div className="card-box mb-3" key={field.key}>
                        <div className="d-flex align-items-center gap-2 justify-content-between mb-2">
                          <h6 className="mb-0">{field.label}</h6>
                          <div className="right-text-box red-text">
                            <span className='main-text'>{Number(feedbackData[field.key] ?? 5)}</span>
                            <span className="text-muted">/10</span>
                          </div>
                        </div>
                        <div className="progress-slider-container">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={Number(feedbackData[field.key] ?? 5)}
                            onChange={(e) => handleSliderChange(field.key, parseInt(e.target.value))}
                            className="form-range mb-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='bottom-recording-box'>
                  <p><strong>Personal Feedback & Area for Improvement</strong></p>
                  <Form>
                    <Form.Group className="mb-3" controlId="feedbackTextarea">
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder='Provide detailed feedback and suggestions for improvement...'
                        value={String(feedbackData.personalFeedback || "")}
                        onChange={(e) => handleTextChange(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                  <div className='d-flex align-items-end justify-content-end mt-4 gap-2'>
  {attendanceStatus === 'present' ? (
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
  ) : (
    <Button 
      type='button' 
      className='btn btn-danger'
      onClick={handleMarkAbsent}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Marking Absent...
        </>
      ) : (
        'Confirm & Mark Absent'
      )}
    </Button>
  )}
</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Absent Confirmation Modal */}
{showAbsentConfirm && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Mark as Absent</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowAbsentConfirm(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to mark <strong>{selectedFeedback?.student.username}</strong> as absent for <strong>{selectedFeedback?.classes[selectedFeedback.selectedClassIndex].title}</strong>?</p>
          <p className="text-muted small">This will skip the evaluation form and only record the absence.</p>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              setShowAbsentConfirm(false);
              setAttendanceStatus('present');
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => {
              setAttendanceStatus('absent');
              setShowAbsentConfirm(false);
                  handleMarkAbsent(); // ADD THIS LINE - Actually trigger the API call

            }}
          >
            Yes, Mark Absent
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FeedbackPendingDetails;